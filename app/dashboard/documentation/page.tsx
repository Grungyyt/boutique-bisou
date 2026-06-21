"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [status, setStatus] = useState<"idle" | "blooming" | "loading">("idle");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.href;

    // Étape 1 : Déclencher l'explosion florale
    setStatus("blooming");

    // Étape 2 : Passer au chargement avec les fleurs après 800ms
    setTimeout(() => {
      setStatus("loading");
    }, 800);

    // Étape 3 : Redirection finale après l'affichage du chargement (ex: 2.5 secondes)
    setTimeout(() => {
      window.location.href = href;
    }, 2800);
  };

  return (
    <div className="relative flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black overflow-hidden">
      
      {/* STYLE CSS POUR LES ANIMATIONS DE FLEURS ET PÉTALES */}
      <style jsx global>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes float-petal {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(45deg); opacity: 0; }
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
        .petal-1 { animation: float-petal 3s ease-in-out infinite; }
        .petal-2 { animation: float-petal 4s ease-in-out infinite 1s; }
      `}</style>

      {/* RIDEAU DE TRANSITION ET CHARGEMENT FLORAL */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-700 ease-in-out bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 text-white`}
        style={{
          clipPath: status !== "idle"
            ? 'circle(150% at 50% 70%)'
            : 'circle(0% at 50% 70%)',
          opacity: status !== "idle" ? 1 : 0,
          pointerEvents: status !== "idle" ? "all" : "none",
        }}
      >
        {/* Graphisme de Fleur Géante en SVG (qui tourne et pulse) */}
        <div className="relative w-48 h-48 mb-6 animate-spin-slow animate-pulse-soft">
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
          
          {/* Petits pétales volants décoratifs */}
          <div className="absolute top-0 left-4 w-4 h-4 bg-pink-200 rounded-full opacity-0 petal-1" />
          <div className="absolute bottom-4 right-2 w-3 h-3 bg-yellow-200 rounded-full opacity-0 petal-2" />
        </div>

        {/* Message de chargement qui apparaît après l'éclosion */}
        <div className={`text-center transition-all duration-500 transform ${status === "loading" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <h2 className="text-2xl font-bold tracking-wide animate-pulse">Chargement en cours...</h2>
          <p className="text-sm text-pink-200 mt-2">Préparation de votre espace BisouData</p>
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
