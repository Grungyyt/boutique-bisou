"use client";

import { useEffect, useState } from "react";

// Interface TypeScript basée sur le retour de votre API
interface Produit {
  id: string;
  nom: string;
  couleur: string;
  type: string;
  genre: string;
  taille: string;
  prix_tickets: number;
  created_at: string;
  photo_url: string;
  quantite: number;
}

export default function HomePage() {
  // États pour les produits récupérés via l'API
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loadingProduits, setLoadingProduits] = useState(true);

  // Inscription Newsletter
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Récupération des articles depuis l'API
  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const res = await fetch("https://api.boutique-bisou.vth-mc.fr/produits");
        if (res.ok) {
          const data = await res.json();
          if (data.produits && Array.isArray(data.produits)) {
            setProduits(data.produits);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
      } finally {
        setLoadingProduits(false);
      }
    };

    fetchProduits();
  }, []);

  // Gestion de la newsletter
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

  // Duplication de la liste d'articles pour assurer un défilement infini et fluide
  // On duplique plusieurs fois si le nombre d'articles est réduit
  const displayProduits =
    produits.length > 0
      ? produits.length < 5
        ? [...produits, ...produits, ...produits, ...produits]
        : [...produits, ...produits]
      : [];

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      {/* Styles CSS pour l'animation du marquee et la pause au survol */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
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

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-16 gap-14">
        {/* En-tête / Hero Section */}
        <div className="flex w-full flex-col items-center justify-center text-center max-w-3xl">
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

        {/* --- SECTION DÉFILANTE DES ARTICLES (API) --- */}
        <div className="relative w-full overflow-hidden py-4">
          {/* Dégradés sur les bords pour un effet fondu de qualité */}
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-16 bg-gradient-to-r from-zinc-50 to-transparent dark:from-black" />
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-16 bg-gradient-to-l from-zinc-50 to-transparent dark:from-black" />

          {loadingProduits ? (
            /* Skeleton d'attente pendant le chargement */
            <div className="flex justify-center gap-6 py-10">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 w-72 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
                />
              ))}
            </div>
          ) : displayProduits.length > 0 ? (
            /* Rail défilant dynamique */
            <div className="animate-marquee gap-5 pr-5">
              {displayProduits.map((item, idx) => (
                <a
                  key={`${item.id}-${idx}`}
                  href="/boutique"
                  className="group flex w-[280px] shrink-0 flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/50 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/90"
                >
                  {/* Photo de l'article provenant de l'API (photo_url) */}
                  <div className="relative h-56 w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={item.photo_url}
                      alt={item.nom}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      draggable={false}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

                    {/* Badge Quantité / Disponibilité */}
                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          item.quantite > 0
                            ? "bg-emerald-400 animate-pulse"
                            : "bg-rose-500"
                        }`}
                      />
                      {item.quantite > 0 ? `En stock (${item.quantite})` : "Epuisé"}
                    </div>

                    {/* Badge Prix Tickets */}
                    <div className="absolute right-3 top-3 rounded-full bg-pink-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                      🎟️ {item.prix_tickets} {item.prix_tickets > 1 ? "Tickets" : "Ticket"}
                    </div>
                  </div>

                  {/* Infos de l'article (Nom, Type, Taille, Genre) */}
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-pink-500">
                        {item.type}
                      </span>
                      {item.taille && (
                        <span className="text-[10px] font-medium text-zinc-400">
                          Taille : {item.taille}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-pink-500 transition-colors line-clamp-1">
                      {item.nom}
                    </h4>

                    {/* Badges complémentaires (Genre, Couleur) */}
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {item.genre && (
                        <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {item.genre}
                        </span>
                      )}
                      {item.couleur && (
                        <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          Couleur: {item.couleur}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-zinc-500">
              Aucun article disponible pour le moment.
            </p>
          )}
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
