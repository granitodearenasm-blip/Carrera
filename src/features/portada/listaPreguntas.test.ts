import { describe, expect, it } from 'vitest';
import { CONFIG } from '../../config';
import { PREGUNTAS } from './listaPreguntas';

const texto = PREGUNTAS.map((p) => p.respuesta).join(' ');

describe('preguntas frecuentes', () => {
  it('el precio y el plazo de pago salen de la configuración', () => {
    expect(texto).toContain(`$${CONFIG.categorias[0].precio}`);
    expect(texto).toContain(`${CONFIG.pago.diasParaPagar} días`);
  });
  it('la edad mínima y el máximo por grupo salen de la configuración', () => {
    expect(texto).toContain(`${CONFIG.edadMinima} años`);
    expect(texto).toContain(`hasta ${CONFIG.corredoresMaximo} personas`);
  });
  it('la cuenta para pagar sale de la configuración', () => {
    expect(texto).toContain(CONFIG.pago.clabe);
    expect(texto).toContain(CONFIG.pago.titular);
  });
  it('no hay preguntas repetidas', () => {
    expect(new Set(PREGUNTAS.map((p) => p.pregunta)).size).toBe(PREGUNTAS.length);
  });
});
