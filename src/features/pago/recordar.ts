import { borrar, guardar, leer } from '../../shared/storage';

// Folio y correo de la última inscripción hecha (o consultada) en este navegador, para que
// "Mi inscripción" ya los tenga escritos. Solo se guardan en el aparato de la persona.

const CLAVE = 'mi-inscripcion';

export type Recordada = { folio: number; correo: string };

export const leerRecordada = () => leer<Recordada | null>(CLAVE, null);
export const recordar = (r: Recordada) => guardar(CLAVE, r);
export const olvidar = () => borrar(CLAVE);
