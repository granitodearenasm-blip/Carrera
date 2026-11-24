import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { CONFIG, INSTAGRAM_URL } from '../../config';
import { img } from '../../shared/format';
import { IconButton } from '../../shared/ui/IconButton';

type Post = {
  permalink?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  mediaType?: string;
  caption?: string;
  prunedCaption?: string;
  sizes?: { medium?: { mediaUrl?: string }; large?: { mediaUrl?: string } };
};
// large para que se vea nítido en el cuadro más grande
const imagenDe = (p: Post) => p.sizes?.large?.mediaUrl ?? p.sizes?.medium?.mediaUrl ?? (p.mediaType === 'VIDEO' ? (p.thumbnailUrl ?? p.mediaUrl) : p.mediaUrl);

/** Carrusel de Instagram vía Behold (CONFIG.instagram). Sin feed, invita a seguir la cuenta. */
export function Instagram() {
  const cfg = CONFIG.instagram;
  const [posts, setPosts] = useState<Post[]>([]);
  const pista = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pista.current;
    if (!cfg.feedUrl || !el) return;
    // Se carga solo cuando la sección está cerca de la pantalla
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        fetch(cfg.feedUrl)
          .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
          .then((d) => {
            const lista: Post[] = Array.isArray(d) ? d : (d.posts ?? []);
            setPosts(lista.filter((p) => p?.permalink && imagenDe(p)).slice(0, cfg.maxPublicaciones));
          })
          .catch((e) => console.warn('[instagram]', e));
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cfg.feedUrl, cfg.maxPublicaciones]);

  const mover = (dir: number) => pista.current?.scrollBy({ left: dir * pista.current.clientWidth * 0.9, behavior: 'smooth' });

  return (
    <div id="instagram" className="mt-20">
      <div className="flex items-end justify-between gap-4">
        <h3 className="subtitulo">
          Lo último de{' '}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="text-link underline decoration-2 underline-offset-4">
            @granitodearena.sm
          </a>
        </h3>
        {posts.length > 0 ? (
          <div className="flex gap-2">
            <IconButton icon={ChevronLeft} label="Publicaciones anteriores" variant="secondary" onPress={() => mover(-1)} />
            <IconButton icon={ChevronRight} label="Publicaciones siguientes" variant="secondary" onPress={() => mover(1)} />
          </div>
        ) : null}
      </div>
      <div
        ref={pista}
        tabIndex={posts.length ? 0 : -1}
        aria-label="Publicaciones recientes de Instagram"
        className="mt-5 flex snap-x [scrollbar-width:thin] gap-4 overflow-x-auto pt-1 pb-4 pl-1"
      >
        {posts.length ? (
          posts.map((p) => {
            const texto = (p.prunedCaption ?? p.caption ?? '').trim();
            return (
              <a
                key={p.permalink}
                href={p.permalink}
                target="_blank"
                rel="noopener"
                className="group relative aspect-[4/5] w-72 shrink-0 snap-start overflow-hidden rounded-lg bg-sunken estampa-sm sm:w-80"
              >
                {/* 4:5 es el formato vertical de Instagram; contain para que ningún post se corte */}
                <img
                  src={imagenDe(p)}
                  alt={texto.slice(0, 120) || 'Publicación de Instagram'}
                  loading="lazy"
                  className="size-full object-contain transition-transform duration-(--duration-slow) group-hover:scale-105"
                />
              </a>
            );
          })
        ) : (
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="flex w-full items-center gap-5 rounded-lg bg-surface p-5 estampa transition-colors hover:bg-hover">
            <img src={img('logo-granito-de-arena.png')} alt="" width={64} height={64} className="size-16" />
            <span className="min-w-0 flex-1">
              <strong className="block font-display text-[1.15rem]">Síguenos en Instagram</strong>
              <span className="text-fg-muted">Novedades de HANGUK RUN y del camino de la delegación.</span>
            </span>
            <ExternalLink aria-hidden="true" className="shrink-0" />
          </a>
        )}
      </div>
    </div>
  );
}
