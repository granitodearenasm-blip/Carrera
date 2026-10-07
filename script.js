/* ==========================================================================
   Expo Emprendedores con Causa — script.js
   JavaScript puro, sin librerías.
   ========================================================================== */

/* ==========================================================================
   ✏️ LISTA DE EMPRENDEDORES
   --------------------------------------------------------------------------
   La sección "Conoce a los emprendedores" se llena de DOS formas (puedes usar una o ambas):

   A) AUTOMÁTICA desde Google Sheets (recomendada):
      Cuando conectes la hoja (ver CONFIG.urlGoogleSheets y apps-script.gs), cada registro
      que marquen en la hoja con "Confirmado" = Sí (y que haya autorizado publicar) aparece
      solo en la página. No hay que tocar el código.

   B) MANUAL: agrega negocios en esta lista. Cada negocio es un bloque { ... } separado por coma:
        nombre:      nombre del negocio
        giro:        'artesanias' | 'ropa' | 'belleza' | 'servicios' | 'otro'
        descripcion: texto corto (máx. 150 caracteres; en la tarjeta se ven 2 líneas)
        imagen:      ruta o enlace del logo/foto, por ejemplo 'assets/img/emprendedores/mi-negocio.jpg'
                     (vacío '' = se muestran sus iniciales con fondo de color)
        instagram:   enlace de Instagram (opcional; vacío '' = no se muestra botón)
        facebook:    enlace de Facebook (opcional; vacío '' = no se muestra botón)
        dias:        días en que participa (para descontar mesas): ['2026-11-06', '2026-11-07', '2026-11-08']
      Ejemplo:
        { nombre: 'Mi Negocio', giro: 'artesanias', descripcion: 'Piezas de barro pintadas a mano.', imagen: '', instagram: 'https://www.instagram.com/minegocio', facebook: '', dias: ['2026-11-07'] }

   Mientras no haya ninguno, la página muestra "Muy pronto conocerás a los emprendedores…".
   ========================================================================== */
var EMPRENDEDORES = [];

