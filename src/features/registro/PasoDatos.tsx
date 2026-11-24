import { ArrowLeft } from 'lucide-react';
import { CONFIG } from '../../config';
import { Button } from '../../shared/ui/Button';
import { Select, TextField } from '../../shared/ui/fields';
import { idContacto, idCorredor, type Formulario } from './useFormulario';
import { intentarIr, useRegistro } from './store';
import type { DatosCorredor } from './datos';

const opciones = (lista: readonly string[]) => lista.map((x) => ({ value: x, label: x }));

/** Paso 3: contacto y datos de cada corredor. */
export function PasoDatos({ f }: { f: Formulario }) {
  const s = useRegistro();
  return (
    <div>
      <h3 tabIndex={-1} className="titulo">
        {f.grupo ? 'Datos del grupo' : 'Tus datos'}
      </h3>
      <p className="mt-2 text-fg-muted">Los usamos solo para la carrera: confirmar tu inscripción, preparar tu kit y avisar a tu contacto si algo pasa.</p>

      <fieldset className="mt-7 grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 subtitulo">{f.grupo ? 'Quién responde por el grupo' : 'Cómo te contactamos'}</legend>
        {f.grupo ? (
          <>
            <TextField
              id={idContacto('grupo')}
              label="Nombre del grupo"
              hint="Equipo, empresa, familia…"
              required
              value={f.contacto.grupo}
              onChangeText={(v) => f.cambiarContacto('grupo', v)}
              onBlur={() => f.salirContacto('grupo')}
              error={f.errores[idContacto('grupo')]}
              className="sm:col-span-2"
            />
            <TextField
              id={idContacto('responsable')}
              label="Nombre de quien responde"
              required
              autoComplete="name"
              value={f.contacto.responsable}
              onChangeText={(v) => f.cambiarContacto('responsable', v)}
              onBlur={() => f.salirContacto('responsable')}
              error={f.errores[idContacto('responsable')]}
              className="sm:col-span-2"
            />
          </>
        ) : null}
        <TextField
          id={idContacto('correo')}
          label="Correo"
          kind="email"
          required
          autoComplete="email"
          value={f.contacto.correo}
          onChangeText={(v) => f.cambiarContacto('correo', v)}
          onBlur={() => f.salirContacto('correo')}
          error={f.errores[idContacto('correo')]}
        />
        <TextField
          id={idContacto('telefono')}
          label="WhatsApp"
          hint="10 dígitos"
          kind="tel"
          required
          autoComplete="tel-national"
          value={f.contacto.telefono}
          onChangeText={(v) => f.cambiarContacto('telefono', v)}
          onBlur={() => f.salirContacto('telefono')}
          error={f.errores[idContacto('telefono')]}
        />
      </fieldset>

      <div className="mt-10 space-y-6">
        {s.seleccion.map((numero, i) => {
          const d = f.corredor(i);
          const props = (k: keyof DatosCorredor) => ({
            id: idCorredor(i, k),
            required: true,
            error: f.errores[idCorredor(i, k)],
          });
          const texto = (k: keyof DatosCorredor) => ({
            ...props(k),
            value: d[k],
            onChangeText: (v: string) => f.cambiarCorredor(i, k, v),
            onBlur: () => f.salirCorredor(i, k),
          });
          const lista = (k: keyof DatosCorredor) => ({ ...props(k), value: d[k], onChange: (v: string) => f.cambiarCorredor(i, k, v) });
          return (
            <fieldset key={i} className="rounded-lg bg-surface p-5 contorno sm:p-6">
              <legend className="-ml-1 flex items-center gap-3 px-1">
                <span className="subtitulo">{f.grupo ? `Corredor ${i + 1}` : 'Quién corre'}</span>
                <span className="rounded-sm border-[2px] border-on-accent bg-accent px-2 py-1 cifra text-[1.1rem] text-on-accent">#{numero}</span>
              </legend>
              <div className="mt-3 grid gap-5 sm:grid-cols-2">
                <TextField {...texto('nombre')} label="Nombre completo" autoComplete={f.grupo ? 'off' : 'name'} className="sm:col-span-2" />
                <TextField {...texto('edad')} label="Edad" kind="number" hint={`De ${CONFIG.edadMinima} a ${CONFIG.edadMaxima} años`} />
                <Select {...lista('sexo')} label="Rama" hint="Para la premiación varonil y femenil" options={opciones(CONFIG.sexos)} />
                <Select {...lista('categoria')} label="Distancia" options={CONFIG.categorias.map((c) => ({ value: c.id, label: c.nombre }))} />
                <Select {...lista('talla')} label="Talla de playera" hint="Corte unisex" options={opciones(CONFIG.tallas)} />
                <TextField {...texto('emergenciaNombre')} label="Contacto de emergencia" hint="Alguien que no corra contigo" />
                <TextField {...texto('emergenciaTelefono')} label="Teléfono de emergencia" kind="tel" hint="10 dígitos" />
              </div>
            </fieldset>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Button label="Volver a los números" icon={ArrowLeft} variant="quiet" onPress={() => intentarIr(2)} />
        <Button label="Revisar inscripción" onPress={() => intentarIr(4, f.validar)} />
      </div>
    </div>
  );
}
