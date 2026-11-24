import { Component, type ReactNode } from 'react';

/** Si una parte de la página falla al dibujarse, muestra un aviso en su lugar en vez de dejarla en blanco. */
export class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[error]', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      this.props.fallback ?? (
        <div role="alert" className="mx-auto my-16 max-w-md rounded-lg bg-surface p-6 text-center estampa">
          <p className="subtitulo">Esta parte no cargó</p>
          <p className="mt-2 text-small text-fg-muted">Recarga la página. Si sigue igual, escríbenos a granitodearena.sm@gmail.com.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-4 min-h-11 cursor-pointer font-bold text-link underline underline-offset-4">
            Recargar la página
          </button>
        </div>
      )
    );
  }
}
