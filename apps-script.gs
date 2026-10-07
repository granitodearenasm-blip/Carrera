/**
 * ============================================================================
 *  GOOGLE SHEETS — guarda inscripciones y asigna números CONSECUTIVOS
 *  (Este archivo NO se sube al hosting. Se pega en Google Apps Script.)
 * ============================================================================
 *
 *  PASOS:
 *  1. Crea una hoja nueva en Google Sheets.
 *  2. Menú Extensiones → Apps Script. Borra lo que aparezca y pega TODO este archivo.
 *  3. Cambia PRIMER_NUMERO si quieres empezar en otro número.
 *  4. Botón "Implementar" → "Nueva implementación" → tipo "Aplicación web".
 *       - Ejecutar como: Yo
 *       - Quién tiene acceso: Cualquier persona
 *  5. Autoriza los permisos y copia la URL que termina en /exec.
 *  6. En script.js → CONFIG: pon  modo: 'sheets'  y pega la URL en urlGoogleSheets.
 *
 *  Si después cambias este código, usa "Implementar → Gestionar implementaciones →
 *  Editar → Versión nueva" para que se apliquen los cambios con la misma URL.
 */

var PRIMER_NUMERO = 101;
var HOJA = 'Inscripciones';
var ENCABEZADOS = ['Fecha', 'Tipo', 'Grupo', 'Responsable', 'Número', 'Nombre', 'Edad', 'Sexo',
  'Distancia', 'Talla', 'Correo', 'Teléfono', 'Emergencia (nombre)', 'Emergencia (tel.)', 'Total del registro'];

function hoja_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(HOJA) || ss.insertSheet(HOJA);
  if (sh.getLastRow() === 0) sh.appendRow(ENCABEZADOS);
  return sh;
}

function siguienteNumero_(sh) {
  var props = PropertiesService.getScriptProperties();
  var n = parseInt(props.getProperty('siguiente'), 10);
  return isNaN(n) ? PRIMER_NUMERO : n;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// GET ?accion=siguiente → la página consulta el siguiente número disponible
function doGet(e) {
  return json_({ ok: true, siguiente: siguienteNumero_(hoja_()) });
}

// POST → guarda la inscripción y devuelve los números asignados
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // evita que dos inscripciones simultáneas reciban el mismo número
  try {
    var d = JSON.parse(e.postData.contents);
    var sh = hoja_();
    var inicio = siguienteNumero_(sh);
    var numeros = [];

    d.corredores.forEach(function (r, i) {
      var num = inicio + i; // consecutivos dentro del grupo
      numeros.push(num);
      sh.appendRow([
        new Date(), d.tipo, d.grupo || '', d.responsable || r.nombre, num, r.nombre, r.edad, r.sexo,
        r.categoria, r.talla, r.correo || d.correo, "'" + (r.telefono || d.telefono),
        r.emergenciaNombre, "'" + r.emergenciaTelefono, i === 0 ? d.total : ''
      ]);
    });

    PropertiesService.getScriptProperties().setProperty('siguiente', String(inicio + numeros.length));
    return json_({ ok: true, numeros: numeros });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
