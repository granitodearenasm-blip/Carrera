import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary';
import { Spinner } from '../shared/ui/Spinner';
import { ToastProvider } from '../shared/ui/Toast';
import Inicio from '../pages/Inicio';

// El panel se descarga aparte: la página pública no carga su código.
const Panel = lazy(() => import('../pages/Panel'));
const MiInscripcion = lazy(() => import('../pages/MiInscripcion'));

export default function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense
            fallback={
              <main className="flex min-h-dvh items-center justify-center gap-2 text-fg-muted">
                <Spinner /> Cargando…
              </main>
            }
          >
            <Routes>
              <Route path="/panel" element={<Panel />} />
              <Route path="/mi-inscripcion" element={<MiInscripcion />} />
              <Route path="*" element={<Inicio />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </ToastProvider>
  );
}
