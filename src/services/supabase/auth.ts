import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { requireSupabase, supabase } from './client';

// Dos tipos de sesión:
//  • Visitantes: anónima (sin correo ni contraseña), solo para saber de quién es cada apartado.
//    Requiere "Allow anonymous sign-ins" en Supabase y, si hay clave de Turnstile, el captcha.
//  • Organizadores: correo y contraseña; su cuenta debe estar en la tabla `organizadores`.

/** Id de la sesión actual; si no hay, abre una anónima. */
export async function asegurarSesionAnonima(captchaToken?: string): Promise<string> {
  const sb = requireSupabase();
  const { data } = await sb.auth.getSession();
  if (data.session) return data.session.user.id;
  const { data: nueva, error } = await sb.auth.signInAnonymously({ options: captchaToken ? { captchaToken } : undefined });
  if (error || !nueva.user) throw new Error(error?.message.includes('Anonymous sign-ins are disabled') ? 'anonimo-desactivado' : (error?.message ?? 'sin-sesion'));
  return nueva.user.id;
}

export async function entrarConContrasena(correo: string, contrasena: string) {
  const { error } = await requireSupabase().auth.signInWithPassword({ email: correo.trim(), password: contrasena });
  if (error) throw new Error(error.message.includes('Invalid login') ? 'Correo o contraseña incorrectos.' : 'No pudimos iniciar sesión. Revisa tu conexión e intenta de nuevo.');
}

export async function salir() {
  await supabase?.auth.signOut();
}

/** ¿La cuenta con sesión está en la tabla de organizadores? */
export async function soyOrganizador(): Promise<boolean> {
  const { data, error } = await requireSupabase().rpc('es_organizador');
  return !error && data === true;
}

/** Sesión actual y sus cambios. `undefined` mientras se revisa. */
export function useSesion(): Session | null | undefined {
  const [sesion, setSesion] = useState<Session | null | undefined>(supabase ? undefined : null);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSesion(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSesion(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return sesion;
}
