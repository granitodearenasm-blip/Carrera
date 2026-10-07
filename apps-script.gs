/**
 * ============================================================================
 *  GOOGLE SHEETS — registros de emprendedores de la expo
 *  (Este archivo NO se sube al hosting. Se pega en Google Apps Script.)
 * ============================================================================
 *  Hace tres cosas:
 *   1. Guarda cada registro del formulario en la pestaña "Registros".
 *   2. Si el emprendedor subió su logo, lo guarda en Google Drive (carpeta
 *      "Logos Expo Emprendedores") y pone en la hoja un enlace directo a la imagen.
 *   3. Le da a la página la lista de emprendedores CONFIRMADOS, para que aparezcan solos
 *      en "Conoce a los emprendedores" y se descuenten las mesas de cada día.
 *
 *  PASOS (primera vez):
 *  1. Crea una hoja nueva en Google Sheets.
 *  2. Menú Extensiones → Apps Script. Borra lo que aparezca y pega TODO este archivo.
 *  3. Arriba, elige la función "autorizar" y presiona ▶ Ejecutar. Acepta los permisos
 *     (Hojas de cálculo y Google Drive). Esto solo se hace una vez.
 *  4. Implementar → Nueva implementación → tipo "Aplicación web".
 *       - Ejecutar como: Yo
 *       - Quién tiene acceso: Cualquier persona
 *  5. Copia la URL que termina en /exec y pégala en script.js → CONFIG.urlGoogleSheets (modo: 'sheets').
 *
 *  SI YA LO TENÍAS IMPLEMENTADO (actualizar):
 *  1. Pega este archivo completo, guarda y ejecuta la función "autorizar" (paso 3 de arriba).
 *  2. Implementar → Gestionar implementaciones → ✏️ Editar → Versión: Nueva versión → Implementar.
 *     (La URL /exec no cambia.)
 *
 *  PARA PUBLICAR A UN EMPRENDEDOR EN LA PÁGINA:
 *  cuando pague, escribe "Sí" en su columna "Confirmado". Al recargar la página, su tarjeta aparece
 *  y se descuenta una mesa en cada día que eligió (7 mesas por día).
 *  Si no paga antes de la fecha de "Pagar antes de" (4 días), su registro se cancela: deja "Confirmado" en No.
 *  Solo se publican los que marcaron "Autoriza publicar" = Sí.
 */

var HOJA = 'Registros';
var CARPETA_LOGOS = 'Logos Expo Emprendedores';
var ENCABEZADOS = ['Fecha', 'Negocio', 'Giro', 'Días', 'Núm. días', 'Total', 'Pagar antes de', 'Descripción', 'Instagram', 'Facebook', 'Logo / foto',
  'Responsable', 'Teléfono', 'Correo', 'Acepta reglas', 'Autoriza publicar', 'Pagado', 'Confirmado'];

// Ejecuta esta función UNA VEZ desde el editor para dar permisos de Hojas y Drive.
function autorizar() {
  hoja_();
  carpeta_();
  Logger.log('Permisos listos. Ya puedes implementar o actualizar la aplicación web.');
}

function hoja_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(HOJA) || ss.insertSheet(HOJA);
  if (sh.getLastRow() === 0) { sh.appendRow(ENCABEZADOS); return sh; }
  // Si la hoja es de una versión anterior, agrega al final las columnas que falten (no borra nada)
  var head = encabezados_(sh);
  var faltan = ENCABEZADOS.filter(function (h) { return head.indexOf(h) === -1; });
  if (faltan.length) sh.getRange(1, head.length + 1, 1, faltan.length).setValues([faltan]);
  return sh;
}

function encabezados_(sh) {
  return sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0].map(String);
}

function carpeta_() {
  var it = DriveApp.getFoldersByName(CARPETA_LOGOS);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CARPETA_LOGOS);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Guarda la imagen (base64) en Drive, la comparte como "cualquiera con el enlace" y devuelve un enlace directo
function guardarLogo_(d) {
  var bytes = Utilities.base64Decode(d.logoBase64);
  var nombre = (d.negocio || 'logo') + ' - ' + (d.logoNombre || 'logo.jpg');
  var blob = Utilities.newBlob(bytes, d.logoMime || 'image/jpeg', nombre);
  var file = carpeta_().createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w800';
}

// Convierte enlaces de Google Drive (…/file/d/ID/view, open?id=ID) en un enlace directo a la imagen
// (por si alguien pega a mano en la hoja el enlace de una imagen de Drive)
function imagenUrl_(v) {
  var url = String(v || '').trim();
  if (!/^https?:\/\//i.test(url)) return '';
  if (/drive\.google\.com\/thumbnail/i.test(url)) return url;
  var m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/i);
  return m ? 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w800' : url;
}

// Si Sheets convirtió el día en fecha, lo devuelve como '2026-11-06' para que la página lo reconozca
function diasTexto_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(v || '');
}

// Guarda un registro nuevo
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    var logo = '';
    var logoSubido = false;
    if (d.logoBase64) {
      try { logo = guardarLogo_(d); logoSubido = true; }
      catch (errLogo) { logo = 'No se pudo guardar el logo (' + d.logoNombre + '): ' + errLogo; }
    }
    // Valores por nombre de columna (así no importa el orden de las columnas en la hoja).
    // El apóstrofo (') guarda "Días", "Pagar antes de" y "Teléfono" como TEXTO: si no, Sheets los convierte.
    var valores = {
      'Fecha': new Date(), 'Negocio': d.negocio, 'Giro': d.giro, 'Días': "'" + d.dias, 'Núm. días': d.numDias,
      'Total': d.total, 'Pagar antes de': "'" + d.pagarAntesDe, 'Descripción': d.descripcion,
      'Instagram': d.instagram || '', 'Facebook': d.facebook || '', 'Logo / foto': logo,
      'Responsable': d.responsable, 'Teléfono': "'" + d.telefono, 'Correo': d.correo,
      'Acepta reglas': d.aceptaReglas, 'Autoriza publicar': d.autorizaPublicar, 'Pagado': 'No', 'Confirmado': 'No'
    };
    var sh = hoja_();
    sh.appendRow(encabezados_(sh).map(function (h) { return valores.hasOwnProperty(h) ? valores[h] : ''; }));
    return json_({ ok: true, logo: logoSubido });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Devuelve solo los datos públicos de los emprendedores confirmados (nunca teléfonos ni correos)
function doGet(e) {
  var rows = hoja_().getDataRange().getValues();
  var head = rows.shift();
  var col = function (name) { return head.indexOf(name); };
  var si = function (v) { return String(v).trim().toLowerCase().replace('í', 'i') === 'si'; };
  var lista = rows.filter(function (r) {
    return si(r[col('Confirmado')]) && si(r[col('Autoriza publicar')]);
  }).map(function (r) {
    var celda = function (name) { var i = col(name); return i === -1 ? '' : String(r[i] || '').trim(); };
    // Compatibilidad con registros antiguos que tenían una sola columna "Red social"
    var vieja = celda('Red social');
    var ig = celda('Instagram') || (/instagram/i.test(vieja) ? vieja : '');
    var fb = celda('Facebook') || (/facebook|fb\.(com|me)/i.test(vieja) ? vieja : '');
    return {
      nombre: celda('Negocio'),
      giro: celda('Giro'),
      descripcion: celda('Descripción'),
      imagen: imagenUrl_(r[col('Logo / foto')]),
      dias: diasTexto_(r[col('Días')]),
      instagram: ig,
      facebook: fb
    };
  });
  return json_({ ok: true, emprendedores: lista });
}
