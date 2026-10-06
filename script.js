/* ==========================================================================
   HANGUK RUN 한국 — script.js
   JavaScript puro, sin librerías.
   ========================================================================== */
(function () {
  'use strict';

  /* ========================================================================
     ✏️ CONFIGURACIÓN — CAMBIA AQUÍ PRECIOS, CATEGORÍAS, TALLAS Y CONEXIÓN
     ======================================================================== */
  var CONFIG = {
    nombreCarrera: 'HANGUK RUN 한국 2026',

    /* Sección "Lo que regresa a la comunidad":
       true  → muestra también los compromisos marcados [POR CONFIRMAR] (para revisarlos).
       false → muestra SOLO los compromisos confirmados. ✏️ Ponlo en false antes de publicar. */
    mostrarPorConfirmar: true,

    // Categorías / distancias y su precio por corredor (MXN)
    categorias: [
      { id: '3K', nombre: '3K · Ruta Jeju', precio: 250 },   // ✏️ precio de ejemplo, confirmar
      { id: '5K', nombre: '5K · Ruta Seúl', precio: 350 },
      { id: '10K', nombre: '10K · Ruta Busan', precio: 450 }
    ],

    tallas: ['Infantil', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sexos: ['Femenino', 'Masculino'],

    edadMinima: 12,
    edadMaxima: 90,

    // Inscripción en grupo
    grupoMinimo: 2,
    grupoMaximo: 20,
    // Descuento por tamaño del grupo: actualmente SIN descuento.
    // Para activarlo en el futuro, por ejemplo: [{ desde: 5, porcentaje: 10 }, { desde: 10, porcentaje: 15 }]
    descuentosGrupo: [],

    // Números de corredor: primer número disponible.
    // Si conectas Google Sheets, el número real lo asigna la hoja (ver apps-script.gs).
    siguienteNumero: 101,

    /* --------------------------------------------------------------------
       🔌 CONEXIÓN PARA GUARDAR LAS INSCRIPCIONES
       modo:
         'pantalla'  → (actual) no envía nada; muestra los datos para copiarlos.
         'sheets'    → Google Sheets. Pega en urlGoogleSheets la URL de tu
                       Apps Script (termina en /exec). Instrucciones en apps-script.gs
         'formspree' → Formspree. Pega en urlFormspree tu endpoint
                       (ej. https://formspree.io/f/abcdwxyz)
         'whatsapp'  → abre WhatsApp con los datos para enviarlos al organizador.
       -------------------------------------------------------------------- */
    modo: 'pantalla',
    urlGoogleSheets: '',   // 👉 PEGA AQUÍ la URL de Google Apps Script
    urlFormspree: '',      // 👉 PEGA AQUÍ el endpoint de Formspree
    whatsappOrganizador: '52XXXXXXXXXX', // 👉 52 + 10 dígitos, sin espacios ni "+" (solo para modo 'whatsapp')

    /* --------------------------------------------------------------------
       📸 CARRUSEL DE INSTAGRAM (se actualiza solo con las últimas publicaciones)
       Instagram no deja que una página web lea las publicaciones directamente,
       así que se usa Behold (https://behold.so), que tiene plan gratuito:
         1. Crea una cuenta en behold.so y conecta @granitodearena.sm
            (puede pedir que la cuenta de Instagram sea Profesional/Creador,
            se cambia gratis en la configuración de Instagram).
         2. Crea un "Feed" de tipo JSON y copia su URL
            (se ve como https://feeds.behold.so/XXXXXXXXXXXX).
         3. Pégala abajo en feedUrl. Listo: cada vez que publiquen, la página
            mostrará lo nuevo, sin tocar el código.
       Mientras feedUrl esté vacío, se muestra una tarjeta "Síguenos en Instagram".
       -------------------------------------------------------------------- */
    instagram: {
      feedUrl: '',            // 👉 PEGA AQUÍ la URL del feed JSON de Behold
      maxPublicaciones: 8
    }
  };
  /* ======================== FIN DE CONFIGURACIÓN ======================== */

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var pesos = function (n) { return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  // Cada inicialización va protegida: si una falla, las demás siguen funcionando.
  function safe(fn, name) {
    try { fn(); } catch (e) { console.error('[' + name + ']', e); }
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

    // Resalta en el menú la sección visible
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
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
    // Red de seguridad: si algo sigue oculto a los 6 s, se muestra.
    setTimeout(showAll, 6000);
  }

  /* ---------- Cuenta regresiva ---------- */
  function initCountdown() {
    var box = $('#countdown');
    var target = new Date(box.getAttribute('data-fecha')).getTime();
    if (isNaN(target)) return;
    var el = { d: $('[data-cd="d"]', box), h: $('[data-cd="h"]', box), m: $('[data-cd="m"]', box), s: $('[data-cd="s"]', box) };
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        box.classList.add('is-done');
        box.textContent = '¡Hoy es el gran día! 🏁';
        clearInterval(timer);
        return;
      }
      el.d.textContent = Math.floor(diff / 864e5);
      el.h.textContent = pad(Math.floor(diff / 36e5) % 24);
      el.m.textContent = pad(Math.floor(diff / 6e4) % 60);
      el.s.textContent = pad(Math.floor(diff / 1e3) % 60);
    }
    var timer = setInterval(tick, 1000);
    tick();
  }

  /* ---------- Carrusel de Instagram ---------- */
  function initInstagram() {
    var cfg = CONFIG.instagram, track = $('#igTrack');
    if (!cfg || !cfg.feedUrl || !track) return; // sin feed: se queda la tarjeta "Síguenos"

    function imageOf(p) {
      if (p.sizes && p.sizes.medium && p.sizes.medium.mediaUrl) return p.sizes.medium.mediaUrl;
      return p.mediaType === 'VIDEO' ? (p.thumbnailUrl || p.mediaUrl) : p.mediaUrl;
    }
    function badgeOf(p) {
      if (p.mediaType === 'VIDEO') return '▶ Reel';
      if (p.mediaType === 'CAROUSEL_ALBUM') return '❐ Álbum';
      return '';
    }
    function render(posts) {
      posts = posts.filter(function (p) { return p && p.permalink && imageOf(p); }).slice(0, cfg.maxPublicaciones || 8);
      if (!posts.length) return;
      var html = posts.map(function (p) {
        var caption = (p.prunedCaption || p.caption || '').trim();
        var badge = badgeOf(p);
        return '<a class="ig__post" href="' + esc(p.permalink) + '" target="_blank" rel="noopener">' +
          '<figure style="margin:0;height:100%">' +
            '<img src="' + esc(imageOf(p)) + '" alt="' + esc(caption.slice(0, 120) || 'Publicación de Instagram') + '" loading="lazy">' +
            (badge ? '<span class="ig__badge">' + badge + '</span>' : '') +
            (caption ? '<figcaption><span>' + esc(caption) + '</span></figcaption>' : '') +
          '</figure></a>';
      }).join('');
      track.insertAdjacentHTML('beforeend', html);
      track.classList.add('is-loaded');

      var nav = $('.ig__nav');
      nav.hidden = false;
      $$('.ig__arrow', nav).forEach(function (btn) {
        btn.addEventListener('click', function () {
          track.scrollBy({ left: Number(btn.getAttribute('data-dir')) * track.clientWidth * 0.9, behavior: 'smooth' });
        });
      });
    }

    // Se carga solo cuando la sección está cerca de la pantalla, para no hacer lenta la página.
    var loaded = false;
    function load() {
      if (loaded) return; loaded = true;
      fetch(cfg.feedUrl)
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (d) { render(Array.isArray(d) ? d : (d.posts || [])); })
        .catch(function (e) { console.warn('[instagram] No se pudo cargar el feed:', e); });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { io.disconnect(); load(); }
      }, { rootMargin: '600px 0px' });
      io.observe(track);
    } else load();
  }

  /* ---------- Ventanas (reglamento / confirmación) ---------- */
  function openModal(dlg) {
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function closeModal(dlg) {
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
  }
  function initModals() {
    $$('[data-open-rules]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); openModal($('#reglamento')); });
    });
    $$('dialog').forEach(function (dlg) {
      $$('[data-close]', dlg).forEach(function (b) { b.addEventListener('click', function () { closeModal(dlg); }); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) closeModal(dlg); }); // clic fuera
    });
    $('#copyData').addEventListener('click', function () {
      var ta = $('#dataOutput'), btn = this;
      var done = function () { btn.textContent = '✅ ¡Copiado!'; setTimeout(function () { btn.textContent = '📋 Copiar datos'; }, 2000); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); document.execCommand('copy'); done(); });
      } else { ta.select(); document.execCommand('copy'); done(); }
    });
  }

  /* ---------- Opciones de los <select> ---------- */
  function optionsHTML(tipo) {
    var html = '<option value="">Selecciona…</option>';
    if (tipo === 'categorias') {
      CONFIG.categorias.forEach(function (c) { html += '<option value="' + esc(c.id) + '">' + esc(c.nombre) + ' — ' + pesos(c.precio) + '</option>'; });
    } else {
      CONFIG[tipo].forEach(function (v) { html += '<option>' + esc(v) + '</option>'; });
    }
    return html;
  }
  function fillSelects(ctx) {
    $$('select[data-opciones]', ctx).forEach(function (s) {
      if (s.options.length > 0) return;
      s.innerHTML = optionsHTML(s.getAttribute('data-opciones'));
    });
  }
  function categoria(id) {
    for (var i = 0; i < CONFIG.categorias.length; i++) if (CONFIG.categorias[i].id === id) return CONFIG.categorias[i];
    return null;
  }

  /* ---------- Número de corredor disponible ----------
     Sin conexión se usa CONFIG.siguienteNumero y se guarda en este navegador
     para que las pruebas sigan siendo consecutivas. Con Google Sheets la hoja
     informa y asigna el número real. */
  var STORE_KEY = 'ccv_siguiente_numero';
  var nextBib = CONFIG.siguienteNumero;
  function readLocalBib() {
    try { var v = parseInt(localStorage.getItem(STORE_KEY), 10); if (v > nextBib) nextBib = v; } catch (e) { /* sin almacenamiento */ }
  }
  function saveLocalBib(n) {
    nextBib = n;
    try { localStorage.setItem(STORE_KEY, String(n)); } catch (e) { /* sin almacenamiento */ }
  }
  function fetchServerBib() {
    if (CONFIG.modo !== 'sheets' || !CONFIG.urlGoogleSheets) return;
    fetch(CONFIG.urlGoogleSheets + '?accion=siguiente')
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.siguiente) { nextBib = parseInt(d.siguiente, 10); updateAll(); } })
      .catch(function () { /* se queda el número local */ });
  }

  /* ---------- Validación ---------- */
  var onlyDigits = function (s) { return String(s).replace(/\D/g, ''); };
  function fieldError(input) {
    var v = input.value.trim();
    if (input.type === 'checkbox') return input.checked ? '' : 'Debes aceptar para continuar.';
    if (input.required && !v) return 'Este campo es obligatorio.';
    if (!v) return '';
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Escribe un correo válido.';
    if (input.hasAttribute('data-telefono') && onlyDigits(v).length !== 10) return 'Escribe 10 dígitos.';
    if (input.hasAttribute('data-edad')) {
      var n = Number(v);
      if (!Number.isInteger(n) || n < CONFIG.edadMinima || n > CONFIG.edadMaxima) return 'Edad entre ' + CONFIG.edadMinima + ' y ' + CONFIG.edadMaxima + ' años.';
    }
    if (input.minLength > 0 && v.length < input.minLength) return 'Escribe al menos ' + input.minLength + ' caracteres.';
    return '';
  }
  function showError(input, msg) {
    var wrap = input.type === 'checkbox' ? input.closest('.check') : input.closest('.field');
    if (!wrap) return;
    wrap.classList.toggle('has-error', !!msg);
    var err = wrap.querySelector('.field__error');
    if (input.type === 'checkbox') return;
    if (msg && !err) { err = document.createElement('span'); err.className = 'field__error'; wrap.appendChild(err); }
    if (err) err.textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function validateForm(form) {
    var first = null;
    $$('input[required], select[required], input[data-telefono], input[data-edad]', form).forEach(function (inp) {
      var msg = fieldError(inp);
      showError(inp, msg);
      if (msg && !first) first = inp;
    });
    if (first) {
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function () { first.focus({ preventScroll: true }); }, 400);
    }
    return !first;
  }
  function liveValidation(form) {
    form.addEventListener('input', function (e) {
      var t = e.target;
      if (t.hasAttribute('data-telefono')) t.value = onlyDigits(t.value).slice(0, 10);
      if (t.closest('.has-error')) showError(t, fieldError(t));
    });
    form.addEventListener('change', function (e) { if (e.target.closest('.has-error')) showError(e.target, fieldError(e.target)); });
    form.addEventListener('focusout', function (e) {
      var t = e.target;
      if ((t.matches('input, select')) && t.type !== 'checkbox' && t.value) showError(t, fieldError(t));
    });
  }

  /* ---------- Pestañas ---------- */
  function initTabs() {
    var tabs = [$('#tabIndividual'), $('#tabGrupo')], panels = [$('#formIndividual'), $('#formGrupo')];
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t, j) {
          t.classList.toggle('is-active', i === j);
          t.setAttribute('aria-selected', String(i === j));
          panels[j].hidden = i !== j;
        });
      });
    });
  }

  /* ---------- Inscripción individual ---------- */
  function renderSummaryIndividual() {
    var form = $('#formIndividual'), cat = categoria(form.categoria.value), box = $('#summaryIndividual');
    if (!cat) { box.innerHTML = ''; return; }
    box.innerHTML =
      '<h4>Resumen</h4>' +
      '<div class="summary__row"><span>' + esc(cat.nombre) + '</span><span>' + pesos(cat.precio) + '</span></div>' +
      '<div class="summary__row"><span>Número de corredor (preliminar)</span><span class="bib">#' + nextBib + '</span></div>' +
      '<div class="summary__row summary__row--total"><span>Total a pagar</span><span>' + pesos(cat.precio) + '</span></div>';
  }
  function initIndividual() {
    var form = $('#formIndividual');
    fillSelects(form);
    liveValidation(form);
    form.categoria.addEventListener('change', renderSummaryIndividual);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      var f = form.elements, cat = categoria(f.categoria.value);
      var data = {
        tipo: 'Individual',
        fecha: new Date().toLocaleString('es-MX'),
        corredores: [{
          numero: nextBib,
          nombre: f.nombre.value.trim(), edad: f.edad.value, sexo: f.sexo.value,
          correo: f.correo.value.trim(), telefono: f.telefono.value,
          talla: f.talla.value, categoria: cat.id,
          emergenciaNombre: f.emergenciaNombre.value.trim(), emergenciaTelefono: f.emergenciaTelefono.value
        }],
        total: cat.precio
      };
      submitData(data, form, function () { renderSummaryIndividual(); });
    });
  }

  /* ---------- Inscripción en grupo ---------- */
  function clampCount(n) {
    n = parseInt(n, 10);
    if (isNaN(n)) n = CONFIG.grupoMinimo;
    return Math.max(CONFIG.grupoMinimo, Math.min(CONFIG.grupoMaximo, n));
  }
  function runnerHTML(i) {
    var p = 'r' + i + '-';
    return '' +
      '<div class="runner" data-index="' + i + '">' +
        '<div class="runner__head"><h4>Corredor ' + (i + 1) + '</h4><span class="bib" data-bib>#—</span></div>' +
        '<div class="runner__grid">' +
          '<div class="field field--full field--half"><label for="' + p + 'nombre">Nombre completo *</label><input id="' + p + 'nombre" data-k="nombre" type="text" required minlength="5"></div>' +
          '<div class="field"><label for="' + p + 'edad">Edad *</label><input id="' + p + 'edad" data-k="edad" type="number" inputmode="numeric" required data-edad></div>' +
          '<div class="field"><label for="' + p + 'sexo">Sexo *</label><select id="' + p + 'sexo" data-k="sexo" required data-opciones="sexos"></select></div>' +
          '<div class="field"><label for="' + p + 'talla">Talla *</label><select id="' + p + 'talla" data-k="talla" required data-opciones="tallas"></select></div>' +
          '<div class="field"><label for="' + p + 'cat">Distancia *</label><select id="' + p + 'cat" data-k="categoria" required data-opciones="categorias"></select></div>' +
          '<div class="field"><label for="' + p + 'en">Contacto de emergencia *</label><input id="' + p + 'en" data-k="emergenciaNombre" type="text" required minlength="3"></div>' +
          '<div class="field"><label for="' + p + 'et">Tel. emergencia *</label><input id="' + p + 'et" data-k="emergenciaTelefono" type="tel" inputmode="numeric" required data-telefono></div>' +
        '</div>' +
      '</div>';
  }
  // Agrega o quita filas sin borrar lo que ya se escribió
  function renderRunners(n) {
    var box = $('#runners'), current = box.children.length;
    for (var i = current; i < n; i++) {
      box.insertAdjacentHTML('beforeend', runnerHTML(i));
      fillSelects(box.lastElementChild);
    }
    while (box.children.length > n) box.removeChild(box.lastElementChild);
  }
  function groupDiscount(n) {
    var pct = 0;
    CONFIG.descuentosGrupo.forEach(function (d) { if (n >= d.desde && d.porcentaje > pct) pct = d.porcentaje; });
    return pct;
  }
  function renderSummaryGrupo() {
    var rows = $$('#runners .runner'), n = rows.length, subtotal = 0, faltan = 0, bibs = [];
    var porCat = {};
    rows.forEach(function (row, i) {
      var num = nextBib + i;
      bibs.push(num);
      $('[data-bib]', row).textContent = '#' + num;
      var cat = categoria($('[data-k="categoria"]', row).value);
      if (cat) { subtotal += cat.precio; porCat[cat.nombre] = porCat[cat.nombre] || { n: 0, precio: cat.precio }; porCat[cat.nombre].n++; }
      else faltan++;
    });
    var pct = groupDiscount(n), desc = Math.round(subtotal * pct / 100), total = subtotal - desc;

    var html = '<h4>Números asignados</h4>' +
      '<p class="bibs-range">Del <strong>#' + bibs[0] + '</strong> al <strong>#' + bibs[n - 1] + '</strong> · ' + n + ' corredores consecutivos</p>' +
      '<div class="bibs-preview">' + bibs.map(function (b) { return '<span class="bib">#' + b + '</span>'; }).join('') + '</div>' +
      '<h4>Total a pagar</h4>';
    Object.keys(porCat).forEach(function (k) {
      html += '<div class="summary__row"><span>' + esc(k) + ' × ' + porCat[k].n + '</span><span>' + pesos(porCat[k].n * porCat[k].precio) + '</span></div>';
    });
    if (faltan) html += '<div class="summary__row"><span>Sin distancia elegida</span><span>' + faltan + '</span></div>';
    if (pct) html += '<div class="summary__row"><span>Subtotal</span><span>' + pesos(subtotal) + '</span></div>';
    if (pct) html += '<div class="summary__row summary__row--discount"><span>Descuento por grupo (' + pct + '%)</span><span>−' + pesos(desc) + '</span></div>';
    else if (CONFIG.descuentosGrupo.length) {
      var nextD = CONFIG.descuentosGrupo.filter(function (d) { return d.desde > n; }).sort(function (a, b) { return a.desde - b.desde; })[0];
      if (nextD) html += '<div class="summary__row"><span>💡 Con ' + nextD.desde + ' corredores obtienen ' + nextD.porcentaje + '% de descuento</span><span></span></div>';
    }
    html += '<div class="summary__row summary__row--total"><span>Total</span><span>' + pesos(total) + '</span></div>';
    html += '<p class="hint" style="color:rgba(255,255,255,.6);margin-top:8px">Los números son preliminares y se confirman al enviar.</p>';
    $('#summaryGrupo').innerHTML = html;
    return { subtotal: subtotal, descuento: desc, porcentaje: pct, total: total };
  }
  function initGroup() {
    var form = $('#formGrupo'), input = $('#g-cantidad');
    $('#countHint').textContent = 'Mínimo ' + CONFIG.grupoMinimo + ', máximo ' + CONFIG.grupoMaximo + ' corredores.';
    input.min = CONFIG.grupoMinimo; input.max = CONFIG.grupoMaximo;
    function setCount(n) {
      n = clampCount(n);
      input.value = n;
      renderRunners(n);
      renderSummaryGrupo();
    }
    $('#countMinus').addEventListener('click', function () { setCount(Number(input.value) - 1); });
    $('#countPlus').addEventListener('click', function () { setCount(Number(input.value) + 1); });
    input.addEventListener('change', function () { setCount(input.value); });
    form.addEventListener('change', function (e) { if (e.target.getAttribute('data-k') === 'categoria') renderSummaryGrupo(); });
    liveValidation(form);
    setCount(CONFIG.grupoMinimo);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      var f = form.elements, totals = renderSummaryGrupo();
      var corredores = $$('#runners .runner').map(function (row, i) {
        var r = { numero: nextBib + i };
        $$('[data-k]', row).forEach(function (inp) { r[inp.getAttribute('data-k')] = inp.value.trim(); });
        return r;
      });
      var data = {
        tipo: 'Grupo',
        fecha: new Date().toLocaleString('es-MX'),
        grupo: f.grupo.value.trim(),
        responsable: f.responsable.value.trim(),
        correo: f.correo.value.trim(),
        telefono: f.telefono.value,
        corredores: corredores,
        subtotal: totals.subtotal,
        descuento: totals.descuento,
        total: totals.total
      };
      submitData(data, form, function () { $('#runners').innerHTML = ''; setCount(CONFIG.grupoMinimo); });
    });
  }

  /* ---------- Texto plano para copiar / WhatsApp ---------- */
  function toText(d) {
    var t = '🏃 ' + CONFIG.nombreCarrera + '\nInscripción: ' + d.tipo + '\nFecha: ' + d.fecha + '\n';
    if (d.tipo === 'Grupo') {
      t += '\nGrupo: ' + d.grupo + '\nResponsable: ' + d.responsable + '\nCorreo: ' + d.correo + '\nTeléfono: ' + d.telefono + '\n';
    }
    d.corredores.forEach(function (r) {
      t += '\n#' + r.numero + ' · ' + r.nombre + ' · ' + r.edad + ' años · ' + r.sexo + ' · ' + r.categoria + ' · Talla ' + r.talla;
      if (r.correo) t += '\n   ' + r.correo + ' · ' + r.telefono;
      t += '\n   Emergencia: ' + r.emergenciaNombre + ' (' + r.emergenciaTelefono + ')';
    });
    if (d.descuento) t += '\n\nSubtotal: ' + pesos(d.subtotal) + '\nDescuento: −' + pesos(d.descuento);
    t += '\nTOTAL: ' + pesos(d.total);
    return t;
  }
  // Formato CSV (separado por tabuladores) para pegar directo en Excel o Google Sheets
  function toSheetRows(d) {
    return d.corredores.map(function (r) {
      return [d.fecha, d.tipo, d.grupo || '', r.numero, r.nombre, r.edad, r.sexo, r.categoria, r.talla,
        r.correo || d.correo, r.telefono || d.telefono, r.emergenciaNombre, r.emergenciaTelefono].join('\t');
    }).join('\n');
  }

  /* ---------- Envío ---------- */
  function submitData(data, form, onReset) {
    var btn = $('button[type="submit"]', form), label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Enviando…';

    send(data).then(function (res) {
      // Si el servidor (Google Sheets) devolvió números definitivos, se usan esos.
      if (res && res.numeros && res.numeros.length === data.corredores.length) {
        data.corredores.forEach(function (r, i) { r.numero = res.numeros[i]; });
      }
      var last = data.corredores[data.corredores.length - 1].numero;
      saveLocalBib(Math.max(nextBib, last + 1));
      showConfirmation(data, !res || res.offline);
      form.reset();
      onReset();
    }).catch(function (err) {
      console.error(err);
      // Si falla la conexión no se pierden los datos: se muestran para copiarlos.
      showConfirmation(data, true, true);
    }).then(function () {
      btn.disabled = false; btn.textContent = label;
    });
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ _subject: 'Inscripción ' + data.tipo + ' — ' + CONFIG.nombreCarrera, email: data.correo || data.corredores[0].correo, resumen: toText(data), datos: data })
      }).then(function (r) { if (!r.ok) throw new Error('Error en Formspree'); return {}; });
    }
    if (CONFIG.modo === 'whatsapp') {
      window.open('https://wa.me/' + CONFIG.whatsappOrganizador + '?text=' + encodeURIComponent(toText(data)), '_blank');
      return Promise.resolve({});
    }
    // Modo 'pantalla' (sin conexión)
    return Promise.resolve({ offline: true });
  }

  function showConfirmation(data, showData, failed) {
    var nums = data.corredores.map(function (r) { return r.numero; });
    var numTxt = nums.length > 1 ? 'Números del <strong>#' + nums[0] + '</strong> al <strong>#' + nums[nums.length - 1] + '</strong>' : 'Tu número: <strong>#' + nums[0] + '</strong>';
    var who = data.tipo === 'Grupo' ? 'Grupo <strong>' + esc(data.grupo) + '</strong> (' + nums.length + ' corredores)' : '<strong>' + esc(data.corredores[0].nombre) + '</strong>';
    // ✏️ CAMBIAR: textos del mensaje de confirmación
    $('#confirmTitle').textContent = failed ? 'No pudimos enviar tu inscripción' : '¡Gracias por sumar tu paso!';
    $('#confirmBody').innerHTML = failed
      ? '<p>Hubo un problema de conexión. Copia tus datos y envíalos por WhatsApp o correo al organizador.</p>'
      : '<p><span lang="ko" style="font-size:1.5rem">감사합니다!</span> Tu inscripción a <strong>HANGUK RUN</strong> quedó registrada.</p>' +
        '<p>' + who + '<br>' + numTxt + '<br>Total a pagar: <strong>' + pesos(data.total) + '</strong></p>' +
        '<p>Cada inscripción apoya a los <strong>10 jóvenes voluntarios de Granito de Arena</strong> que representarán a su comunidad en un encuentro internacional en Corea del Sur. Te contactaremos al correo registrado con las instrucciones de pago. <span lang="ko">가자!</span> 🏁</p>';
    $('#dataBlock').hidden = !showData;
    if (showData) $('#dataOutput').value = toText(data) + '\n\n--- Filas para hoja de cálculo ---\n' + toSheetRows(data);
    openModal($('#confirmacion'));
  }

  function updateAll() { renderSummaryIndividual(); renderSummaryGrupo(); }

  /* ---------- Compromisos "Lo que regresa a la comunidad" ----------
     Oculta los marcados data-estado="por-confirmar" si CONFIG.mostrarPorConfirmar es false,
     y oculta la sección completa si no queda ninguno visible. */
  function initCompromisos() {
    var section = $('#compromisos');
    if (!section || CONFIG.mostrarPorConfirmar) return;
    $$('[data-estado="por-confirmar"]', section).forEach(function (el) { el.hidden = true; });
    if (!$$('.compromiso:not([hidden])', section).length) section.hidden = true;
  }


  /* ---------- Arranque ---------- */
  function init() {
    readLocalBib();
    safe(initNav, 'nav');
    safe(initReveal, 'reveal');
    safe(initCountdown, 'countdown');
    safe(initInstagram, 'instagram');
    safe(initCompromisos, 'compromisos');
    safe(initModals, 'modals');
    safe(initTabs, 'tabs');
    safe(initIndividual, 'individual');
    safe(initGroup, 'group');
    safe(fetchServerBib, 'bib');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
