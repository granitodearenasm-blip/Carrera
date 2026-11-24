import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTema } from '../../shared/theme';

// Cloudflare Turnstile (igual que en Trellum): evita que un script abra sesiones anónimas en masa y
// aparte todos los números. Supabase revisa el token (Authentication → Attack Protection).
// Sin clave de sitio no estorba. Es invisible salvo que Cloudflare pida un clic.

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const FALLO = 'No pudimos verificar que eres una persona. Recarga la página o prueba sin bloqueadores de anuncios.';

interface Turnstile {
  render: (contenedor: HTMLElement, opciones: Record<string, unknown>) => string;
  execute: (id: string) => void;
  reset: (id: string) => void;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let cargando: Promise<Turnstile> | null = null;
function cargarTurnstile(): Promise<Turnstile> {
  cargando ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT_URL;
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error(FALLO)));
    s.onerror = () => reject(new Error(FALLO));
    document.head.append(s);
  });
  cargando.catch(() => (cargando = null));
  return cargando;
}

export interface Captcha {
  /** Corre la revisión y devuelve el token; undefined si no hace falta. */
  getToken: () => Promise<string | undefined>;
  /** Donde Cloudflare muestra su recuadro, solo si pide un clic */
  element: ReactNode;
}

type Espera = { resolve: (t: string) => void; reject: (e: Error) => void };

export function useCaptcha(): Captcha {
  const { tema } = useTema();
  const [contenedor, setContenedor] = useState<HTMLDivElement | null>(null);
  const widget = useRef<Promise<string> | null>(null);
  const espera = useRef<Espera | null>(null);

  useEffect(() => {
    if (!SITE_KEY || !contenedor) return;
    let vivo = true;
    const resolver = (v: string | Error) => {
      const e = espera.current;
      espera.current = null;
      if (typeof v === 'string') e?.resolve(v);
      else e?.reject(v);
    };
    widget.current = cargarTurnstile().then((t) => {
      if (!vivo) throw new Error(FALLO);
      return t.render(contenedor, {
        sitekey: SITE_KEY,
        theme: tema,
        language: 'es',
        size: 'flexible',
        execution: 'execute',
        appearance: 'interaction-only',
        callback: (v: string) => resolver(v),
        'error-callback': () => resolver(new Error(FALLO)),
      });
    });
    widget.current.catch(() => resolver(new Error(FALLO)));
    return () => {
      vivo = false;
      void widget.current?.then((id) => window.turnstile?.remove(id)).catch(() => {});
      widget.current = null;
    };
    // El tema queda fijo mientras vive el widget.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contenedor]);

  const getToken = useCallback(async () => {
    if (!SITE_KEY) return undefined;
    if (!widget.current) throw new Error(FALLO);
    const id = await widget.current;
    return new Promise<string>((resolve, reject) => {
      espera.current = { resolve, reject };
      window.turnstile?.execute(id);
    });
  }, []);

  return { getToken, element: SITE_KEY ? <div ref={setContenedor} /> : null };
}
