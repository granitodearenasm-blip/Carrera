import { useState } from 'react';
import { soloDigitos } from '../../shared/format';
import { CONTACTO_VACIO, CORREDOR_VACIO, errorDeCampo, REGLAS_CONTACTO, REGLAS_CORREDOR, type Contacto, type DatosCorredor, type Regla } from './datos';

/** Ids de los campos: el contacto es "c-correo"; el corredor 2 es "r1-nombre". */
export const idContacto = (k: keyof Contacto) => `c-${k}`;
export const idCorredor = (i: number, k: keyof DatosCorredor) => `r${i}-${k}`;

/**
 * Datos del paso 3. Se guardan por LUGAR de corredor: si alguien pierde su número y elige otro, sus
 * datos no se mezclan con los de otra persona. Sobreviven al ir y volver entre pasos.
 */
export function useFormulario(cantidad: number) {
  const [contacto, setContacto] = useState<Contacto>(CONTACTO_VACIO);
  const [corredores, setCorredores] = useState<DatosCorredor[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const grupo = cantidad > 1;

  function campos(): [string, string, Regla][] {
    const lista: [string, string, Regla][] = [];
    (Object.keys(REGLAS_CONTACTO) as (keyof Contacto)[]).forEach((k) => {
      if (!grupo && (k === 'grupo' || k === 'responsable')) return;
      lista.push([idContacto(k), contacto[k], REGLAS_CONTACTO[k]]);
    });
    for (let i = 0; i < cantidad; i++) {
      const d = corredores[i] ?? CORREDOR_VACIO;
      (Object.keys(REGLAS_CORREDOR) as (keyof DatosCorredor)[]).forEach((k) => lista.push([idCorredor(i, k), d[k], REGLAS_CORREDOR[k]]));
    }
    return lista;
  }

  /** Revisa todo; si algo falla, lleva el foco al primer campo con error. */
  function validar(): boolean {
    const nuevos: Record<string, string> = {};
    let primero: string | null = null;
    for (const [id, valor, regla] of campos()) {
      const msg = errorDeCampo(valor, regla);
      if (msg) {
        nuevos[id] = msg;
        primero ??= id;
      }
    }
    setErrores(nuevos);
    if (!primero) return true;
    const el = document.getElementById(primero);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => el?.focus({ preventScroll: true }), 350);
    return false;
  }

  // Un campo con error se revisa al escribir; uno nuevo, al salir de él
  const revisar = (id: string, valor: string, regla: Regla, siempre = false) => {
    if (!siempre && !errores[id]) return;
    setErrores((e) => ({ ...e, [id]: errorDeCampo(valor, regla) }));
  };

  const cambiarContacto = (k: keyof Contacto, v: string) => {
    const valor = k === 'telefono' ? soloDigitos(v).slice(0, 10) : v;
    setContacto((c) => ({ ...c, [k]: valor }));
    revisar(idContacto(k), valor, REGLAS_CONTACTO[k]);
  };
  const salirContacto = (k: keyof Contacto) => contacto[k] && revisar(idContacto(k), contacto[k], REGLAS_CONTACTO[k], true);

  const corredor = (i: number) => corredores[i] ?? CORREDOR_VACIO;
  const cambiarCorredor = (i: number, k: keyof DatosCorredor, v: string) => {
    const valor = k === 'emergenciaTelefono' ? soloDigitos(v).slice(0, 10) : k === 'edad' ? soloDigitos(v).slice(0, 2) : v;
    setCorredores((lista) => {
      const copia = lista.slice();
      for (let j = 0; j <= i; j++) copia[j] ??= { ...CORREDOR_VACIO };
      copia[i] = { ...copia[i], [k]: valor };
      return copia;
    });
    // Las listas se revisan al elegir; el texto, si ya tenía error
    revisar(idCorredor(i, k), valor, REGLAS_CORREDOR[k], k === 'sexo' || k === 'categoria' || k === 'talla');
  };
  const salirCorredor = (i: number, k: keyof DatosCorredor) => {
    const v = corredor(i)[k];
    if (v) revisar(idCorredor(i, k), v, REGLAS_CORREDOR[k], true);
  };

  const limpiar = () => {
    setContacto(CONTACTO_VACIO);
    setCorredores([]);
    setErrores({});
  };

  return { contacto, corredores, errores, grupo, validar, cambiarContacto, salirContacto, corredor, cambiarCorredor, salirCorredor, limpiar };
}

export type Formulario = ReturnType<typeof useFormulario>;