(function () {
  'use strict';

  /* ========================================================================
     ✏️ CONFIGURACIÓN — cupo, giros, precio, días, pago y conexión
     ======================================================================== */
  var CONFIG = {
    nombreExpo: 'Expo Emprendedores con Causa',

    // ✏️ CUPO: mesas disponibles POR DÍA.
    // Los lugares libres de cada día se calculan solos: mesasPorDia − negocios confirmados ese día.
    // Cuando un día se llena, el formulario lo desactiva.
    mesasPorDia: 7,

    // ✏️ PLAZO para pagar (días después de enviar la solicitud). Si no pagan, el registro se cancela.
    diasParaPagar: 4,

    // Giros (filtros y opciones del formulario). No hay alimentos ni bebidas:
    // la expo es dentro de la cafetería y no se permite vender alimentos preparados ni bebidas.
    // color = fondo de la tarjeta cuando el negocio no tiene foto (tonos de Granito de Arena)
    giros: [
      { id: 'artesanias', nombre: 'Artesanías',        emoji: '🏺', color: 'linear-gradient(135deg,#e4573d,#a8361f)' },
      { id: 'ropa',       nombre: 'Ropa y accesorios', emoji: '👜', color: 'linear-gradient(135deg,#f0b400,#6b4200)' },
      { id: 'belleza',    nombre: 'Belleza',           emoji: '🌸', color: 'linear-gradient(135deg,#f6a07f,#e4573d)' },
      { id: 'servicios',  nombre: 'Servicios',         emoji: '🛠️', color: 'linear-gradient(135deg,#6b4200,#e4573d)' },
      { id: 'otro',       nombre: 'Otro',              emoji: '✨', color: 'linear-gradient(135deg,#ffc800,#e4573d)' }
    ],

    // ✏️ PRECIO por día de participación (debe coincidir con la sección "Para emprendedores" en index.html)
    precioPorDia: 300,

    // ✏️ DÍAS de la expo (opciones del formulario)
    dias: [
      { id: '2026-11-06', nombre: 'Viernes 6 de noviembre' },
      { id: '2026-11-07', nombre: 'Sábado 7 de noviembre' },
      { id: '2026-11-08', nombre: 'Domingo 8 de noviembre' }
    ],

    // ✏️ PAGO: la organización contacta a cada emprendedor para darle los datos de pago.
    pago: {
      whatsapp: '[POR CONFIRMAR: número de WhatsApp]'
    },

    /* --------------------------------------------------------------------
       🔌 CONEXIÓN PARA GUARDAR LOS REGISTROS (y mostrar a los emprendedores confirmados)
       modo:
         'pantalla'  → (actual) no envía nada; muestra los datos para copiarlos.
         'sheets'    → Google Sheets. Pega en urlGoogleSheets la URL de tu Apps Script
                       (termina en /exec). Instrucciones en apps-script.gs.
                       Con esta URL, la página también muestra sola a los emprendedores confirmados.
         'formspree' → Formspree. Pega en urlFormspree tu endpoint (https://formspree.io/f/xxxx)
         'whatsapp'  → abre WhatsApp con los datos para enviarlos a la organización.
       -------------------------------------------------------------------- */
    modo: 'sheets',
    urlGoogleSheets: 'https://script.google.com/macros/s/AKfycbyCBHdxUgg8Q4mYkqqcWw7ie7bNfQ0VYxdwBB864txXWp5hAsTVgnJlKSd7Jn0QfOoU/exec',   // 👉 PEGA AQUÍ la URL de Google Apps Script
    urlFormspree: '',      // 👉 PEGA AQUÍ el endpoint de Formspree
    whatsappOrganizacion: '52XXXXXXXXXX' // 👉 52 + 10 dígitos, sin espacios ni "+" (solo para modo 'whatsapp')
  };
  /* ======================== FIN DE CONFIGURACIÓN ======================== */

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); };
  var pesos = function (n) { return Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }); };
  function safe(fn, name) { try { fn(); } catch (e) { console.error('[' + name + ']', e); } }
  function giro(id) {
    for (var i = 0; i < CONFIG.giros.length; i++) if (CONFIG.giros[i].id === id || CONFIG.giros[i].nombre === id) return CONFIG.giros[i];
    return CONFIG.giros[CONFIG.giros.length - 1];
  }

  /* ---------- Menú ---------- */
  function initNav() {
    var nav = $('#nav'), toggle = $('#navToggle'), menu = $('#navMenu');
    function close() { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', close); });
    window.addEventListener('scroll', function () { nav.classList.toggle('is-scrolled', window.scrollY > 10); }, { passive: true });
    if (!('IntersectionObserver' in window)) return;
    var links = {};
    $$('a[href^="#"]', menu).forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          $$('a', menu).forEach(function (a) { a.classList.remove('is-active'); });
          links[en.target.id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { io.observe(s); });
  }

  /* ---------- Animaciones al hacer scroll ---------- */
  function initReveal() {
    var items = $$('.reveal');
    var showAll = function () { items.forEach(function (el) { el.classList.add('is-visible'); }); };
    if (!('IntersectionObserver' in window)) return showAll();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el); });
    setTimeout(showAll, 6000); // red de seguridad
  }

  /* ---------- Cuenta regresiva ---------- */
  function initCountdown() {
    var box = $('#countdown');
    var target = new Date(box.getAttribute('data-fecha')).getTime();
    if (isNaN(target)) return;
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    var el = { d: $('[data-cd="d"]', box), h: $('[data-cd="h"]', box), m: $('[data-cd="m"]', box), s: $('[data-cd="s"]', box) };
    var timer;
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) { box.classList.add('is-done'); box.textContent = '¡La expo ya comenzó! Te esperamos de 10:00 a 17:00 h 🎉'; clearInterval(timer); return; }
      el.d.textContent = Math.floor(diff / 864e5);
      el.h.textContent = pad(Math.floor(diff / 36e5) % 24);
      el.m.textContent = pad(Math.floor(diff / 6e4) % 60);
      el.s.textContent = pad(Math.floor(diff / 1e3) % 60);
    }
    timer = setInterval(tick, 1000);
    tick();
  }

  /* ---------- Emprendedores: contador, filtros y tarjetas ---------- */
  var lista = [];            // lista final (manual + Google Sheets)
  var filtroActual = 'todos';
  function iniciales(nombre) {
    var cortas = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e'];
    return String(nombre).split(/\s+/).filter(function (p) { return p && cortas.indexOf(p.toLowerCase()) === -1; }).slice(0, 2)
      .map(function (p) { return p.charAt(0).toUpperCase(); }).join('');
  }
  // ¿El emprendedor participa ese día? Acepta el id '2026-11-06', el nombre 'Viernes 6 de noviembre'
  // o una fecha que Google Sheets haya convertido sola (ej. 'Fri Nov 06 2026 00:00:00 GMT-0600').
  var MESES_EN = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
  function participa(e, dia) {
    var d = e.dias;
    if (!d) return false;
    if (typeof d !== 'string') return d.indexOf(dia.id) !== -1 || d.indexOf(dia.nombre) !== -1;
    if (d.indexOf(dia.nombre) !== -1 || d.indexOf(dia.id) !== -1) return true;
    var m = d.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2}) (\d{4})\b/);
    if (m) return (m[3] + '-' + MESES_EN[m[1]] + '-' + ('0' + m[2]).slice(-2)) === dia.id;
    return false;
  }
  function libres(dia) {
    var ocupadas = lista.filter(function (e) { return participa(e, dia); }).length;
    return Math.max(0, CONFIG.mesasPorDia - ocupadas);
  }
  function renderContador() {
    var confirmados = lista.length;
    var disponibles = CONFIG.dias.reduce(function (s, d) { return s + libres(d); }, 0);
    var textoNeg = confirmados === 1 ? 'negocio confirmado' : 'negocios confirmados';
    var textoLug = disponibles === 1 ? 'lugar disponible' : 'lugares disponibles';
    var c = $('#contador');
    if (c) c.innerHTML = '<span><b>' + confirmados + '</b> ' + textoNeg + '</span><span>·</span><span><b>' + disponibles + '</b> ' + textoLug + ' (' + CONFIG.mesasPorDia + ' mesas por día)</span>';
    var html = CONFIG.dias.map(function (d) {
      var n = libres(d);
      return '<div class="cupo-dia' + (n ? '' : ' is-lleno') + '"><span>' + esc(d.nombre) + '</span><b>' +
        (n ? n + ' de ' + CONFIG.mesasPorDia + (n === 1 ? ' mesa libre' : ' mesas libres') : 'Lleno') + '</b></div>';
    }).join('');
    $$('[data-contador-dias]').forEach(function (el) { el.innerHTML = html; });
    // Desactiva en el formulario los días que ya están llenos
    $$('#diasChips input[name="dias"]').forEach(function (inp) {
      var dia = CONFIG.dias.filter(function (d) { return d.id === inp.value; })[0];
      var lleno = dia && !libres(dia);
      inp.disabled = !!lleno;
      if (lleno) inp.checked = false;
      inp.closest('.chip').classList.toggle('is-lleno', !!lleno);
    });
  }
  function renderFiltros() {
    var box = $('#filtros');
    if (!box) return;
    var html = '<button type="button" class="filtro' + (filtroActual === 'todos' ? ' is-active' : '') + '" data-giro="todos">Todos<span>' + lista.length + '</span></button>';
    CONFIG.giros.forEach(function (g) {
      var n = lista.filter(function (e) { return giro(e.giro).id === g.id; }).length;
      html += '<button type="button" class="filtro' + (filtroActual === g.id ? ' is-active' : '') + '" data-giro="' + g.id + '"' + (n ? '' : ' disabled') + '>' + g.emoji + ' ' + esc(g.nombre) + '<span>' + n + '</span></button>';
    });
    box.innerHTML = html;
    box.hidden = lista.length === 0;
  }
  /* Convierte lo que escriban en un enlace válido:
     "@minegocio" o "minegocio" → https://www.instagram.com/minegocio (o facebook.com/…)
     "instagram.com/minegocio" → https://instagram.com/minegocio
     Devuelve '' si está vacío o no es válido. */
  function urlRed(valor, red) {
    var v = String(valor || '').trim();
    if (!v) return '';
    if (/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v)) return v;
    if (/^(www\.)?(instagram|facebook|fb)\.(com|me)\/\S+$/i.test(v)) return 'https://' + v;
    var usuario = v.replace(/^@/, '');
    if (/^[\w.\-]{2,60}$/.test(usuario)) return 'https://www.' + red + '.com/' + usuario;
    return '';
  }
  function tarjeta(e) {
    var g = giro(e.giro);
    var ini = '<span class="emp__iniciales" aria-hidden="true">' + esc(iniciales(e.nombre)) + '</span>';
    var media = e.imagen ? '<img src="' + esc(e.imagen) + '" alt="Logo de ' + esc(e.nombre) + '" loading="lazy" data-ini="' + esc(iniciales(e.nombre)) + '">' : ini;
    // Un botón por cada red que tenga el negocio; si no tiene ninguna, no se muestra botón
    var ig = urlRed(e.instagram, 'instagram'), fb = urlRed(e.facebook, 'facebook');
    if (!ig && !fb && e.red && e.red.url) {  // formato anterior { red: { tipo, url } }
      if (/facebook|fb\.(com|me)/i.test(e.red.url)) fb = urlRed(e.red.url, 'facebook'); else ig = urlRed(e.red.url, 'instagram');
    }
    var botones = '';
    if (ig) botones += '<a class="btn btn--primary" href="' + esc(ig) + '" target="_blank" rel="noopener">Instagram</a>';
    if (fb) botones += '<a class="btn btn--outline" href="' + esc(fb) + '" target="_blank" rel="noopener">Facebook</a>';
    return '<article class="emp">' +
      '<div class="emp__media" style="background:' + g.color + '">' + media + '<span class="emp__giro">' + g.emoji + ' ' + esc(g.nombre) + '</span></div>' +
      '<div class="emp__body"><h3>' + esc(e.nombre) + '</h3><p class="emp__desc">' + esc(e.descripcion) + '</p>' +
        (botones ? '<div class="emp__redes">' + botones + '</div>' : '') +
      '</div>' +
    '</article>';
  }
  function renderTarjetas() {
    var grid = $('#gridEmprendedores');
    if (!grid) return;
    if (!lista.length) {
      grid.innerHTML = '<div class="vacio"><p>Muy pronto conocerás a los emprendedores que nos acompañan.</p><a href="#registro" class="btn btn--primary">Quiero registrar mi negocio</a></div>';
      return;
    }
    var visibles = lista.filter(function (e) { return filtroActual === 'todos' || giro(e.giro).id === filtroActual; });
    grid.innerHTML = visibles.length
      ? visibles.map(tarjeta).join('')
      : '<div class="vacio"><p>Aún no hay negocios en esta categoría.</p><a href="#registro" class="btn btn--primary">Registra el tuyo</a></div>';
    // Si un logo no carga (por ejemplo, un enlace de Drive privado), se muestran las iniciales
    $$('.emp__media img', grid).forEach(function (img) {
      img.addEventListener('error', function () {
        var span = document.createElement('span');
        span.className = 'emp__iniciales';
        span.textContent = img.getAttribute('data-ini');
        img.replaceWith(span);
      });
    });
  }
  function renderEmprendedores() { renderContador(); renderFiltros(); renderTarjetas(); }
  function initEmprendedores() {
    lista = EMPRENDEDORES.slice();
    renderEmprendedores();
    $('#filtros').addEventListener('click', function (e) {
      var btn = e.target.closest('.filtro');
      if (!btn || btn.disabled) return;
      filtroActual = btn.getAttribute('data-giro');
      renderFiltros();
      renderTarjetas();
    });
    // Emprendedores confirmados desde Google Sheets (se actualiza solo)
    if (!CONFIG.urlGoogleSheets) return;
    fetch(CONFIG.urlGoogleSheets + '?accion=emprendedores')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.ok || !Array.isArray(d.emprendedores)) return;
        lista = EMPRENDEDORES.concat(d.emprendedores);
        renderEmprendedores();
      })
      .catch(function (err) { console.warn('[emprendedores] No se pudo leer la hoja:', err); });
  }

  /* ---------- Ventanas ---------- */
  function openModal(d) { if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', ''); }
  function closeModal(d) { if (typeof d.close === 'function') d.close(); else d.removeAttribute('open'); }
  function initModals() {
    $$('[data-open]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); openModal(document.getElementById(a.getAttribute('data-open'))); });
    });
    $$('dialog').forEach(function (d) {
      $$('[data-close]', d).forEach(function (b) { b.addEventListener('click', function () { closeModal(d); }); });
      d.addEventListener('click', function (e) { if (e.target === d) closeModal(d); });
    });
    $('#copyData').addEventListener('click', function () {
      var ta = $('#dataOutput'), btn = this;
      var done = function () { btn.textContent = '✅ ¡Copiado!'; setTimeout(function () { btn.textContent = '📋 Copiar datos'; }, 2000); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); document.execCommand('copy'); done(); });
      else { ta.select(); document.execCommand('copy'); done(); }
    });
  }

  /* ---------- Formulario de registro ---------- */
  var onlyDigits = function (s) { return String(s).replace(/\D/g, ''); };
  function diasElegidos(form) {
    return $$('input[name="dias"]:checked', form).map(function (c) { return c.value; });
  }
  function renderTotal(form) {
    var n = diasElegidos(form).length, out = $('#diasTotal');
    out.innerHTML = n
      ? n + (n === 1 ? ' día' : ' días') + ' × ' + pesos(CONFIG.precioPorDia) + ' = <strong>' + pesos(n * CONFIG.precioPorDia) + '</strong>'
      : 'Elige al menos un día · ' + pesos(CONFIG.precioPorDia) + ' por día';
  }
  function fillForm(form) {
    var g = '<option value="">Selecciona…</option>';
    CONFIG.giros.forEach(function (x) { g += '<option value="' + x.id + '">' + x.emoji + ' ' + esc(x.nombre) + '</option>'; });
    $('[data-opciones="giros"]', form).innerHTML = g;
    $('#diasChips').innerHTML = CONFIG.dias.map(function (d) {
      return '<label class="chip"><input type="checkbox" name="dias" value="' + esc(d.id) + '"><span>📅 ' + esc(d.nombre) + '</span></label>';
    }).join('');
    renderTotal(form);
  }
  function fieldError(input) {
    var v = (input.value || '').trim();
    if (input.type === 'checkbox') return input.required && !input.checked ? 'Debes marcar esta casilla.' : '';
    if (input.type === 'file') {
      var f = input.files && input.files[0];
      if (!f) return '';
      if (!/^image\//.test(f.type)) return 'Sube una imagen (JPG o PNG).';
      return f.size > 15 * 1024 * 1024 ? 'La imagen pesa más de 15 MB.' : '';
    }
    if (input.required && !v) return 'Este campo es obligatorio.';
    if (!v) return '';
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Escribe un correo válido.';
    if (input.hasAttribute('data-telefono') && onlyDigits(v).length !== 10) return 'Escribe 10 dígitos.';
    if (input.hasAttribute('data-red') && !urlRed(v, input.getAttribute('data-red'))) return 'Escribe tu usuario (@minegocio) o el enlace a tu página.';
    if (input.minLength > 0 && v.length < input.minLength) return 'Escribe al menos ' + input.minLength + ' caracteres.';
    return '';
  }
  function showError(input, msg) {
    var wrap = input.type === 'checkbox' ? input.closest('.check') : input.closest('.field');
    if (!wrap) return;
    wrap.classList.toggle('has-error', !!msg);
    if (input.type === 'checkbox') return;
    var err = wrap.querySelector('.field__error');
    if (msg && !err) { err = document.createElement('span'); err.className = 'field__error'; wrap.appendChild(err); }
    if (err) err.textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function showDiasError(form, show) {
    var out = $('#diasTotal');
    out.classList.toggle('is-error', show);
    if (show) out.textContent = 'Elige al menos un día para participar.';
    else renderTotal(form);
  }
  function validate(form) {
    var first = null;
    $$('input, select, textarea', form).forEach(function (inp) {
      if (inp.name === 'dias') return;
      var msg = fieldError(inp);
      showError(inp, msg);
      if (msg && !first) first = inp;
    });
    var sinDias = diasElegidos(form).length === 0;
    showDiasError(form, sinDias);
    if (sinDias && !first) first = $('#diasChips input');
    if (first) {
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function () { first.focus({ preventScroll: true }); }, 400);
    }
    return !first;
  }

  /* ---------- Logo: se reduce y comprime en el navegador antes de enviarlo ----------
     Resultado: JPEG de máx. 800 px (normalmente 50–150 KB) en base64, listo para que
     Apps Script lo guarde como archivo en Google Drive. */
  var LOGO_MAX_PX = 800, LOGO_CALIDAD = 0.82;
  function comprimirImagen(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var escala = Math.min(1, LOGO_MAX_PX / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.max(1, Math.round(img.naturalWidth * escala));
        var h = Math.max(1, Math.round(img.naturalHeight * escala));
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';            // fondo blanco para logos con transparencia
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        var dataUrl = canvas.toDataURL('image/jpeg', LOGO_CALIDAD);
        resolve({ base64: dataUrl.split(',')[1], mime: 'image/jpeg', nombre: file.name.replace(/\.[^.]+$/, '') + '.jpg', dataUrl: dataUrl });
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen. Usa un archivo JPG o PNG.')); };
      img.src = url;
    });
  }
  function initLogoPreview(form) {
    var input = form.elements.logoArchivo, prev = $('#logoPreview');
    if (!input || !prev) return;
    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      if (!f || fieldError(input)) { prev.hidden = true; prev.removeAttribute('src'); return; }
      comprimirImagen(f).then(function (r) { prev.src = r.dataUrl; prev.hidden = false; })
        .catch(function (err) { prev.hidden = true; showError(input, err.message); });
    });
  }

  function initForm() {
    var form = $('#formRegistro');
    fillForm(form);
    initLogoPreview(form);
    renderContador(); // desactiva los días que ya estén llenos
    var desc = $('#r-desc'), count = $('#descCount');
    desc.addEventListener('input', function () {
      count.textContent = desc.value.length + ' / 150';
      count.classList.toggle('is-limit', desc.value.length >= 140);
    });
    form.addEventListener('input', function (e) {
      var t = e.target;
      if (t.hasAttribute('data-telefono')) t.value = onlyDigits(t.value).slice(0, 10);
      if (t.closest('.has-error')) showError(t, fieldError(t));
    });
    form.addEventListener('change', function (e) {
      if (e.target.name === 'dias') { showDiasError(form, false); return; }
      if (e.target.closest('.has-error') || e.target.type === 'file') showError(e.target, fieldError(e.target));
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      var f = form.elements, g = giro(f.giro.value);
      var ids = diasElegidos(form);
      var nombresDias = CONFIG.dias.filter(function (d) { return ids.indexOf(d.id) !== -1; }).map(function (d) { return d.nombre; });
      var archivo = f.logoArchivo.files && f.logoArchivo.files[0];
      var limite = new Date(Date.now() + CONFIG.diasParaPagar * 864e5);
      var data = {
        fecha: new Date().toLocaleString('es-MX'),
        pagarAntesDe: limite.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        negocio: f.negocio.value.trim(),
        giro: g.nombre,
        dias: nombresDias.join(', '),
        numDias: ids.length,
        total: ids.length * CONFIG.precioPorDia,
        descripcion: f.descripcion.value.trim(),
        instagram: urlRed(f.instagram.value, 'instagram'),
        facebook: urlRed(f.facebook.value, 'facebook'),
        logoArchivo: archivo ? archivo.name : '',
        responsable: f.responsable.value.trim(),
        telefono: f.telefono.value,
        correo: f.correo.value.trim(),
        aceptaReglas: 'Sí',
        autorizaPublicar: 'Sí'
      };
      var btn = $('button[type="submit"]', form), label = btn.textContent;
      btn.disabled = true; btn.textContent = archivo ? 'Subiendo logo…' : 'Enviando…';
      // Si subieron un logo, se comprime y se manda junto con el registro (solo en modo 'sheets')
      var preparar = (archivo && CONFIG.modo === 'sheets' && CONFIG.urlGoogleSheets)
        ? comprimirImagen(archivo).then(function (r) { data.logoBase64 = r.base64; data.logoMime = r.mime; data.logoNombre = r.nombre; })
        : Promise.resolve();
      preparar.then(function () { btn.textContent = 'Enviando…'; return send(data); }).then(function (res) {
        data.logoSubido = !!(res && res.logo);
        delete data.logoBase64;
        showConfirmation(data, !res || res.offline, false);
        form.reset();
        $('#logoPreview').hidden = true;
        count.textContent = '0 / 150';
        renderTotal(form);
      }).catch(function (err) {
        console.error(err);
        showConfirmation(data, true, true);
      }).then(function () { btn.disabled = false; btn.textContent = label; });
    });
  }

  function toText(d) {
    return '🛍️ ' + CONFIG.nombreExpo + ' · Registro de emprendedor\n' +
      'Fecha: ' + d.fecha + '\n\n' +
      'Negocio: ' + d.negocio + '\nGiro: ' + d.giro + '\n' +
      'Días: ' + d.dias + ' (' + d.numDias + ' × ' + pesos(CONFIG.precioPorDia) + ' = ' + pesos(d.total) + ')\n' +
      'Pagar antes de: ' + d.pagarAntesDe + '\n' +
      'Descripción: ' + d.descripcion + '\n' +
      'Instagram: ' + (d.instagram || '—') + '\nFacebook: ' + (d.facebook || '—') + '\n' +
      'Logo/foto: ' + (d.logoArchivo || 'No enviado') + '\n\n' +
      'Responsable: ' + d.responsable + '\nTeléfono: ' + d.telefono + '\nCorreo: ' + d.correo + '\n' +
      'Acepta reglas: ' + d.aceptaReglas + ' · Autoriza publicar: ' + d.autorizaPublicar;
  }
  function toSheetRow(d) {
    return [d.fecha, d.negocio, d.giro, d.dias, d.numDias, d.total, d.pagarAntesDe, d.descripcion, d.instagram, d.facebook, d.logoArchivo,
      d.responsable, d.telefono, d.correo, d.aceptaReglas, d.autorizaPublicar].join('\t');
  }

  function send(data) {
    if (CONFIG.modo === 'sheets' && CONFIG.urlGoogleSheets) {
      // text/plain evita el bloqueo CORS de Google Apps Script
      return fetch(CONFIG.urlGoogleSheets, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (!d.ok) throw new Error(d.error || 'Error en Google Sheets'); return d; });
    }
    if (CONFIG.modo === 'formspree' && CONFIG.urlFormspree) {
      return fetch(CONFIG.urlFormspree, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ _subject: 'Registro emprendedor — ' + data.negocio, email: data.correo, resumen: toText(data), datos: data })
      }).then(function (r) { if (!r.ok) throw new Error('Error en Formspree'); return {}; });
    }
    if (CONFIG.modo === 'whatsapp') {
      window.open('https://wa.me/' + CONFIG.whatsappOrganizacion + '?text=' + encodeURIComponent(toText(data)), '_blank');
      return Promise.resolve({});
    }
    return Promise.resolve({ offline: true }); // modo 'pantalla'
  }

  function showConfirmation(data, showData, failed) {
    $('#confTitle').textContent = failed ? 'No pudimos enviar tu registro' : '¡Registro recibido!';
    // ✏️ CAMBIAR: pasos para pagar y confirmar el lugar
    $('#confBody').innerHTML = failed
      ? '<p>Hubo un problema de conexión. Copia tus datos y envíalos por WhatsApp o correo a la organización.</p>'
      : '<p>Gracias, <strong>' + esc(data.negocio) + '</strong>. Recibimos tu solicitud para participar: <strong>' + esc(data.dias) + '</strong>.</p>' +
        '<p>Total: ' + data.numDias + (data.numDias === 1 ? ' día' : ' días') + ' × ' + pesos(CONFIG.precioPorDia) + ' = <strong>' + pesos(data.total) + '</strong></p>' +
        '<p><strong>Para confirmar tu lugar:</strong></p>' +
        '<ol>' +
          '<li>Nos pondremos en contacto contigo por WhatsApp o correo para darte los datos de pago.</li>' +
          '<li>Realiza el pago de <strong>' + pesos(data.total) + '</strong> a más tardar el <strong>' + esc(data.pagarAntesDe) + '</strong>. Si no se recibe el pago en ' + CONFIG.diasParaPagar + ' días, tu registro se cancela y el lugar se libera.</li>' +
          '<li>Envía tu comprobante y el nombre de tu negocio por WhatsApp al ' + esc(CONFIG.pago.whatsapp) + '.' + (data.logoArchivo && !data.logoSubido ? ' Incluye también tu logo o foto.' : '') + '</li>' +
          '<li>Te confirmaremos tu lugar y publicaremos tu tarjeta en la sección de emprendedores.</li>' +
        '</ol>' +
        '<p>Lo que pagas por tu lugar apoya a 10 jóvenes voluntarios de Granito de Arena. ¡Gracias por sumar! 💛</p>';
    $('#dataBlock').hidden = !showData;
    if (showData) $('#dataOutput').value = toText(data) + '\n\n--- Fila para hoja de cálculo ---\n' + toSheetRow(data);
    openModal($('#confirmacion'));
  }

  /* ---------- Carrusel del equipo ----------
     Flechas, puntitos y avance automático cada 5 s (se pausa al tocarlo, pasar el mouse o desplazarlo a mano). */
  function initCarrusel() {
    var track = $('#equipoTrack'), dotsBox = $('#equipoDots');
    if (!track) return;
    var slides = $$('.equipo__slide', track);
    if (!slides.length) return;
    var paso = function () { return slides[0].getBoundingClientRect().width + 14; };
    var visibles = function () { return Math.max(1, Math.round(track.clientWidth / paso())); };
    var totalPos = function () { return Math.max(1, slides.length - visibles() + 1); };
    var actual = function () { return Math.min(totalPos() - 1, Math.round(track.scrollLeft / paso())); };
    function irA(i) {
      var n = totalPos();
      i = (i + n) % n;                       // al llegar al final, vuelve al inicio
      track.scrollTo({ left: i * paso(), behavior: 'smooth' });
    }
    function renderDots() {
      var n = totalPos(), a = actual();
      if (dotsBox.children.length !== n) {
        dotsBox.innerHTML = '';
        for (var i = 0; i < n; i++) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'equipo__dot'; b.setAttribute('aria-label', 'Ir a la foto ' + (i + 1));
          (function (k) { b.addEventListener('click', function () { pausar(); irA(k); }); })(i);
          dotsBox.appendChild(b);
        }
      }
      $$('.equipo__dot', dotsBox).forEach(function (d, i) { d.classList.toggle('is-active', i === a); d.setAttribute('aria-current', i === a ? 'true' : 'false'); });
    }
    $$('.equipo__arrow').forEach(function (btn) {
      btn.addEventListener('click', function () { pausar(); irA(actual() + Number(btn.getAttribute('data-dir'))); });
    });
    var t;
    track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(renderDots, 80); }, { passive: true });
    window.addEventListener('resize', renderDots);

    // Avance automático suave
    var timer = null, pausado = false;
    function iniciar() { if (!timer && !pausado) timer = setInterval(function () { irA(actual() + 1); }, 5000); }
    function detener() { clearInterval(timer); timer = null; }
    function pausar() { pausado = true; detener(); }
    ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (ev) { track.addEventListener(ev, pausar, { passive: true }); });
    track.addEventListener('mouseenter', detener);
    track.addEventListener('mouseleave', iniciar);
    // Solo avanza cuando el carrusel está a la vista
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { if (en[0].isIntersecting) iniciar(); else detener(); }, { threshold: 0.3 }).observe(track);
    } else iniciar();
    renderDots();
  }

  /* ---------- Arranque ---------- */
  function init() {
    safe(initNav, 'nav');
    safe(initEmprendedores, 'emprendedores');
    safe(initReveal, 'reveal');
    safe(initCountdown, 'countdown');
    safe(initModals, 'modals');
    safe(initCarrusel, 'carrusel');
    safe(initForm, 'form');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
