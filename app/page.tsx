"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// Les 5 photos, hébergées sur le storage.
const IMAGES = [
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(1).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(2).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(3).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(4).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(5).jpg",
];

// Tags affichés en bas à gauche de chaque carte (comme les pastilles de la vidéo).
const TAGS: [string, string][] = [
  ["BOUTIQUE BISOU", "Ouverture 2025 2026"],
  ["BOUTIQUE BISOU", "Dans la boutique"],
  ["BOUTIQUE BISOU", "Décoration"],
  ["BOUTIQUE BISOU", "Discussions pendant l'ouverture"],
  ["BOUTIQUE BISOU", "Ouverture avec Les Medias"],
];

const ROT_JITTER = [0, -6, 5, -4, 7];

const SWIPE_MS = 550;
const SETTLE_MS = 480;
const FRONT_HOLD_MS = 2400; // temps passé devant avant de swiper

const HOLD_PAUSE = SWIPE_MS + SETTLE_MS + FRONT_HOLD_MS;

export default function HomePage() {
  const [order, setOrder] = useState<number[]>(IMAGES.map((_, i) => i));
  const [swipingId, setSwipingId] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runCycle = useCallback(() => {
    timerRef.current = setTimeout(() => {
      if (paused) {
        runCycle();
        return;
      }
      setOrder((prev) => {
        setSwipingId(prev[0]);
        return prev;
      });

      setTimeout(() => {
        setOrder((prev) => [...prev.slice(1), prev[0]]);
        setSwipingId(null);
      }, SWIPE_MS);

      runCycle();
    }, HOLD_PAUSE);
  }, [paused]);

  useEffect(() => {
    runCycle();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-zinc-50 dark:bg-black">
      {/* GIF fixe sur le côté gauche */}
      <div className="fixed left-4 bottom-8 z-50 hidden lg:block">
        <img
          src="https://storage.vth-mc.fr/img/web/marche.gif"
          alt="Support"
          className="h-32 w-auto"
        />
      </div>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 px-6 py-16 lg:flex-row lg:gap-20">
        {/* Texte d'intro */}
        <div className="max-w-md text-center lg:text-left">
          {/* Logo Bisou - Agrandit ici avec h-32 */}
          <div className="mb-8 flex justify-center lg:justify-start">
            <img 
              src="https://storage.vth-mc.fr/pierred-dubois/img/web/logo-bisou.png" 
              alt="Logo Boutique Bisou" 
              className="h-32 w-auto object-contain"
            />
          </div>
          
          <span className="mb-4 inline-block rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Boutique Bisou
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
            Des vêtements choisis avec cœur
          </h1>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            Chaque pièce a sa propre histoire. Échangez vos tickets contre des
            vêtements uniques, sélectionnés un à un.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              href="/boutique"
              className="inline-block rounded-lg bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            >
              Voir les articles
            </Link>
            <Link
              href="/dashboard"
              className="inline-block rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Tableau de bord
            </Link>
            <a
              href="https://ko-fi.com/vth"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              <img
                src="https://storage.vth-mc.fr/img/web/marche.gif"
                alt=""
                className="h-5 w-auto"
              />
              Soutenir
            </a>
          </div>
        </div>

        {/* Pile de photos qui swipent, façon vidéo */}
        <div
          className="relative h-[460px] w-[300px] shrink-0"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {order.map((imgIndex, pos) => {
            const isFront = pos === 0;
            const isSwiping = swipingId === imgIndex;

            const depth = isSwiping ? 0 : pos;
            const baseRotate = ROT_JITTER[imgIndex];
            const stackRotate = depth === 0 ? 0 : baseRotate * (0.55 + depth * 0.18);
            const translateY = depth * 14;
            const scale = 1 - depth * 0.055;

            const transform = isSwiping
              ? `translate(135%, -10%) rotate(${28 + baseRotate}deg) scale(0.92)`
              : `translateY(${translateY}px) rotate(${stackRotate}deg) scale(${scale})`;

            return (
              <div
                key={imgIndex}
                className="absolute inset-0"
                style={{
                  zIndex: 50 - pos,
                  transform,
                  opacity: isSwiping ? 0 : 1,
                  transition: isSwiping
                    ? `transform ${SWIPE_MS}ms cubic-bezier(.45,0,.55,1), opacity ${SWIPE_MS}ms ease-out`
                    : `transform ${SETTLE_MS}ms cubic-bezier(.22,1,.36,1), opacity 250ms ease-out`,
                  willChange: "transform, opacity",
                }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
                  <img
                    src={IMAGES[imgIndex]}
                    alt={`Vêtement ${imgIndex + 1}`}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                  {/* voile pour la lisibilité des éléments d'UI */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

                  {/* toggle décoratif en haut à gauche */}
                  {isFront && (
                    <div className="absolute left-3 top-3 flex h-5 w-9 items-center rounded-full bg-white/25 px-0.5 backdrop-blur-sm">
                      <span className="h-4 w-4 rounded-full bg-emerald-400 shadow-sm" />
                    </div>
                  )}

                  {/* tags en bas à gauche */}
                  {isFront && (
                    <div className="absolute bottom-3 left-3 flex gap-1.5">
                      {TAGS[imgIndex].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-black/35 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* flèche de swipe en bas à droite */}
                  {isFront && !isSwiping && (
                    <div className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-md">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 17 17 7M9 7h8v8" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Indicateurs de progression */}
          <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 gap-1.5">
            {IMAGES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  order[0] === i ? "w-5 bg-pink-500" : "w-1.5 bg-zinc-300 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
