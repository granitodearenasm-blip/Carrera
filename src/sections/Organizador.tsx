import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { CONFIG, EMAIL, FACEBOOK_URL, INSTAGRAM_URL } from '../config';
import { img } from '../lib/format';
import { btn, Km, Pendiente, Wrap } from '../components/ui';

export function Organizador() {
  return (
    <section id="organizador" className="py-24 lg:py-32">
      <Wrap>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            {/* ✏️ LOGO/FOTO DEL ORGANIZADOR */}
            {/* El logo suelto, como un sello, con un aro punteado desfasado detrás */}
            <div className="relative mx-auto aspect-square w-full max-w-sm lg:mx-0">
              <span aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 rounded-full border-2 border-dashed border-rojo/45" />
              <img
                src={img('logo-granito-de-arena.png')}
                alt="Logo de Granito de Arena"
                width={600}
                height={600}
                loading="lazy"
                className="relative size-full -rotate-6 object-contain drop-shadow-[0_18px_28px_rgb(28_20_10/0.2)]"
              />
            </div>
          </div>
          <div className="lg:col-span-7">
            <Km n="03" ko="주최">
              Organizador
            </Km>
            {/* ✏️ CAMBIAR: presentación, misión y trayectoria del organizador */}
            <h2 className="display mt-6 text-[clamp(3rem,7vw,5.5rem)]">Granito de Arena</h2>
            <p className="mt-4 text-xl leading-snug font-semibold">Visibilizamos, apoyamos y difundimos los derechos humanos y las buenas causas.</p>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink/80">
              Granito de Arena es un <strong className="text-ink">colectivo ciudadano, apartidista y sin fines de lucro</strong> de San Martín Texmelucan, Puebla, dedicado a
              los derechos humanos, la participación comunitaria y la sensibilización social.
            </p>
            <dl className="mt-8 max-w-2xl divide-y divide-ink/15 border-y border-ink/15">
              <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]">
                <dt className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">Misión</dt>
                <dd>Crear espacios para accionar y reflexionar a favor de los derechos humanos y las buenas causas.</dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]">
                <dt className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">Trayectoria</dt>
                <dd>
                  <Pendiente>año de inicio, principales proyectos y comunidades con las que han trabajado</Pendiente>
                </dd>
              </div>
            </dl>
            {/* ✏️ CAMBIAR: datos de contacto y redes */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${EMAIL}`} className={`${btn.base} ${btn.tinta} ${btn.md} normal-case`}>
                <Mail size={17} /> {EMAIL}
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className={`${btn.base} ${btn.borde} ${btn.md}`}>
                Instagram <ArrowUpRight size={16} />
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener" className={`${btn.base} ${btn.borde} ${btn.md}`}>
                Facebook <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
        <Instagram />
      </Wrap>
    </section>
  );
}

type Post = {
  permalink?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  mediaType?: string;
  caption?: string;
  prunedCaption?: string;
  sizes?: { medium?: { mediaUrl?: string } };
};
const imagenDe = (p: Post) => p.sizes?.medium?.mediaUrl ?? (p.mediaType === 'VIDEO' ? (p.thumbnailUrl ?? p.mediaUrl) : p.mediaUrl);

/** Carrusel de Instagram (se configura en CONFIG.instagram). Sin feed, invita a seguir la cuenta. */
function Instagram() {
  const cfg = CONFIG.instagram;
  const [posts, setPosts] = useState<Post[]>([]);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!cfg.feedUrl || !el) return;
    // Se carga solo cuando la sección está cerca de la pantalla
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        fetch(cfg.feedUrl)
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
          .then((d) => {
            const lista: Post[] = Array.isArray(d) ? d : (d.posts ?? []);
            setPosts(lista.filter((p) => p?.permalink && imagenDe(p)).slice(0, cfg.maxPublicaciones));
          })
          .catch((e) => console.warn('[instagram] No se pudo cargar el feed:', e));
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cfg.feedUrl, cfg.maxPublicaciones]);

  const mover = (dir: number) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.9, behavior: 'smooth' });

  return (
    <div id="instagram" className="mt-20 border-t border-ink/15 pt-10">
      <div className="flex items-end justify-between gap-4">
        <h3 className="text-2xl font-bold condensed">
          Lo último de{' '}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="text-rojo hover:underline">
            @granitodearena.sm
          </a>
        </h3>
        {posts.length > 0 && (
          <div className="flex gap-2">
            <button type="button" onClick={() => mover(-1)} aria-label="Publicaciones anteriores" className="rounded-full border-2 border-ink p-1.5 hover:bg-ink hover:text-paper">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => mover(1)} aria-label="Publicaciones siguientes" className="rounded-full border-2 border-ink p-1.5 hover:bg-ink hover:text-paper">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
      <div ref={track} tabIndex={0} aria-label="Publicaciones recientes de Instagram" className="mt-6 flex snap-x gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]">
        {posts.length ? (
          posts.map((p) => {
            const texto = (p.prunedCaption ?? p.caption ?? '').trim();
            return (
              <a key={p.permalink} href={p.permalink} target="_blank" rel="noopener" className="group relative aspect-square w-60 shrink-0 snap-start overflow-hidden rounded-[4px] bg-paper-2">
                <img src={imagenDe(p)} alt={texto.slice(0, 120) || 'Publicación de Instagram'} loading="lazy" className="size-full object-cover transition-transform group-hover:scale-105" />
                {p.mediaType === 'VIDEO' && <span className="absolute top-2 left-2 rounded-[3px] bg-ink/75 px-2 py-0.5 text-xs font-semibold text-paper">Reel</span>}
              </a>
            );
          })
        ) : (
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="flex w-full items-center gap-5 rounded-[4px] bg-card p-5 ring-1 ring-ink/10 hover:ring-ink/30">
            <img src={img('logo-granito-de-arena.png')} alt="" width={64} height={64} className="size-16 rounded-full" />
            <span className="min-w-0 flex-1">
              <strong className="block">Síguenos en Instagram</strong>
              <span className="text-ink/70">Novedades de HANGUK RUN y del trabajo de la delegación.</span>
            </span>
            <ArrowUpRight className="shrink-0 text-rojo" />
          </a>
        )}
      </div>
    </div>
  );
}
