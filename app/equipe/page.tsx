"use client";

import Link from "next/link";

export default function EquipePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center p-6 text-center">
      {/* Conteneur de la vidéo d'animation */}
      <div className="w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/10 dark:ring-white/10 mb-8">
        <video
          src="https://storage.vth-mc.fr/cat.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Titre et Message */}
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 max-w-md mb-3">
        Pour le moment rien n'est encore mis ici.
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
        Mais vous pouvez aller découvrir nos derniers vêtements sélectionnés avec soin !
      </p>

      {/* Bouton de retour vers la boutique */}
      <Link
        href="/boutique"
        className="inline-block rounded-lg bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 hover:scale-105 transform duration-200"
      >
        Voir les Articles
      </Link>
    </div>
  );
}
