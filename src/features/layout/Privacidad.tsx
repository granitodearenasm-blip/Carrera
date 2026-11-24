import { useEffect, useState } from 'react';
import { EMAIL } from '../../config';
import { Button } from '../../shared/ui/Button';
import { Dialog } from '../../shared/ui/Dialog';
import { alAbrirPrivacidad } from './eventos';

/**
 * Aviso de privacidad simplificado. ✏️ Granito de Arena debe revisarlo (Ley Federal de Protección de
 * Datos Personales en Posesión de los Particulares) antes de publicarlo como definitivo.
 */
export function Privacidad() {
  const [open, setOpen] = useState(false);
  useEffect(() => alAbrirPrivacidad(() => setOpen(true)), []);
  return (
    <Dialog open={open} onClose={() => setOpen(false)} title="Aviso de privacidad">
      <div className="space-y-4 text-fg">
        <p>
          <strong>Granito de Arena</strong>, colectivo ciudadano de San Martín Texmelucan, Puebla, es responsable de los datos que nos das al inscribirte a HANGUK RUN.
        </p>
        <div>
          <h3 className="subtitulo">Qué datos pedimos</h3>
          <p className="mt-1 text-fg-muted">
            Nombre, edad, rama, distancia, talla de playera, correo, teléfono y un contacto de emergencia de cada corredor; y, en grupos, el nombre del grupo y de quien lo
            representa.
          </p>
        </div>
        <div>
          <h3 className="subtitulo">Para qué los usamos</h3>
          <p className="mt-1 text-fg-muted">
            Solo para organizar la carrera: confirmar tu inscripción y tu pago, preparar tu kit, armar las listas de salida y premiación, y avisar a tu contacto de emergencia si
            hace falta.
          </p>
        </div>
        <div>
          <h3 className="subtitulo">Quién los ve</h3>
          <p className="mt-1 text-fg-muted">
            Únicamente el equipo organizador. No los vendemos, no los publicamos y no los compartimos con patrocinadores. Se guardan en una base de datos protegida a la que la
            página pública no tiene acceso de lectura.
          </p>
        </div>
        <div>
          <h3 className="subtitulo">Tus derechos</h3>
          <p className="mt-1 text-fg-muted">
            Puedes pedir ver, corregir o borrar tus datos, u oponerte a su uso, escribiendo a{' '}
            <a className="font-semibold text-link underline underline-offset-2" href={`mailto:${EMAIL}?subject=Mis%20datos%20en%20HANGUK%20RUN`}>
              {EMAIL}
            </a>
            .
          </p>
        </div>
      </div>
      <Button label="Entendido" fullWidth className="mt-7" onPress={() => setOpen(false)} />
    </Dialog>
  );
}
