"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

type Petal = {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
};

const PETAL_COLORS = [
  "bg-pink-300",
  "bg-rose-300",
  "bg-amber-200",
  "bg-purple-300",
  "bg-fuchsia-300",
];

function generatePetals(count: number): Petal[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    angle: (360 / count) * i + (Math.random() * 16 - 8),
    distance: 90 + Math.random() * 70,
    size: 6 + Math.random() * 10,
    delay: Math.random() * 0.25,
    duration: 1.1 + Math.random() * 0.7,
    color: PETAL_COLORS[i % PETAL_COLORS.length],
  }));
}

export default function Home() {
  const [status, setStatus] = useState<"idle" | "blooming" | "loading">("idle");
  // Générés une seule fois pour éviter de regénérer le pattern à chaque render
  const petals = useMemo(() => generatePetals(16), []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.href;

    // Étape 1 : Déclencher l'explosion florale
    setStatus("blooming");

    // Étape 2 : Passer au chargement avec les fleurs après 800ms
    setTimeout(() => {
      setStatus("loading");
    }, 800);

    // Étape 3 : Redirection finale après l'affichage du chargement
    setTimeout(() => {
      window.location.href = href;
    }, 2800);
  };

  const active = status !== "idle";

  return (
    <div className="relative flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black overflow-hidden">

      {/* STYLE CSS POUR LES ANIMATIONS DE FLEURS ET PÉTALES */}
      <style jsx global>{`
        @keyframes spin-pulse {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.05); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes bloom-in {
          0% { transform: scale(0) rotate(-35deg); opacity: 0; }
          55% { transform: scale(1.18) rotate(8deg); opacity: 1; }
          75% { transform: scale(0.95) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes petal-burst {
          0% {
            transform: translate(-50%, -50%) rotate(var(--rot)) translate(0, 0) scale(0);
            opacity: 0;
          }
          18% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--rot)) translate(calc(var(--dist) * 0.35), 0) scale(1);
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--rot)) translate(var(--dist), 0) scale(0.3);
            opacity: 0;
          }
        }
        @keyframes ring-expand {
          0% { transform: scale(0.25); opacity: 0.55; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes text-rise {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-spin-pulse { animation: spin-pulse 6s ease-in-out infinite; }
        .animate-bloom-in { animation: bloom-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-petal-burst { animation: petal-burst var(--dur) ease-out var(--delay) forwards; }
        .animate-ring-expand { animation: ring-expand 1.5s ease-out infinite; }
        .animate-text-rise { animation: text-rise 0.5s ease-out 0.15s both; }
      `}</style>

      {/* RIDEAU DE TRANSITION ET CHARGEMENT FLORAL */}
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 text-white"
        style={{
          clipPath: active ? "circle(150% at 50% 70%)" : "circle(0% at 50% 70%)",
          transitionProperty: "clip-path, opacity",
          transitionDuration: "900ms",
          transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
          opacity: active ? 1 : 0,
          pointerEvents: active ? "all" : "none",
        }}
      >
        {/* Anneaux de pulsation derrière la fleur */}
        {active && (
          <>
            <span className="absolute w-48 h-48 rounded-full border-2 border-white/30 animate-ring-expand" />
            <span
              className="absolute w-48 h-48 rounded-full border-2 border-white/20 animate-ring-expand"
              style={{ animationDelay: "0.5s" }}
            />
          </>
        )}

        <div className="relative w-48 h-48 mb-6">
          {/* Pétales en explosion radiale */}
          {active &&
            petals.map((p) => (
              <span
                key={p.id}
                className={`absolute top-1/2 left-1/2 rounded-full ${p.color} animate-petal-burst`}
                style={
                  {
                    width: p.size,
                    height: p.size,
                    "--rot": `${p.angle}deg`,
                    "--dist": `${p.distance}px`,
                    "--dur": `${p.duration}s`,
                    "--delay": `${p.delay}s`,
                  } as React.CSSProperties
                }
              />
            ))}

          {/* Fleur centrale : entrée en bloom, puis rotation/pulsation continue */}
          <div className={active ? "animate-bloom-in" : "opacity-0"}>
            <div className="w-48 h-48 animate-spin-pulse">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-pink-300 opacity-90">
                {/* Centre de la fleur */}
                <circle cx="50" cy="50" r="12" className="text-yellow-300 fill-current" />
                {/* Pétales géométriques */}
                <path d="M50,15 C40,30 40,45 50,50 C60,45 60,30 50,15 Z" />
                <path d="M50,85 C40,70 40,55 50,50 C60,55 60,70 50,85 Z" />
                <path d="M15,50 C30,40 45,40 50,50 C45,60 30,60 15,50 Z" />
                <path d="M85,50 C70,40 55,40 50,50 C55,60 70,60 85,50 Z" />
                {/* Pétales diagonaux */}
                <g transform="rotate(45 50 50)">
                  <path d="M50,15 C40,30 40,45 50,50 C60,45 60,30 50,15 Z" />
                  <path d="M50,85 C40,70 40,55 50,50 C60,55 60,70 50,85 Z" />
                  <path d="M15,50 C30,40 45,40 50,50 C45,60 30,60 15,50 Z" />
                  <path d="M85,50 C70,40 55,40 50,50 C55,60 70,60 85,50 Z" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Message de chargement qui apparaît après l'éclosion */}
        <div
          className={`text-center transition-all duration-500 transform ${
            status === "loading" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h2 className="text-2xl font-bold tracking-wide animate-pulse">Chargement en cours...</h2>
          <p className={`text-sm text-pink-200 mt-2 ${status === "loading" ? "animate-text-rise" : ""}`}>
            Préparation de votre espace BisouData
          </p>
        </div>
      </div>

      {/* CONTENU PRINCIPAL DE LA PAGE */}
      <main className="flex flex-col flex-1 w-full max-w-3xl items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start z-10">
        <Image
          className="dark:invert"
          src="/logo-bisou.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left my-auto">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Bienvenue Sur BisouData by VTH Group
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Cette page n'est pas encore disponible.
          </p>
        </div>

        {/* BOUTON ROND AVEC SON STYLE FLORAL UNIQUE */}
        <div className="flex flex-col items-center w-full justify-center mt-8">
          <a
            href="https://boutique-bisou.vth-mc.fr"
            onClick={handleClick}
            className="group relative flex items-center justify-center w-28 h-28 rounded-full text-white font-semibold text-center shadow-xl transform transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 hover:shadow-[0_0_35px_rgba(244,63,94,0.6)]"
          >
            {/* Effet lumineux interne au survol */}
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

            {/* Texte centré */}
            <span className="relative z-10 uppercase tracking-wider text-xs">
              Entrer
            </span>

            {/* Couronne de "pétales/points" lumineux autour du bouton au survol */}
            <span className="absolute inset-0 rounded-full border border-pink-300 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none" />
          </a>
        </div>
      </main>
    </div>
  );
}
