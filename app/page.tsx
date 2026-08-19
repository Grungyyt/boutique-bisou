"use client";

import { useState } from "react";

// Les 5 photos avec leurs tags respectifs
const ITEMS = [
  {
    src: "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(1).jpg",
    tags: ["BOUTIQUE BISOU", "Ouverture 2025 2026"],
  },
  {
    src: "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(2).jpg",
    tags: ["BOUTIQUE BISOU", "Dans la boutique"],
  },
  {
    src: "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(3).jpg",
    tags: ["BOUTIQUE BISOU", "Décoration"],
  },
  {
    src: "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(4).jpg",
    tags: ["BOUTIQUE BISOU", "Discussions pendant l'ouverture"],
  },
  {
    src: "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(5).jpg",
    tags: ["BOUTIQUE BISOU", "Ouverture avec Les Medias"],
  },
];

export default function HomePage() {
  // Gestion de la newsletter
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage("");
    setStatusType("");

    try {
      const res = await fetch(
        "https://api.boutique-bisou.vth-mc.fr/newsletter/subscribe",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        setStatusType("success");
        setStatusMessage(data.message || "Inscription réussie !");
        setEmail("");
      } else {
        setStatusType("error");
        setStatusMessage(data.detail || "Une erreur est survenue.");
      }
    } catch {
      setStatusType("error");
      setStatusMessage("Impossible de contacter le serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Duplication de la liste pour assurer une boucle infinie et fluide
  const MARQUEE_ITEMS = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      {/* Styles CSS pour l'animation du marquee et la pause au survol */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* GIF fixe sur le côté gauche */}
      <div className="fixed bottom-8 left-4 z-50 hidden lg:block">
        <img
          src="https://storage.vth-mc.fr/img/web/marche.gif"
          alt="Support"
          className="h-32 w-auto object-contain"
        />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-16 gap-16">
        {/* En-tête / Hero */}
        <div className="flex w-full flex-col items-center justify-center text-center max-w-3xl">
          {/* Logo Bisou */}
          <div className="mb-8 flex justify-center">
            <img
              src="https://storage.vth-mc.fr/pierred-dubois/img/web/logo-bisou.png"
              alt="Logo Boutique Bisou"
              className="h-32 w-auto object-contain"
            />
          </div>

          <span className="mb-4 inline-block rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
            Boutique Bisou
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Des vêtements choisis avec cœur
          </h1>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 max-w-xl">
            Chaque pièce a sa propre histoire. Échangez vos tickets contre des
            vêtements uniques, sélectionnés un à un.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/boutique"
              className="inline-block rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95"
            >
              Voir les articles
            </a>
            <a
              href="/equipe"
              className="inline-block rounded-xl border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900 active:scale-95"
            >
              Voir l'Équipe
            </a>
            <a
              href="/verif"
              className="inline-block rounded-xl border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900 active:scale-95"
            >
              Tableau de bord
            </a>
            <a
              href="https://ko-fi.com/vth"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900 active:scale-95"
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

        {/* --- SECTION DÉFILANTE TYPE MODRINTH (MARQUEE) --- */}
        <div className="relative w-full overflow-hidden py-4">
          {/* Degradés sur les bords pour l'effet de fondu */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-zinc-50 to-transparent dark:from-black" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-zinc-50 to-transparent dark:from-black" />

          {/* Rail d'images qui défile de droite à gauche */}
          <div className="animate-marquee gap-6 pr-6">
            {MARQUEE_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="group relative h-[420px] w-[280px] shrink-0 overflow-hidden rounded-3xl bg-zinc-200 shadow-xl transition-transform duration-300 hover:scale-[1.02] dark:bg-zinc-800 ring-1 ring-black/5"
              >
                <img
                  src={item.src}
                  alt={`Vêtement ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

                {/* Badge Status */}
                <div className="absolute left-3 top-3 flex h-5 w-9 items-center rounded-full bg-white/25 px-0.5 backdrop-blur-sm">
                  <span className="h-4 w-4 rounded-full bg-emerald-400 shadow-sm animate-pulse" />
                </div>

                {/* Tags du T-shirt */}
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5 max-w-[90%]">
                  {item.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Inscription Newsletter Nouveautés */}
        <div className="w-full max-w-xl rounded-3xl border border-pink-100 bg-white/80 p-8 text-center shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 dark:bg-pink-950/50">
            <span className="text-2xl">💌</span>
          </div>
          <h3 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Alerte nouveaux vêtements
          </h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Soyez le premier informé dès qu’un nouvel article est ajouté à la boutique. Recevez la photo et les détails directement par e-mail.
          </p>

          <form onSubmit={handleSubscribe} className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre.email@exemple.com"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full shrink-0 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? "Inscription..." : "M'inscrire"}
            </button>
          </form>

          {statusMessage && (
            <p
              className={`mt-4 text-xs font-semibold ${
                statusType === "success"
                  ? "text-emerald-500"
                  : "text-rose-500"
              }`}
            >
              {statusType === "success" ? "✨ " : "⚠️ "}
              {statusMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
