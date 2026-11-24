-- =============================================================================
--  HANGUK RUN 2026 · 0002: el corredor consulta su inscripción y reporta su pago
--  Se ejecuta UNA vez en Supabase → SQL Editor, después de 0001 (ver docs/data-model.md).
--
--  Con folio + correo (lo que solo sabe quien se inscribió), la página "Mi inscripción" puede:
--   • consultar el estado: devuelve folio, total, fecha límite, números y el pago reportado. Nada más:
--     ni nombres, ni teléfonos, ni contactos de emergencia.
--   • reportar el pago (transferencia con su referencia, o efectivo) mientras esté pendiente.
--  Reportar NO marca como pagado: lo hace un organizador después de revisar el banco o la caja.
-- =============================================================================

alter table public.inscripciones
  add column pago_metodo text check (pago_metodo in ('transferencia', 'efectivo')),
  add column pago_referencia text check (length(pago_referencia) <= 80),
  add column pago_reportado timestamptz;

-- Busca la inscripción por folio y correo, sin importar mayúsculas ni espacios. Error si no coincide.
create function public.inscripcion_por_folio(p_folio bigint, p_correo text) returns public.inscripciones
language plpgsql stable security definer set search_path = ''
as $$
declare ins public.inscripciones;
begin
  if auth.uid() is null then raise exception 'sin-sesion'; end if;
  select * into ins from public.inscripciones i
    where i.folio = p_folio and i.correo = lower(trim(coalesce(p_correo, '')));
  if ins.id is null then raise exception 'no-encontrada'; end if;
  return ins;
end $$;

create function public.consultar_inscripcion(p_folio bigint, p_correo text)
returns table (folio bigint, total integer, estado_pago text, pagar_antes_de date, numeros integer[],
               pago_metodo text, pago_referencia text, pago_reportado timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
declare ins public.inscripciones := public.inscripcion_por_folio(p_folio, p_correo);
begin
  return query select ins.folio, ins.total, ins.estado_pago, ins.pagar_antes_de,
    (select array_agg(c.numero order by c.numero) from public.corredores c where c.inscripcion_id = ins.id),
    ins.pago_metodo, ins.pago_referencia, ins.pago_reportado;
end $$;

-- Guarda (o corrige) el pago reportado. Transferencia: la referencia o clave de rastreo es obligatoria.
-- Efectivo: la referencia es opcional (dónde pagó o quién lo recibió).
create function public.reportar_pago(p_folio bigint, p_correo text, p_metodo text, p_referencia text) returns timestamptz
language plpgsql security definer set search_path = ''
as $$
declare
  ins public.inscripciones := public.inscripcion_por_folio(p_folio, p_correo);
  ref text := nullif(trim(coalesce(p_referencia, '')), '');
  ahora timestamptz := now();
begin
  if ins.estado_pago = 'pagado' then raise exception 'ya-pagada'; end if;
  if ins.estado_pago = 'cancelado' then raise exception 'ya-cancelada'; end if;
  if p_metodo is null or p_metodo not in ('transferencia', 'efectivo') then raise exception 'datos-invalidos' using detail = 'metodo'; end if;
  if (p_metodo = 'transferencia' and (ref is null or length(ref) < 4)) or length(ref) > 80 then
    raise exception 'datos-invalidos' using detail = 'referencia';
  end if;

  update public.inscripciones
    set pago_metodo = p_metodo, pago_referencia = ref, pago_reportado = ahora, actualizado = ahora
    where id = ins.id;
  return ahora;
end $$;

-- Como las demás: solo con sesión (anónima o del panel). La de búsqueda es interna, nadie la llama directo.
revoke execute on function public.inscripcion_por_folio(bigint, text), public.consultar_inscripcion(bigint, text),
  public.reportar_pago(bigint, text, text, text) from public, anon;
revoke execute on function public.inscripcion_por_folio(bigint, text) from authenticated;
grant execute on function public.consultar_inscripcion(bigint, text), public.reportar_pago(bigint, text, text, text) to authenticated;
