import { describe, expect, it } from 'vitest';
import { armarInscripcion, CORREDOR_VACIO, errorDeCampo, REGLAS_CONTACTO, REGLAS_CORREDOR } from './datos';

describe('validación de campos', () => {
  it('obligatorio vacío', () => expect(errorDeCampo('  ', REGLAS_CORREDOR.nombre)).toMatch(/obligatorio/));
  it('nombre corto', () => expect(errorDeCampo('Ana', REGLAS_CORREDOR.nombre)).toMatch(/al menos 5/));
  it('correo incompleto', () => expect(errorDeCampo('ana@gmail', REGLAS_CONTACTO.correo)).toMatch(/correo completo/));
  it('correo bien', () => expect(errorDeCampo('ana@gmail.com', REGLAS_CONTACTO.correo)).toBe(''));
  it('teléfono con 9 dígitos', () => expect(errorDeCampo('222 123 456', REGLAS_CONTACTO.telefono)).toMatch(/10 dígitos/));
  it('teléfono con espacios pero 10 dígitos', () => expect(errorDeCampo('222 123 4567', REGLAS_CONTACTO.telefono)).toBe(''));
  it('edad fuera de rango', () => {
    expect(errorDeCampo('11', REGLAS_CORREDOR.edad)).toMatch(/entre 12 y 90/);
    expect(errorDeCampo('91', REGLAS_CORREDOR.edad)).toMatch(/entre 12 y 90/);
    expect(errorDeCampo('12.5', REGLAS_CORREDOR.edad)).toMatch(/entre/);
    expect(errorDeCampo('12', REGLAS_CORREDOR.edad)).toBe('');
  });
});

describe('armar la inscripción', () => {
  const contacto = { grupo: ' Las Ardillas ', responsable: 'Ana López', correo: ' ana@gmail.com ', telefono: '222-123-4567' };
  const corredor = {
    ...CORREDOR_VACIO,
    nombre: ' Ana López ',
    edad: '28',
    sexo: 'Femenino',
    categoria: '5K',
    talla: 'M',
    emergenciaNombre: 'Luis',
    emergenciaTelefono: '222 765 4321',
  };

  it('individual: sin datos de grupo y con el precio de su distancia', () => {
    const i = armarInscripcion([128], [corredor], contacto);
    expect(i.tipo).toBe('Individual');
    expect(i.grupo).toBeUndefined();
    expect(i.total).toBe(350);
    expect(i.corredores[0]).toMatchObject({ numero: 128, nombre: 'Ana López', emergenciaTelefono: '2227654321' });
    expect(i.telefono).toBe('2221234567');
    expect(i.correo).toBe('ana@gmail.com');
  });

  it('grupo: 350 por corredor y nombre del grupo limpio', () => {
    const i = armarInscripcion([10, 11, 12], [corredor, corredor, corredor], contacto);
    expect(i.tipo).toBe('Grupo');
    expect(i.grupo).toBe('Las Ardillas');
    expect(i.total).toBe(1050);
  });
});
