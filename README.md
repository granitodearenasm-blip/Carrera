# HANGUK RUN 한국

Página de la carrera con causa de Granito de Arena: 3K, 5K y 10K el domingo 6 de diciembre de 2026
en el Museo Hacienda San Cristóbal Polaxtla, San Martín Texmelucan.

Hecha con **Vite + React + TypeScript + Tailwind CSS**. Las inscripciones se guardan en Firebase Firestore
(guía en [FIREBASE.md](FIREBASE.md)).

## Trabajar en la página

Requiere [Node.js](https://nodejs.org) 20 o más reciente.

```bash
npm install      # una sola vez
npm run dev      # vista local con recarga automática: http://localhost:5173
npm run build    # genera el sitio listo para subir en dist/
```

## Publicar en Hostinger (o cualquier hosting estático)

1. `npm run build`
2. Sube **el contenido** de la carpeta `dist/` (no la carpeta) a `public_html/` con el Administrador de archivos o por FTP.
   Incluye el `.htaccess`, que configura la caché y la compresión.

Ya no hace falta cambiar el `?v=` en los enlaces: cada build genera nombres de archivo nuevos.

## Dónde cambiar cada cosa

Todo lo editable está marcado con `✏️` en el código.

| Quiero cambiar… | Archivo |
|---|---|
| Precios, distancias, tallas, números, pago, WhatsApp, Firebase, Instagram | `src/config.ts` |
| Datos de la sede, aviso "sujeta a autorización", fotos de la sede | `src/config.ts` → `CONFIG.sede` y `src/sections/Sede.tsx` |
| Texto de la causa y compromisos | `src/sections/Causa.tsx` |
| Organizador, contacto y redes | `src/sections/Organizador.tsx` y `src/config.ts` |
| Fechas importantes | `src/sections/Agenda.tsx` |
| Rutas, horarios de salida e hidratación | `src/sections/Ruta.tsx` |
| Kit, premios y patrocinadores | `src/sections/Kit.tsx`, `Premios.tsx`, `Patrocinadores.tsx` |
| Reglamento y carta responsiva | `src/sections/Footer.tsx` |
| Título y descripción para Google y WhatsApp | `index.html` |
| Colores y tipografía | `src/index.css` |

Las imágenes van en `public/img/` y se usan con `img('archivo.png')`.

## Estructura

```
src/
  config.ts            configuración editable
  sections/            una sección de la página por archivo (cada una es un "kilómetro")
  components/          piezas compartidas: menú, dorsal, cuenta regresiva, ventanas
  registro/
    store.ts           tablero de números y conexión con Firestore (mismo modelo que firestore.rules)
    Tablero.tsx        paso 2: elegir números
    Registro.tsx       asistente de inscripción en 4 pasos y confirmación
    datos.ts           validación, armado de la inscripción y texto para copiar
_anterior/             versión anterior en HTML/CSS/JS (con las fotos de Chautla), solo como respaldo
```

## Publicación automática (Wasmer)

Cada push a `main` ejecuta la GitHub Action `.github/workflows/sitio.yml`: compila la página y deja el
resultado en la rama **`sitio`**, que es la que despliega Wasmer. Si un despliegue no se actualiza, revisa
la pestaña **Actions** del repositorio en GitHub.
