"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    
    // Déclenche l'animation florale
    setIsTransitioning(true);

    // Redirection après la fin de l'animation (800ms)
    setTimeout(() => {
      window.location.href = href;
    }, 800);
  };

  return (
    <div className="relative flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black overflow-hidden">
      
      {/* L'ÉCRAN DE TRANSITION FLORALE */}
      <div
        className={`fixed inset-0 z-50 pointer-events-none transition-all duration-700 ease-in-out bg-gradient-to-br from-fuchsia-600 via-purple-600 to-cyan-500`}
        style={{
          clipPath: isTransitioning 
            ? 'circle(150% at calc(50% + 0px) calc(50% + 150px))' // S'étend sur tout l'écran
            : 'circle(0% at 50% 70%)', // Caché au niveau du bouton
          opacity: isTransitioning ? 1 : 0,
        }}
      >
        {/* Motifs de particules lumineuses/florales en arrière-plan pendant la transition */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(circle_at_30%_30%,#34d399_0%,transparent_50%),radial-gradient(circle_at_70%_60%,#f472b6_0%,transparent_50%)] animate-pulse" />
      </div>

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
            Ce site n'est pas encore disponible
          </p>
        </div>
        
        {/* BOUTON ROND AVEC EFFET FLORESCENT */}
        <div className="flex flex-col items-center w-full justify-center mt-8">
          <a
            href="https://boutique-bisou.vth-mc.fr/dashboard"
            onClick={handleClick}
            className="group relative flex items-center justify-center w-24 h-24 rounded-full text-white font-medium text-sm text-center shadow-lg transform transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]"
          >
            {/* Effet de brillance magique au survol */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-bl from-cyan-400 via-fuchsia-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out mix-blend-screen" />
            
            {/* Texte du bouton */}
            <span className="relative z-10 tracking-wider uppercase font-bold text-xs">
              Entrer
            </span>
            
            {/* Cercles de diffusion de couleur "pétales" en tâche de fond */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-400 to-light-blue-500 blur-sm opacity-30 group-hover:opacity-70 group-hover:animate-spin transition duration-500" />
          </a>
        </div>
      </main>
    </div>
  );
}
