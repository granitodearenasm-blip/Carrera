// Aplica el tema claro u oscuro antes de pintar (misma clave y atributo que src/shared/theme.ts).
// Va como archivo y no en línea para que la Content-Security-Policy no tenga que permitir scripts en línea.
(function () {
  try {
    var p = JSON.parse(localStorage.getItem('hanguk:tema') || '"sistema"');
    var oscuro = p === 'oscuro' || (p === 'sistema' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = oscuro ? 'dark' : 'light';
    if (oscuro) document.querySelector('meta[name="theme-color"]').setAttribute('content', '#2A1A0A');
  } catch (e) {}
})();
