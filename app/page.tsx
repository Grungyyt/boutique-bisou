"use client";

import Link from "next/link";

// Les 5 photos, hébergées sur le storage.
const IMAGES = [
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(1).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(2).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(3).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(4).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(5).jpg",
];

const CYCLE_SECONDS = 10; // durée totale d'un tour complet de la pile
const STEP = CYCLE_SECONDS / IMAGES.length; // temps passé "devant" par photo

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 px-6 py-16 lg:flex-row lg:gap-16">
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

        {/* Pile de photos qui swipent en boucle */}
        <div className="relative h-[420px] w-[300px] shrink-0 [perspective:1200px]">
          {IMAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Vêtement ${i + 1}`}
              className="stack-card absolute inset-0 h-full w-full rounded-3xl object-cover shadow-xl ring-1 ring-black/5"
              style={{
                animationDelay: `${i * STEP}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .stack-card {
          animation-name: stackCycle;
          animation-duration: ${CYCLE_SECONDS}s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }

        @keyframes stackCycle {
          /* devant la pile, bien visible */
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
            z-index: 50;
          }
          14% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
            z-index: 50;
          }
          /* swipe vers la droite, comme une carte qu'on jette */
          19% {
            transform: translate(140%, -8%) rotate(22deg) scale(0.96);
            opacity: 0;
            z-index: 50;
          }
          /* réapparaît instantanément tout au fond de la pile */
          19.5% {
            transform: translate(0, 48px) rotate(-7deg) scale(0.8);
            opacity: 1;
            z-index: 10;
          }
          /* puis remonte progressivement, position par position */
          38% {
            transform: translate(0, 36px) rotate(6deg) scale(0.85);
            z-index: 20;
          }
          57% {
            transform: translate(0, 24px) rotate(-5deg) scale(0.9);
            z-index: 30;
          }
          76% {
            transform: translate(0, 12px) rotate(4deg) scale(0.95);
            z-index: 40;
          }
          100% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
            z-index: 50;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .stack-card {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
