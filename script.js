/* ==========================================================================
   HANGUK RUN 한국 — script.js
   JavaScript puro, sin librerías. Firebase se carga solo si está configurado.
   ========================================================================== */
(function () {
  'use strict';

  /* ========================================================================
     ✏️ CONFIGURACIÓN — CAMBIA AQUÍ PRECIOS, CATEGORÍAS, TALLAS, NÚMEROS Y CONEXIÓN
     ======================================================================== */
  var CONFIG = {
    nombreCarrera: 'HANGUK RUN 한국 2026',

    /* Sección "Lo que regresa a la comunidad":
       true  → muestra también los compromisos marcados [POR CONFIRMAR] (para revisarlos).
       false → muestra SOLO los compromisos confirmados. ✏️ Ponlo en false antes de publicar. */
    mostrarPorConfirmar: true,

    // Categorías / distancias y su precio por corredor (MXN)
    categorias: [
      { id: '3K', nombre: '3K · Ruta Jeju', precio: 400 },
      { id: '5K', nombre: '5K · Ruta Seúl', precio: 400 },
      { id: '10K', nombre: '10K · Ruta Busan', precio: 400 }
    ],

    // Tallas de playera (unisex)
    tallas: ['S', 'M', 'L', 'XL'],
    sexos: ['Femenino', 'Masculino'],

    edadMinima: 12,
    edadMaxima: 90,

    // Corredores por inscripción (1 = individual; 2 o más = grupo)
    corredoresMaximo: 20,
    // Descuento por tamaño del grupo: actualmente SIN descuento.
    // Para activarlo en el futuro, por ejemplo: [{ desde: 5, porcentaje: 10 }, { desde: 10, porcentaje: 15 }]
    descuentosGrupo: [],

    /* --------------------------------------------------------------------
       💳 PAGO
       Después de inscribirse, la persona envía un WhatsApp para pedir el
       número de cuenta. Tiene "diasParaPagar" días desde que aparta su número.
       👉 PEGA AQUÍ el WhatsApp: 52 + 10 dígitos, sin espacios ni "+".
          Mientras esté vacío, la confirmación muestra el aviso [POR CONFIRMAR].
       -------------------------------------------------------------------- */
    pago: {
      whatsapp: '',          // [POR CONFIRMAR] ej. '5212223334444'
      diasParaPagar: 4
    },

    /* --------------------------------------------------------------------
       🔢 NÚMEROS DE CORREDOR (cada participante elige el suyo)
       ✏️ minimo / maximo: rango de números que se pueden elegir.
       ✏️ reservados: números que nadie puede elegir (organizadores, invitados…).
          En el tablero se ven igual que los ocupados.
          Si cambias el rango o los reservados, cámbialos también en firestore.rules.
       -------------------------------------------------------------------- */
    numeros: {
      minimo: 1,
      maximo: 700,
      reservados: []        // ejemplo: [1, 2, 3, 100]
    },

    /* --------------------------------------------------------------------
       ⏱ APARTADO TEMPORAL (como asientos de cine)
       Al tocar un número queda apartado para esa persona durante "minutos".
       Si no termina su registro a tiempo, el número se libera para todos.
       ✏️ Si lo cambias, cámbialo también en firestore.rules (MINUTOS_APARTADO).
       -------------------------------------------------------------------- */
    apartado: {
      minutos: 6
    },

    /* --------------------------------------------------------------------
       🔌 BASE DE DATOS (Firebase Firestore, no relacional)
       modo:
         'firebase' → guarda las inscripciones en Firestore y garantiza que cada
                      número sea único (instrucciones paso a paso en FIREBASE.md).
         'pantalla' → modo demostración: no guarda nada en internet; los números
                      ocupados solo se recuerdan en este navegador.
       👉 PEGA AQUÍ la configuración web de tu proyecto de Firebase
          (Consola de Firebase → Configuración del proyecto → Tus apps → Web).
          Estos datos son públicos por diseño; la seguridad la dan las reglas
          de firestore.rules.
       -------------------------------------------------------------------- */
    modo: 'firebase',
    firebase: {
      apiKey: 'AIzaSyCENeangPCyAKQX9ylKP1cLCO-pfg1hAWI',
      authDomain: 'hanguk-run.firebaseapp.com',
      projectId: 'hanguk-run',
      appId: '1:336183514717:web:ec68ceb51e93ae74121fb4'
    },
    firebaseVersion: '10.12.2',

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
  var miles = function (n) { return Number(n || 0).toLocaleString('es-MX'); };
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

  /* ---------- Compromisos "Lo que regresa a la comunidad" ----------
     Oculta los marcados data-estado="por-confirmar" si CONFIG.mostrarPorConfirmar es false,
     y oculta la sección completa si no queda ninguno visible. */
  function initCompromisos() {
    var section = $('#compromisos');
    if (!section || CONFIG.mostrarPorConfirmar) return;
    $$('[data-estado="por-confirmar"]', section).forEach(function (el) { el.hidden = true; });
    if (!$$('.compromiso:not([hidden])', section).length) section.hidden = true;
  }

  /* ========================================================================
     🔌 FIREBASE (se carga una sola vez)
     ======================================================================== */
  var fbPromesa = null;
  function firebaseConfigurado() {
    var f = CONFIG.firebase || {};
    return CONFIG.modo === 'firebase' && f.apiKey && f.projectId;
  }
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = function () { reject(new Error('No se pudo cargar ' + src)); };
      document.head.appendChild(s);
    });
  }
  function conectarFirebase() {
    if (fbPromesa) return fbPromesa;
    var base = 'https://www.gstatic.com/firebasejs/' + CONFIG.firebaseVersion + '/';
    fbPromesa = loadScript(base + 'firebase-app-compat.js')
      .then(function () { return loadScript(base + 'firebase-auth-compat.js'); })
      .then(function () { return loadScript(base + 'firebase-firestore-compat.js'); })
      .then(function () {
        if (!window.firebase.apps.length) window.firebase.initializeApp(CONFIG.firebase);
        // Identidad anónima (sin correo ni contraseña): sirve para saber de quién es cada apartado
        return window.firebase.auth().signInAnonymously();
      })
      .then(function (cred) {
        DB.uid = cred.user.uid;
        return window.firebase.firestore();
      });
    return fbPromesa;
  }

  /* ========================================================================
     🔢 NÚMEROS DE CORREDOR — versión optimizada para el plan gratuito
     - numeros/{n}      → un documento por número: estado "apartado" (6 min) o
                          "confirmado". Es la fuente de verdad; la página casi no lo lee.
     - tablero/{bloque} → RESUMEN en 7 documentos (1–100, 101–200…). La página dibuja
                          el tablero leyendo SOLO estos 7 documentos (en vez de hasta 700).
     - inscripciones    → datos personales; nadie puede leerlos desde la página.
     Ahorros:
       • Apartar y confirmar se hacen con escrituras directas (sin lecturas previas);
         las reglas de seguridad rechazan lo que no se puede hacer.
       • La conexión en tiempo real solo está abierta mientras la persona está en el
         paso 2 con la pestaña visible.
     ======================================================================== */
  var DB = {
    db: null, iniciado: false,
    uid: 'demo',              // identidad anónima de este visitante
    tablero: new Map(),       // número → { e: 'a' (apartado) | 'c' (confirmado), ms: hora del apartado }
    escuchando: null,         // función para cerrar la conexión en tiempo real
    desfase: 0,               // diferencia aproximada entre el reloj del servidor y el del dispositivo
    pedidos: {}               // número → hora local en que se pidió el apartado (para calcular el desfase)
  };
  var DEMO_KEY = 'hr_numeros_tomados_demo';
  var APARTADO_MS = CONFIG.apartado.minutos * 60000;
  var MARGEN_MS = 5000;       // margen de seguridad: el temporizador termina 5 s antes que el servidor
  var RANGO_TXT = 'Números del <strong>' + CONFIG.numeros.minimo + '</strong> al <strong>' + CONFIG.numeros.maximo + '</strong>.';

  function setEstadoNumeros(html, tipo) {
    var el = $('#numerosEstado');
    if (!el) return;
    el.innerHTML = html;
    el.className = 'numeros-estado' + (tipo ? ' numeros-estado--' + tipo : '');
  }
  function refNumero(n) { return DB.db.collection('numeros').doc(String(n)); }
  function refBloque(n) { return DB.db.collection('tablero').doc(String(Math.ceil(n / 100))); }
  // Escribe el valor de UN número en el resumen, reemplazándolo por completo (sin mezclar con
  // el valor anterior) y creando el documento del bloque si todavía no existe.
  function datosResumen(n, valor) { var m = {}; m[n] = valor; return [{ n: m, k: String(n) }, { mergeFields: ['n.' + n, 'k'] }]; }
  function escribirResumen(n, valor, batch) {
    var d = datosResumen(n, valor);
    return batch ? batch.set(refBloque(n), d[0], d[1]) : refBloque(n).set(d[0], d[1]);
  }

  // Se llama al llegar al paso 2 (no al abrir la página), para no gastar lecturas
  // con visitantes que solo están viendo la información.
  function initNumeros() {
    if (DB.iniciado) return;
    DB.iniciado = true;
    if (!firebaseConfigurado()) {
      // Modo demostración: los números confirmados se guardan solo en este navegador
      try { (JSON.parse(localStorage.getItem(DEMO_KEY)) || []).forEach(function (n) { DB.tablero.set(n, { e: 'c', ms: 0 }); }); } catch (e) { /* sin almacenamiento */ }
      setEstadoNumeros('🧪 Modo demostración. ' + RANGO_TXT, 'demo');
      return;
    }
    setEstadoNumeros('⏳ Consultando números disponibles…');
    conectarFirebase().then(function (db) {
      DB.db = db;
      DB.uid = window.firebase.auth().currentUser.uid;
      if (W.paso === 2 && !document.hidden) escuchar();
    }).catch(function (err) {
      console.error('[firebase]', err);
      var falta = err && /operation-not-allowed|admin-restricted|configuration-not-found/.test(err.code || '');
      setEstadoNumeros(falta
        ? '⚠️ Falta activar el acceso anónimo en Firebase (Authentication → Método de acceso → Anónimo).'
        : '⚠️ No pudimos conectar con la base de datos. Revisa tu conexión y recarga la página.', 'error');
    });
  }

  /* ---------- Conexión en tiempo real (solo en el paso 2 y con la pestaña visible) ---------- */
  function escuchar() {
    if (!DB.db || DB.escuchando) return;
    DB.escuchando = DB.db.collection('tablero').onSnapshot(function (snap) {
      var mapa = new Map();
      snap.docs.forEach(function (d) {
        var n = d.data({ serverTimestamps: 'estimate' }).n || {};
        Object.keys(n).forEach(function (k) {
          var v = n[k], num = Number(k);
          var ms = v.t && v.t.toMillis ? v.t.toMillis() : 0;
          mapa.set(num, { e: v.e, ms: ms });
          // Con un apartado propio ya confirmado por el servidor se calcula el desfase de relojes
          if (v.e === 'a' && DB.pedidos[num] && !d.metadata.hasPendingWrites) {
            DB.desfase = ms - DB.pedidos[num];
            delete DB.pedidos[num];
          }
        });
      });
      DB.tablero = mapa;
      setEstadoNumeros('🟢 Disponibilidad en tiempo real. ' + RANGO_TXT + ' Al tocar un número queda apartado para ti por ' + CONFIG.apartado.minutos + ' minutos.', 'ok');
      alCambiarOcupados();
    }, function (err) {
      console.error('[tablero]', err);
      DB.escuchando = null;
      setEstadoNumeros('⚠️ No pudimos consultar los números disponibles. Recarga la página en unos momentos.', 'error');
    });
  }
  function dejarDeEscuchar() {
    if (DB.escuchando) { DB.escuchando(); DB.escuchando = null; }
  }
  // Si la pestaña queda en segundo plano se cierra la conexión (no gasta lecturas); al volver se reabre
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) dejarDeEscuchar();
    else if (W.paso === 2) escuchar();
  });

  function esReservado(n) { return CONFIG.numeros.reservados.indexOf(n) !== -1; }
  function enRango(n) { return Number.isInteger(n) && n >= CONFIG.numeros.minimo && n <= CONFIG.numeros.maximo; }
  function ahora() { return Date.now() + DB.desfase; }
  function vigente(x) { return !!x && x.e === 'a' && x.ms + APARTADO_MS > ahora(); }
  function esMio(n) { return !!W.mios[n]; }
  // Para fines prácticos, reservado = ocupado
  function estaOcupado(n) { var x = DB.tablero.get(n); return esReservado(n) || (!!x && x.e === 'c' && !esMio(n)); }
  // Apartado por otra persona que todavía está llenando su registro
  function enProceso(n) { return !esMio(n) && vigente(DB.tablero.get(n)); }
  function estaLibre(n) { return enRango(n) && !estaOcupado(n) && !enProceso(n); }

  /* ---------- Apartar / soltar un número ---------- */
  function errorNumero(code) { var e = new Error(code); e.code = code; return e; }

  // Si el resumen quedó desactualizado (por ejemplo, alguien cerró la página a medias),
  // se corrige leyendo ese único número. Solo ocurre cuando algo falla.
  function repararResumen(n) {
    var FV = window.firebase.firestore.FieldValue;
    return refNumero(n).get().then(function (s) {
      var x = DB.tablero.get(n), d = s.exists ? s.data() : null, cambio = null;
      if (!d || (d.estado === 'apartado' && d.creado && d.creado.toMillis() + APARTADO_MS <= ahora())) {
        if (x) cambio = refBloque(n).update(Object.assign({ k: String(n) }, (function () { var o = {}; o['n.' + n] = FV.delete(); return o; })()));
      } else if (d.estado === 'confirmado' && (!x || x.e !== 'c')) {
        cambio = escribirResumen(n, { e: 'c' });
      } else if (d.estado === 'apartado' && (!x || x.e !== 'a' || x.ms !== d.creado.toMillis())) {
        cambio = escribirResumen(n, { e: 'a', t: d.creado });
      }
      if (cambio) cambio.catch(function (e) { console.warn('[reparar]', e); });
      return d;
    });
  }

  function apartar(n) {
    if (!DB.db) {
      // Con Firebase configurado pero sin conexión, NO se aparta (no se finge un apartado)
      if (firebaseConfigurado()) return Promise.reject(errorNumero('sin-conexion'));
      DB.tablero.set(n, { e: 'a', ms: Date.now() });             // modo demostración
      return Promise.resolve();
    }
    var FV = window.firebase.firestore.FieldValue, batch = DB.db.batch();
    // Una sola escritura (sin lecturas): el número y su resumen, con la misma hora del servidor
    batch.set(refNumero(n), { numero: n, estado: 'apartado', uid: DB.uid, creado: FV.serverTimestamp() });
    escribirResumen(n, { e: 'a', t: FV.serverTimestamp() }, batch);
    DB.pedidos[n] = Date.now();
    return batch.commit().catch(function (e) {
      delete DB.pedidos[n];
      if (e && e.code === 'permission-denied') {
        // Alguien lo tiene: se corrige el resumen por si estaba desactualizado
        return repararResumen(n).then(function (d) {
          throw errorNumero(d && d.estado === 'confirmado' ? 'ocupado' : 'en-proceso');
        }, function () { throw errorNumero('ocupado'); });
      }
      throw e;
    });
  }
  function soltar(n) {
    if (!DB.db) {                                                // modo demostración
      var x = DB.tablero.get(n);
      if (x && x.e === 'a') DB.tablero.delete(n);
      return;
    }
    var FV = window.firebase.firestore.FieldValue, batch = DB.db.batch(), quitar = { k: String(n) };
    quitar['n.' + n] = FV.delete();
    batch.delete(refNumero(n));
    batch.update(refBloque(n), quitar);
    batch.commit().catch(function () { /* ya vencido o ya confirmado */ });
  }

  /* ---------- Validación de campos ---------- */
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
  // Valida los campos visibles de un contenedor (un paso del formulario)
  function validar(container) {
    var first = null;
    $$('input, select', container).forEach(function (inp) {
      if (inp.closest('[hidden]') || inp.id === 'cantidad' || inp.id === 'desde' || inp.id === 'soloLibres') return;
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
      if (t.matches('input, select') && t.type !== 'checkbox' && t.value && !t.closest('.tablero') && t.id !== 'cantidad') showError(t, fieldError(t));
    });
  }
  function alerta(id, html) {
    var el = $('#' + id);
    if (!el) return;
    el.innerHTML = html || '';
    el.hidden = !html;
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

  /* ========================================================================
     📝 INSCRIPCIÓN EN 4 PASOS
     1. ¿Cuántos corredores?  2. Elegir números  3. Datos  4. Revisar y confirmar
     ======================================================================== */
  var W = { paso: 1, cantidad: 1, seleccion: [], rango: 'todos', cache: [], mios: {} };

  function form() { return $('#formInscripcion'); }

  /* ---------- ⏱ Temporizador del apartado ----------
     Cuenta desde el primer número apartado. Al llegar a cero se liberan
     los números y la persona vuelve a elegir (sus datos se conservan). */
  function limiteApartado() {
    var limite = null;
    elegidos().forEach(function (n) {
      // Hora local en que se pidió el apartado: siempre es igual o anterior a la del servidor,
      // así que el temporizador nunca se pasa del tiempo real.
      var inicio = W.mios[n];
      if (inicio === undefined) return;
      var fin = inicio + APARTADO_MS - MARGEN_MS;
      if (limite === null || fin < limite) limite = fin;
    });
    return limite;
  }
  function actualizarTemporizador() {
    var box = $('#temporizador');
    if (!box) return;
    var limite = limiteApartado();
    if (limite === null) { box.hidden = true; return; }
    var resta = limite - Date.now();
    if (resta <= 0) { expirarApartados(); return; }
    var s = Math.ceil(resta / 1000);
    $('#tempRestante').textContent = Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
    box.classList.toggle('is-urgente', s <= 60);
    box.hidden = false;
  }
  function expirarApartados() {
    var mis = elegidos();
    mis.forEach(function (n) { if (W.mios[n]) soltar(n); });
    W.seleccion = W.seleccion.map(function () { return null; });
    W.mios = {};
    $('#temporizador').hidden = true;
    if (W.paso > 2) irAPaso(2);
    pintarTablero(); pintarSeleccion();
    alerta('alertaNumeros', '⏱ Se acabó el tiempo y ' + (mis.length > 1 ? 'tus números se liberaron' : 'tu número se liberó') +
      '. Vuelve a elegir; tus datos se conservan.');
  }
  function initTemporizador() {
    var tick = 0;
    setInterval(function () {
      actualizarTemporizador();
      // Cada 3 s se actualiza el tablero, por si venció el apartado de alguien más
      if (++tick % 3 === 0 && W.paso === 2) pintarTablero();
    }, 1000);
    // Si la persona cierra o sale de la página, se intenta liberar sus números
    window.addEventListener('pagehide', function () { elegidos().forEach(function (n) { if (W.mios[n]) soltar(n); }); });
  }
  function esGrupo() { return W.cantidad > 1; }

  function irAPaso(n, sinScroll) {
    W.paso = n;
    $$('.paso', form()).forEach(function (p) { p.hidden = Number(p.getAttribute('data-paso')) !== n; });
    $$('#wizardPasos li').forEach(function (li) {
      var k = Number(li.getAttribute('data-paso'));
      li.classList.toggle('is-actual', k === n);
      li.classList.toggle('is-hecho', k < n);
    });
    // La conexión en tiempo real solo se usa en el paso 2 (ahorra lecturas del plan gratuito).
    // En los pasos 3 y 4 no hace falta: nadie puede quitarte un número apartado.
    if (n === 2) { safe(initNumeros, 'numeros'); if (!document.hidden) escuchar(); pintarTablero(); pintarSeleccion(); }
    else dejarDeEscuchar();
    if (n === 3) construirCorredores();
    if (n === 4) pintarResumen();
    if (!sinScroll) $('#wizardPasos').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* La selección tiene un LUGAR FIJO por corredor: W.seleccion[0] es el número del
     Corredor 1, W.seleccion[1] el del Corredor 2… Un lugar vacío es null.
     Así, si un corredor pierde su número, sus datos no se mezclan con los de otro. */
  function elegidos() { return W.seleccion.filter(function (n) { return n !== null; }); }
  function vacios() { return W.seleccion.filter(function (n) { return n === null; }).length; }
  // Deja vacíos los lugares cuyo número cumpla la condición y devuelve qué se liberó
  function liberarLugares(condicion) {
    var perdidos = [];
    W.seleccion = W.seleccion.map(function (n, i) {
      if (n !== null && condicion(n)) { perdidos.push({ numero: n, corredor: i + 1 }); return null; }
      return n;
    });
    return perdidos;
  }
  function textoPerdidos(perdidos, final) {
    return '😅 ' + perdidos.map(function (p) {
      return '#' + p.numero + (W.cantidad > 1 ? ' (Corredor ' + p.corredor + ')' : '');
    }).join(', ') + (perdidos.length > 1 ? ' acaban' : ' acaba') + ' de ser apartado' + (perdidos.length > 1 ? 's' : '') +
      ' por otra persona. ' + final;
  }

  // Revisa si se puede avanzar al paso "destino"
  function puedeAvanzar(destino) {
    if (destino <= W.paso) return true;
    if (W.paso === 1) return true;
    if (W.paso === 2) {
      alerta('alertaNumeros', '');
      var perdidos = liberarLugares(function (n) { return estaOcupado(n) || enProceso(n); });
      if (perdidos.length) {
        perdidos.forEach(function (p) { delete W.mios[p.numero]; });
        pintarTablero(); pintarSeleccion();
        alerta('alertaNumeros', textoPerdidos(perdidos, 'Elige otro.'));
        return false;
      }
      var faltan = vacios();
      if (faltan) {
        alerta('alertaNumeros', 'Te falta' + (faltan > 1 ? 'n' : '') + ' elegir <strong>' + faltan + '</strong> número' + (faltan > 1 ? 's' : '') + '.');
        return false;
      }
      return true;
    }
    if (W.paso === 3) {
      alerta('alertaDatos', '');
      var ok = validar($('.paso[data-paso="3"]', form()));
      if (!ok) alerta('alertaDatos', 'Revisa los campos marcados en rojo.');
      return ok;
    }
    return true;
  }

  /* ---------- Paso 1: cantidad ---------- */
  function setCantidad(n) {
    n = parseInt(n, 10);
    if (isNaN(n)) n = 1;
    n = Math.max(1, Math.min(CONFIG.corredoresMaximo, n));
    W.cantidad = n;
    $('#cantidad').value = n;
    // Ajusta los lugares: al reducir se conservan los números ya elegidos primero
    if (W.seleccion.length > n) {
      var antes = elegidos();
      W.seleccion = antes.concat(W.seleccion.map(function () { return null; })).slice(0, n);
      antes.forEach(function (x) { if (W.seleccion.indexOf(x) === -1) liberarMio(x); });   // libera los que sobran
    }
    while (W.seleccion.length < n) W.seleccion.push(null);
    var total = n * (CONFIG.categorias[0] ? CONFIG.categorias[0].precio : 0);
    $('#cantidadNota').innerHTML = n === 1
      ? 'Inscripción <strong>individual</strong> · ' + pesos(total)
      : 'Inscripción en <strong>grupo</strong> de ' + n + ' corredores · ' + pesos(total);
    $('[data-ir="2"]', $('.paso[data-paso="1"]')).textContent = n === 1 ? 'Siguiente: elegir número →' : 'Siguiente: elegir ' + n + ' números →';
    $('#consecutivosBox').hidden = n === 1;
  }

  /* ---------- Paso 2: tablero y selección ---------- */
  var BOTONES = [];
  function initTablero() {
    var grid = $('#tableroGrid');
    var min = CONFIG.numeros.minimo, max = CONFIG.numeros.maximo, frag = document.createDocumentFragment();
    for (var n = min; n <= max; n++) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'num'; b.textContent = n; b.setAttribute('data-n', n);
      frag.appendChild(b);
      BOTONES.push(b);
    }
    grid.appendChild(frag);

    // Filtros por centenas
    var rangos = $('#tableroRangos'), html = '<button type="button" class="chip is-active" data-rango="todos">Todos</button>';
    for (var s = min; s <= max; s += 100) {
      var e = Math.min(s + 99, max);
      html += '<button type="button" class="chip" data-rango="' + s + '-' + e + '">' + s + '–' + e + '</button>';
    }
    rangos.innerHTML = html;
    rangos.addEventListener('click', function (ev) {
      var chip = ev.target.closest('[data-rango]');
      if (!chip) return;
      $$('.chip', rangos).forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      W.rango = chip.getAttribute('data-rango');
      pintarTablero();
      grid.scrollTop = 0;
    });
    $('#soloLibres').addEventListener('change', function () { grid.classList.toggle('solo-libres', this.checked); });

    // Tocar un número: si está libre se agrega; si ya es tuyo, se quita
    grid.addEventListener('click', function (ev) {
      var b = ev.target.closest('.num');
      if (!b || b.disabled) return;
      alternarNumero(Number(b.getAttribute('data-n')));
    });
    // Quitar desde las fichas de la selección
    $('#seleccionChips').addEventListener('click', function (ev) {
      var x = ev.target.closest('[data-quitar]');
      if (!x) return;
      alternarNumero(Number(x.getAttribute('data-quitar')));
    });

    $('#alAzar').addEventListener('click', function () {
      if (!vacios()) { alerta('alertaNumeros', 'Ya elegiste tus ' + W.cantidad + ' número' + (W.cantidad > 1 ? 's' : '') + '. Quita uno si quieres cambiarlo.'); return; }
      var libres = [];
      for (var k = CONFIG.numeros.minimo; k <= CONFIG.numeros.maximo; k++) if (estaLibre(k) && W.seleccion.indexOf(k) === -1) libres.push(k);
      // Llena solo los lugares vacíos y los aparta
      var nuevos = [];
      W.seleccion = W.seleccion.map(function (n) {
        if (n !== null || !libres.length) return n;
        var x = libres.splice(Math.floor(Math.random() * libres.length), 1)[0];
        nuevos.push(x);
        return x;
      });
      alerta('alertaNumeros', '');
      apartarVarios(nuevos);
    });

    var desde = $('#desde');
    desde.min = min; desde.max = max;
    $('#asignarConsecutivos').addEventListener('click', function () {
      var inicio = parseInt(desde.value, 10);
      if (isNaN(inicio)) inicio = min;
      var s = bloqueConsecutivo(W.cantidad, inicio);
      if (s === -1) { alerta('alertaNumeros', 'No hay ' + W.cantidad + ' números consecutivos libres. Elígelos uno por uno.'); return; }
      var anteriores = elegidos(), nuevos = [];
      W.seleccion = [];
      for (var k = 0; k < W.cantidad; k++) W.seleccion.push(s + k);
      anteriores.forEach(function (x) { if (W.seleccion.indexOf(x) === -1) liberarMio(x); });
      W.seleccion.forEach(function (x) { if (anteriores.indexOf(x) === -1) nuevos.push(x); });
      alerta('alertaNumeros', s === inicio ? '' : 'Desde el #' + inicio + ' no había ' + W.cantidad + ' números seguidos libres; te asignamos del <strong>#' + s + '</strong> al <strong>#' + (s + W.cantidad - 1) + '</strong>.');
      apartarVarios(nuevos);
    });
  }
  // Primer bloque de "cantidad" números libres y consecutivos a partir de "desde"
  function bloqueConsecutivo(cantidad, desde) {
    var min = CONFIG.numeros.minimo, max = CONFIG.numeros.maximo;
    function libreDesde(s) { for (var k = 0; k < cantidad; k++) if (!estaLibre(s + k)) return false; return true; }
    for (var s = Math.max(min, desde); s + cantidad - 1 <= max; s++) if (libreDesde(s)) return s;
    for (s = min; s < desde && s + cantidad - 1 <= max; s++) if (libreDesde(s)) return s;
    return -1;
  }
  function alternarNumero(n) {
    var i = W.seleccion.indexOf(n);
    alerta('alertaNumeros', '');
    if (i !== -1) {                                       // ya era tuyo: se quita y se libera para todos
      W.seleccion[i] = null;
      liberarMio(n);
      pintarTablero(); pintarSeleccion();
      return;
    }
    var lugar = W.seleccion.indexOf(null);
    if (lugar !== -1) W.seleccion[lugar] = n;             // se asigna al primer corredor sin número
    else if (W.cantidad === 1) { liberarMio(W.seleccion[0]); W.seleccion = [n]; }   // individual: cambia directo
    else { alerta('alertaNumeros', 'Ya elegiste ' + W.cantidad + ' números. Quita uno (toca la ✕) para cambiarlo.'); return; }
    apartarVarios([n]);
  }
  // Aparta en la base de datos los números recién elegidos; si alguien ganó alguno, se quita y se avisa
  // Quita un número de "mis apartados" y lo libera para todos
  function liberarMio(n) { if (n === null || n === undefined) return; delete W.mios[n]; soltar(n); }
  function apartarVarios(nums) {
    nums.forEach(function (n) { W.mios[n] = Date.now(); });
    pintarTablero(); pintarSeleccion(); actualizarTemporizador();
    nums.forEach(function (n) {
      apartar(n).then(function () {
        // Si la persona lo quitó mientras se estaba apartando, se libera de inmediato
        if (!W.mios[n]) soltar(n);
      }).catch(function (e) {
        var perdidos = liberarLugares(function (x) { return x === n; });
        delete W.mios[n];
        if (e && e.code === 'sin-conexion') {
          alerta('alertaNumeros', '⚠️ No pudimos apartar el #' + n + ' porque no hay conexión con la base de datos. Recarga la página e intenta de nuevo.');
        } else {
          if (!(e && (e.code === 'ocupado' || e.code === 'en-proceso' || e.code === 'permission-denied'))) console.error('[apartar]', e);
          if (perdidos.length) alerta('alertaNumeros', textoPerdidos(perdidos, 'Elige otro.'));
        }
        pintarTablero(); pintarSeleccion(); actualizarTemporizador();
      });
    });
  }
  function pintarSeleccion() {
    var faltan = vacios(), listos = W.cantidad - faltan;
    $('#seleccionCuenta').innerHTML = faltan > 0
      ? 'Elegidos <strong>' + listos + '</strong> de ' + W.cantidad + ' · ' + (listos ? 'te falta' + (faltan > 1 ? 'n ' : ' ') + faltan : 'toca un número libre en el tablero')
      : '✅ Listo: elegiste ' + (W.cantidad === 1 ? 'tu número' : 'tus ' + W.cantidad + ' números');
    $('#seleccionCuenta').classList.toggle('is-completo', faltan <= 0);
    // Una ficha por corredor, en su lugar
    $('#seleccionChips').innerHTML = W.seleccion.map(function (n, i) {
      var quien = W.cantidad > 1 ? '<small>C' + (i + 1) + '</small>' : '';
      if (n === null) return '<span class="sel-chip sel-chip--vacio">' + quien + '#—</span>';
      return '<span class="sel-chip">' + quien + '#' + n + '<button type="button" data-quitar="' + n + '" aria-label="Quitar el número ' + n + '">✕</button></span>';
    }).join('');
    $('#irDatos').disabled = faltan > 0;
  }
  function pintarTablero() {
    if (!BOTONES.length) return;
    var r = W.rango === 'todos' ? null : W.rango.split('-').map(Number);
    var libres = 0;
    BOTONES.forEach(function (b) {
      var n = Number(b.getAttribute('data-n'));
      var ocupado = estaOcupado(n), sel = W.seleccion.indexOf(n) !== -1 && !ocupado;
      var proceso = !ocupado && !sel && enProceso(n);
      if (!ocupado && !proceso) libres++;
      b.classList.toggle('is-ocupado', ocupado);
      b.classList.toggle('is-proceso', proceso);
      b.classList.toggle('is-sel', sel);
      b.disabled = ocupado || proceso;
      b.hidden = !!r && (n < r[0] || n > r[1]);
      b.title = proceso ? 'Alguien lo está apartando. Se libera si no termina su registro en ' + CONFIG.apartado.minutos + ' minutos.' : '';
      b.setAttribute('aria-pressed', sel ? 'true' : 'false');
      b.setAttribute('aria-label', 'Número ' + n + (ocupado ? ', ocupado' : proceso ? ', en proceso' : sel ? ', seleccionado' : ', libre'));
    });
    $('#tableroConteo').innerHTML = '<strong>' + miles(libres) + '</strong> libres de ' + miles(CONFIG.numeros.maximo - CONFIG.numeros.minimo + 1);
  }
  // Cuando cambia la lista de ocupados (tiempo real): quita de tu selección lo que ya no está libre
  function alCambiarOcupados() {
    // Un número tuyo se pierde solo si alguien más lo confirmó (por ejemplo, si tu apartado falló)
    var perdidos = liberarLugares(function (n) { var x = DB.tablero.get(n); return esReservado(n) || (!!x && x.e === 'c'); });
    perdidos.forEach(function (p) { delete W.mios[p.numero]; });
    if (perdidos.length) {
      if (W.paso > 2) irAPaso(2);   // regresa a elegir; los datos ya escritos se conservan
      alerta('alertaNumeros', textoPerdidos(perdidos, 'Elige otro; tus datos se conservan.'));
    }
    pintarTablero(); pintarSeleccion();
  }

  /* ---------- Paso 3: datos ---------- */
  function corredorHTML(i, numero) {
    var p = 'r' + i + '-';
    var titulo = esGrupo() ? 'Corredor ' + (i + 1) : 'Tus datos';
    return '' +
      '<div class="runner" data-i="' + i + '">' +
        '<div class="runner__head"><h4>' + titulo + '</h4><span class="bib">#' + numero + '</span></div>' +
        '<div class="runner__grid">' +
          '<div class="field field--full field--half"><label for="' + p + 'nombre">Nombre completo *</label><input id="' + p + 'nombre" data-k="nombre" type="text" required minlength="5"' + (esGrupo() ? '' : ' autocomplete="name"') + '></div>' +
          '<div class="field"><label for="' + p + 'edad">Edad *</label><input id="' + p + 'edad" data-k="edad" type="number" inputmode="numeric" required data-edad></div>' +
          '<div class="field"><label for="' + p + 'sexo">Sexo *</label><select id="' + p + 'sexo" data-k="sexo" required data-opciones="sexos"></select></div>' +
          '<div class="field"><label for="' + p + 'cat">Distancia *</label><select id="' + p + 'cat" data-k="categoria" required data-opciones="categorias"></select></div>' +
          '<div class="field"><label for="' + p + 'talla">Talla de playera (unisex) *</label><select id="' + p + 'talla" data-k="talla" required data-opciones="tallas"></select></div>' +
          '<div class="field"><label for="' + p + 'en">Contacto de emergencia *</label><input id="' + p + 'en" data-k="emergenciaNombre" type="text" required minlength="3"></div>' +
          '<div class="field"><label for="' + p + 'et">Tel. de emergencia *</label><input id="' + p + 'et" data-k="emergenciaTelefono" type="tel" inputmode="numeric" required data-telefono></div>' +
        '</div>' +
      '</div>';
  }
  // Construye una tarjeta por número elegido, conservando lo que ya se había escrito
  function construirCorredores() {
    var box = $('#corredores');
    $$('.runner', box).forEach(function (row) {
      var i = Number(row.getAttribute('data-i')), datos = {};
      $$('[data-k]', row).forEach(function (inp) { datos[inp.getAttribute('data-k')] = inp.value; });
      W.cache[i] = datos;
    });
    box.innerHTML = W.seleccion.map(function (n, i) { return corredorHTML(i, n); }).join('');
    fillSelects(box);
    $$('.runner', box).forEach(function (row) {
      var datos = W.cache[Number(row.getAttribute('data-i'))];
      if (!datos) return;
      $$('[data-k]', row).forEach(function (inp) { var v = datos[inp.getAttribute('data-k')]; if (v) inp.value = v; });
    });
    // Contacto: individual o responsable de grupo
    $('#contactoTitulo').textContent = esGrupo() ? 'Responsable del grupo' : 'Tus datos de contacto';
    $$('[data-solo-grupo]', form()).forEach(function (f) {
      f.hidden = !esGrupo();
      $$('input', f).forEach(function (inp) { inp.required = esGrupo(); });
    });
  }

  /* ---------- Paso 4: resumen ---------- */
  function datosInscripcion() {
    var f = form().elements;
    var corredores = $$('#corredores .runner').map(function (row, i) {
      var r = { numero: W.seleccion[i] };
      $$('[data-k]', row).forEach(function (inp) { r[inp.getAttribute('data-k')] = inp.value.trim(); });
      return r;
    });
    var subtotal = corredores.reduce(function (s, r) { var c = categoria(r.categoria); return s + (c ? c.precio : 0); }, 0);
    var pct = 0;
    if (esGrupo()) CONFIG.descuentosGrupo.forEach(function (d) { if (corredores.length >= d.desde && d.porcentaje > pct) pct = d.porcentaje; });
    var descuento = Math.round(subtotal * pct / 100);
    var base = { fecha: new Date().toLocaleString('es-MX'), corredores: corredores, total: subtotal - descuento };
    if (!esGrupo()) {
      corredores[0].correo = f.correo.value.trim();
      corredores[0].telefono = f.telefono.value;
      return Object.assign({ tipo: 'Individual' }, base);
    }
    return Object.assign({
      tipo: 'Grupo',
      grupo: f.grupo.value.trim(),
      responsable: f.responsable.value.trim(),
      correo: f.correo.value.trim(),
      telefono: f.telefono.value,
      subtotal: subtotal,
      descuento: descuento
    }, base);
  }
  function pintarResumen() {
    var d = datosInscripcion();
    var html = '<h4>' + (d.tipo === 'Grupo' ? 'Grupo «' + esc(d.grupo) + '»' : 'Tu inscripción') + '</h4>';
    d.corredores.forEach(function (r) {
      var c = categoria(r.categoria);
      html += '<div class="summary__row"><span><span class="bib">#' + r.numero + '</span> ' + esc(r.nombre) + ' · ' + esc(r.categoria) + ' · Talla ' + esc(r.talla) + '</span><span>' + pesos(c ? c.precio : 0) + '</span></div>';
    });
    if (d.descuento) html += '<div class="summary__row summary__row--discount"><span>Descuento por grupo</span><span>−' + pesos(d.descuento) + '</span></div>';
    html += '<div class="summary__row summary__row--total"><span>Total a pagar</span><span>' + pesos(d.total) + '</span></div>';
    html += '<p class="summary__contacto">Contacto: ' + esc(d.tipo === 'Grupo' ? d.responsable + ' · ' + d.correo + ' · ' + d.telefono : d.corredores[0].correo + ' · ' + d.corredores[0].telefono) + '</p>';
    $('#resumen').innerHTML = html;
    $('#aceptaTexto').innerHTML = (esGrupo() ? 'Como responsable, confirmo que todos los integrantes leyeron y aceptan el ' : 'He leído y acepto el ') +
      '<a href="#reglamento" data-open-rules>reglamento y carta responsiva</a>. *';
    $('[data-open-rules]', $('#aceptaTexto')).addEventListener('click', function (e) { e.preventDefault(); openModal($('#reglamento')); });
    $('#btnEnviar').textContent = esGrupo() ? 'Corre por ellos: inscribir al grupo' : 'Inscríbete y suma tu paso';
  }

  function reiniciarWizard() {
    form().reset();
    W.seleccion = []; W.cache = []; W.mios = {};
    $('#temporizador').hidden = true;
    $('#corredores').innerHTML = '';
    ['alertaNumeros', 'alertaDatos', 'alertaEnvio'].forEach(function (id) { alerta(id, ''); });
    setCantidad(1);
    irAPaso(1, true);
  }

  function initInscripcion() {
    var f = form();
    fillSelects(f);
    liveValidation(f);
    $$('[data-max-corredores]').forEach(function (el) { el.textContent = CONFIG.corredoresMaximo; });
    $('#cantidad').min = 1; $('#cantidad').max = CONFIG.corredoresMaximo;
    $('#cantMenos').addEventListener('click', function () { setCantidad(W.cantidad - 1); });
    $('#cantMas').addEventListener('click', function () { setCantidad(W.cantidad + 1); });
    $('#cantidad').addEventListener('change', function () { setCantidad(this.value); });
    setCantidad(1);
    initTablero();
    pintarSeleccion();
    initTemporizador();

    // Botones Siguiente / Atrás
    f.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ir]');
      if (!b) return;
      var destino = Number(b.getAttribute('data-ir'));
      if (puedeAvanzar(destino)) irAPaso(destino);
    });
    // También se puede volver tocando un paso ya completado en el indicador
    $('#wizardPasos').addEventListener('click', function (e) {
      var li = e.target.closest('li.is-hecho');
      if (li) irAPaso(Number(li.getAttribute('data-paso')));
    });

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      alerta('alertaEnvio', '');
      var acepta = $('#acepta');
      showError(acepta, fieldError(acepta));
      if (!acepta.checked) { alerta('alertaEnvio', 'Para continuar, acepta el reglamento y la carta responsiva.'); return; }
      submitData(datosInscripcion());
    });
  }

  /* ---------- Texto plano para copiar ---------- */
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
    if (d.pagarAntesDe) t += '\nPagar antes del: ' + d.pagarAntesDe;
    return t;
  }
  // Formato separado por tabuladores para pegar directo en Excel
  function toSheetRows(d) {
    return d.corredores.map(function (r) {
      return [d.fecha, d.tipo, d.grupo || '', r.numero, r.nombre, r.edad, r.sexo, r.categoria, r.talla,
        r.correo || d.correo, r.telefono || d.telefono, r.emergenciaNombre, r.emergenciaTelefono].join('\t');
    }).join('\n');
  }

  /* ---------- Envío ---------- */
  function errorOcupados(numeros) {
    var e = new Error('Números ocupados: ' + numeros.join(', '));
    e.code = 'numeros-ocupados';
    e.numeros = numeros;
    return e;
  }
  function submitData(data) {
    var btn = $('#btnEnviar'), label = btn.textContent;
    if (firebaseConfigurado() && !DB.db) {
      alerta('alertaEnvio', '⏳ Todavía estamos conectando con la base de datos. Intenta de nuevo en unos segundos.');
      return;
    }
    btn.disabled = true; btn.textContent = 'Apartando tus números…';

    // Fecha límite de pago (se guarda con la inscripción para que los organizadores la vean)
    var limite = new Date(Date.now() + CONFIG.pago.diasParaPagar * 864e5);
    data.estadoPago = 'pendiente';
    data.pagarAntesDe = limite.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    send(data).then(function (res) {
      showConfirmation(data, !!(res && res.offline));
      reiniciarWizard();
      pintarTablero();
    }).catch(function (err) {
      if (err && err.code === 'numeros-ocupados') {
        // Alguien apartó ese número justo antes: se quita de la selección y se regresa al paso 2
        // El número ya no está apartado a tu nombre (alguien lo confirmó o venció tu tiempo)
        var perdidos = liberarLugares(function (n) { return err.numeros.indexOf(n) !== -1; });
        err.numeros.forEach(function (n) { delete W.mios[n]; soltar(n); });
        irAPaso(2);
        alerta('alertaNumeros', '😅 ' + perdidos.map(function (p) {
          return '#' + p.numero + (W.cantidad > 1 ? ' (Corredor ' + p.corredor + ')' : '');
        }).join(', ') + ' ya no ' + (perdidos.length > 1 ? 'están apartados' : 'está apartado') +
          ' a tu nombre (alguien lo tomó o se acabó el tiempo). Elige otro; tus datos se conservan.');
        return;
      }
      console.error(err);
      // Si falla la conexión no se pierden los datos: se muestran para copiarlos.
      showConfirmation(data, true, true);
    }).then(function () {
      btn.disabled = false; btn.textContent = label;
    });
  }

  function send(data) {
    var numeros = data.corredores.map(function (r) { return r.numero; });

    if (DB.db) {
      // UNA sola escritura en lote, sin lecturas: guarda la inscripción y pasa cada número de
      // "apartado" a "confirmado". Las reglas solo lo permiten si cada número sigue apartado a
      // tu nombre y sin vencer; si alguno falla, no se guarda NADA.
      var FV = window.firebase.firestore.FieldValue, batch = DB.db.batch();
      var inscRef = DB.db.collection('inscripciones').doc();
      batch.set(inscRef, Object.assign({}, data, { creado: FV.serverTimestamp() }));
      numeros.forEach(function (n, i) {
        batch.update(refNumero(n), { estado: 'confirmado', categoria: data.corredores[i].categoria, inscripcion: inscRef.id });
      });
      return batch.commit().then(function () {
        // Actualiza el resumen del tablero (una escritura pequeña por número; si alguna fallara,
        // la siguiente persona que lo note lo corrige sola)
        numeros.forEach(function (n) {
          escribirResumen(n, { e: 'c' }).catch(function (e) { console.warn('[resumen]', e); });
        });
        return { id: inscRef.id };
      }, function (e) {
        if (!e || (e.code !== 'permission-denied' && e.code !== 'not-found')) throw e;
        // Solo cuando algo falla se leen los números, para saber cuál se perdió
        return Promise.all(numeros.map(function (n) { return refNumero(n).get(); })).then(function (snaps) {
          var perdidos = numeros.filter(function (n, i) {
            var d = snaps[i].exists ? snaps[i].data() : null;
            return !d || d.estado !== 'apartado' || d.uid !== DB.uid || !d.creado || d.creado.toMillis() + APARTADO_MS <= ahora();
          });
          perdidos.forEach(function (n) { repararResumen(n).catch(function () {}); });
          throw errorOcupados(perdidos.length ? perdidos : numeros);
        });
      });
    }

    // Modo demostración: solo revisa y guarda en este navegador
    var ocupados = numeros.filter(estaOcupado);
    if (ocupados.length) return Promise.reject(errorOcupados(ocupados));
    numeros.forEach(function (n) { DB.tablero.set(n, { e: 'c', ms: 0 }); });
    var confirmados = [];
    DB.tablero.forEach(function (x, n) { if (x.e === 'c') confirmados.push(n); });
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(confirmados)); } catch (e) { /* sin almacenamiento */ }
    return Promise.resolve({ offline: true });
  }

  // Instrucciones de pago + botón de WhatsApp con el mensaje ya escrito
  function pagoHTML(data) {
    var nums = data.corredores.map(function (r) { return '#' + r.numero; }).join(', ');
    var quien = data.tipo === 'Grupo' ? 'el grupo "' + data.grupo + '" (responsable: ' + data.responsable + ')' : data.corredores[0].nombre;
    var html = '<div class="pago">' +
      '<p class="pago__titulo">💳 Siguiente paso: realiza tu pago</p>' +
      '<p>Tienes <strong>' + CONFIG.pago.diasParaPagar + ' días</strong> para pagar, a más tardar el <strong>' + esc(data.pagarAntesDe) + '</strong>. ' +
      'Envíanos un WhatsApp para recibir el número de cuenta, o paga en los locales que nos apoyan.</p>';
    if (CONFIG.pago.whatsapp) {
      var msg = 'Hola, me inscribí a ' + CONFIG.nombreCarrera + '. ' +
        'Inscripción de ' + quien + ' · Número(s): ' + nums + ' · Total: ' + pesos(data.total) + '. ' +
        '¿Me pueden compartir el número de cuenta para realizar el pago?';
      html += '<a class="btn btn--primary btn--block pago__wa" href="https://wa.me/' + esc(CONFIG.pago.whatsapp) + '?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener">💬 Pedir número de cuenta por WhatsApp</a>';
    } else {
      html += '<p class="pendiente">[POR CONFIRMAR: número de WhatsApp para pagos]</p>';
    }
    return html + '</div>';
  }

  function showConfirmation(data, showData, failed) {
    var nums = data.corredores.map(function (r) { return r.numero; });
    var numTxt = nums.length > 1
      ? 'Números: ' + nums.map(function (n) { return '<strong>#' + n + '</strong>'; }).join(', ')
      : 'Tu número: <strong>#' + nums[0] + '</strong>';
    var who = data.tipo === 'Grupo' ? 'Grupo <strong>' + esc(data.grupo) + '</strong> (' + nums.length + ' corredores)' : '<strong>' + esc(data.corredores[0].nombre) + '</strong>';
    // ✏️ CAMBIAR: textos del mensaje de confirmación
    $('#confirmTitle').textContent = failed ? 'No pudimos enviar tu inscripción' : '¡Gracias por sumar tu paso!';
    $('#confirmBody').innerHTML = failed
      ? '<p>Hubo un problema de conexión. Copia tus datos y envíalos por WhatsApp o correo al organizador.</p>'
      : '<p><span lang="ko" style="font-size:1.5rem">감사합니다!</span> Tu inscripción a <strong>HANGUK RUN</strong> quedó registrada.</p>' +
        '<p>' + who + '<br>' + numTxt + '<br>Total a pagar: <strong>' + pesos(data.total) + '</strong></p>' +
        pagoHTML(data) +
        '<p>Cada inscripción apoya a los <strong>10 jóvenes voluntarios de Granito de Arena</strong> que representarán a su comunidad en un encuentro internacional en Corea del Sur. <span lang="ko">가자!</span> 🏁</p>';
    $('#dataBlock').hidden = !showData;
    if (showData) $('#dataOutput').value = toText(data) + '\n\n--- Filas para hoja de cálculo ---\n' + toSheetRows(data);
    openModal($('#confirmacion'));
  }

  /* ---------- Arranque ---------- */
  function init() {
    safe(initNav, 'nav');
    safe(initReveal, 'reveal');
    safe(initCountdown, 'countdown');
    safe(initInstagram, 'instagram');
    safe(initCompromisos, 'compromisos');
    safe(initModals, 'modals');
    safe(initInscripcion, 'inscripcion');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
