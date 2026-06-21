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

// Légères variations pour que la pile ait l'air organique plutôt que mécanique.
const ROT_JITTER = [0, -6, 5, -4, 7];

const SWIPE_MS = 550; // durée du swipe vers la sortie
const SETTLE_MS = 480; // durée du repositionnement de la pile
const FRONT_HOLD_MS = 2400; // temps passé devant avant de swiper

const HOLD_PAUSE = SWIPE_MS + SETTLE_MS + FRONT_HOLD_MS;

export default function HomePage() {
  // order[0] = carte du dessus, order[4] = carte du dessous
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

      // après l'animation de sortie, on envoie la carte au fond de la pile
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
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 px-6 py-16 lg:flex-row lg:gap-20">
        {/* Texte d'intro */}
        <div className="max-w-md text-center lg:text-left">
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
          <Link
            href="/dashboard"
            className="mt-8 inline-block rounded-lg bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
          >
            Accéder au tableau de bord
          </Link>
        </div>

        {/* Pile de photos qui swipent */}
        <div
          className="relative h-[440px] w-[300px] shrink-0"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {order.map((imgIndex, pos) => {
            const isFront = pos === 0;
            const isSwiping = swipingId === imgIndex;

            // position dans la pile (0 = devant ... 4 = derrière)
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
                <img
                  src={IMAGES[imgIndex]}
                  alt={`Vêtement ${imgIndex + 1}`}
                  className="h-full w-full rounded-3xl object-cover shadow-2xl ring-1 ring-black/5"
                  draggable={false}
                />

                {isFront && !isSwiping && (
                  <div className="pointer-events-none absolute bottom-4 right-4 flex h-9 w-9 animate-pulse items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-md dark:bg-zinc-900/90 dark:text-zinc-200">
                    <svg
                      width="16"
                      height="16"
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
            );
          })}

          {/* Indicateurs de progression */}
          <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 gap-1.5">
            {IMAGES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  order[0] === i
                    ? "w-5 bg-pink-500"
                    : "w-1.5 bg-zinc-300 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
