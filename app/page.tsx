"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Slides d'en-tête (Grille Famille Agri)
const HERO_SLIDES = [
  {
    id: 1,
    topBadgeLeft: "FAMILLE AGRI 2026",
    topBadgeRight: "STERVIO & GERMAIN",
    topImage: "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(1).jpg",
    cardLeftImage: "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(2).jpg",
    cardLeftLink: "/boutique",
    cardRightTitle: "DESIGN",
  },
  {
    id: 2,
    topBadgeLeft: "BOUTIQUE BISOU",
    topBadgeRight: "COLLECTION 2026",
    topImage: "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(3).jpg",
    cardLeftImage: "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(4).jpg",
    cardLeftLink: "/boutique",
    cardRightTitle: "QUALITÉ",
  },
];

// Pile de cartes d'origine
const STACK_IMAGES = [
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(1).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(2).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(3).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(4).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(5).jpg",
];

const STACK_TAGS: [string, string][] = [
  ["BOUTIQUE BISOU", "Ouverture 2025 2026"],
  ["BOUTIQUE BISOU", "Dans la boutique"],
  ["BOUTIQUE BISOU", "Décoration"],
  ["BOUTIQUE BISOU", "Discussions pendant l'ouverture"],
  ["BOUTIQUE BISOU", "Ouverture avec Les Medias"],
];

const ROT_JITTER = [0, -6, 5, -4, 7];
const SWIPE_MS = 550;
const SETTLE_MS = 480;
const FRONT_HOLD_MS = 2400;
const HOLD_PAUSE = SWIPE_MS + SETTLE_MS + FRONT_HOLD_MS;

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
  const router = useRouter();

  // --- Vérification opérationnelle ---
  useEffect(() => {
    const dernierCheck = Number(sessionStorage.getItem("bisou_eta_checked_at") || 0);
    const recent = Date.now() - dernierCheck < 3000;
    if (!recent) {
      router.replace("/osa");
    }
  }, [router]);

  // --- Carrousel Grille Hero ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const [toggleActive, setToggleActive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // --- Pile de cartes d'origine ---
  const [order, setOrder] = useState<number[]>(STACK_IMAGES.map((_, i) => i));
  const [swipingId, setSwipingId] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const stackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runStackCycle = useCallback(() => {
    stackTimerRef.current = setTimeout(() => {
      if (paused) {
        runStackCycle();
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

      runStackCycle();
    }, HOLD_PAUSE);
  }, [paused]);

  useEffect(() => {
    runStackCycle();
    return () => {
      if (stackTimerRef.current) clearTimeout(stackTimerRef.current);
    };
  }, [runStackCycle]);

  // --- Produits API ---
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loadingProduits, setLoadingProduits] = useState(true);

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

  // --- Newsletter ---
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
      const res = await fetch("https://api.boutique-bisou.vth-mc.fr/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
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

  const displayProduits =
    produits.length > 0
      ? produits.length < 5
        ? [...produits, ...produits, ...produits, ...produits]
        : [...produits, ...produits]
      : [];

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-6 md:py-12">
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

      {/* GIF fixe en bas à gauche */}
      <div className="fixed bottom-8 left-4 z-50 hidden lg:block">
        <img
          src="https://storage.vth-mc.fr/img/web/marche.gif"
          alt="Support"
          className="h-32 w-auto object-contain"
        />
      </div>

      <div className="flex flex-col items-center gap-14">
        
        {/* --- HERO BANNER EXACTEMENT COMME FAMILLEAGRI.FR --- */}
        <div className="grid w-full gap-4">
          {/* Carte Supérieure Grande */}
          <div className="relative h-[300px] sm:h-[400px] md:h-[460px] w-full overflow-hidden rounded-[2.5rem] bg-zinc-900 shadow-xl">
            <img
              src={slide.topImage}
              alt="Famille Agri Top"
              className="h-full w-full object-cover transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

            {/* Toggle vert en haut à gauche */}
            <button
              type="button"
              onClick={() => setToggleActive(!toggleActive)}
              className="absolute top-6 left-6 z-10 focus:outline-none"
            >
              <div
                className={`flex h-8 w-14 items-center rounded-full p-1 transition-colors duration-300 ${
                  toggleActive ? "bg-[#7CD92A]" : "bg-zinc-600"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    toggleActive ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            {/* Badges / Pilules en bas à gauche */}
            <div className="absolute bottom-6 left-6 flex flex-wrap gap-3 z-10">
              <span className="rounded-full border border-white/50 bg-white/20 px-5 py-2 text-xs sm:text-sm font-semibold tracking-wider text-white backdrop-blur-md uppercase">
                {slide.topBadgeLeft}
              </span>
              <span className="rounded-full border border-white/50 bg-white/20 px-5 py-2 text-xs sm:text-sm font-semibold tracking-wider text-white backdrop-blur-md uppercase">
                {slide.topBadgeRight}
              </span>
            </div>
          </div>

          {/* Rangée inférieure (2 cartes) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Carte Photo avec flèche (2/3) */}
            <a
              href={slide.cardLeftLink}
              className="group relative h-[240px] sm:h-[280px] md:h-[320px] overflow-hidden rounded-[2.5rem] bg-zinc-900 shadow-xl sm:col-span-2"
            >
              <img
                src={slide.cardLeftImage}
                alt="Produit Famille Agri"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Bouton Flèche Haut-Droite */}
              <div className="absolute top-6 right-6 flex h-14 w-14 items-center justify-center rounded-3xl bg-white/90 text-zinc-900 shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                <svg
                  className="h-7 w-7 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </div>
            </a>

            {/* Carte Verte DESIGN (1/3) */}
            <div className="relative flex h-[240px] sm:h-[280px] md:h-[320px] flex-col justify-between rounded-[2.5rem] bg-[#7CD92A] p-8 shadow-xl">
              <h2 className="text-4xl font-extrabold tracking-tight text-white/90 sm:text-5xl md:text-6xl uppercase">
                {slide.cardRightTitle}
              </h2>
              <div className="flex justify-end">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg">
                  <svg
                    className="h-7 w-7 text-[#7CD92A]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION RACCOURCIS & ÉQUIPE --- */}
        <div className="flex w-full flex-wrap justify-center gap-3">
          <a
            href="/boutique"
            className="rounded-2xl bg-zinc-900 px-6 py-3 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Voir les articles
          </a>
          <a
            href="/equipe"
            className="rounded-2xl border border-zinc-200 bg-white/80 px-6 py-3 text-xs font-semibold text-zinc-800 shadow-sm backdrop-blur-md transition hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200"
          >
            L'Équipe
          </a>
          <a
            href="/verif"
            className="rounded-2xl border border-zinc-200 bg-white/80 px-6 py-3 text-xs font-semibold text-zinc-800 shadow-sm backdrop-blur-md transition hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200"
          >
            Tableau de bord
          </a>
        </div>

        {/* --- SECTION PRÉSENTATION & PILE DE PHOTOS --- */}
        <div className="flex w-full flex-col items-center justify-between gap-12 lg:flex-row lg:px-4">
          <div className="max-w-md text-center lg:text-left">
            <span className="mb-3 inline-block rounded-lg bg-pink-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-pink-500 backdrop-blur-md">
              Ambiance & Coulisses
            </span>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              L'univers Boutique Bisou en images
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Découvrez la vie en boutique, les ouvertures média et les coulisses de notre projet solidaire.
            </p>
            <div className="mt-6 flex justify-center lg:justify-start">
              <a
                href="https://ko-fi.com/vth"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white/80 px-5 py-2.5 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur-md transition hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-900/80 dark:text-zinc-200"
              >
                <img
                  src="https://storage.vth-mc.fr/img/web/marche.gif"
                  alt=""
                  className="h-4 w-auto"
                />
                <span>Soutenir le projet</span>
              </a>
            </div>
          </div>

          {/* Pile interactive */}
          <div className="flex items-center justify-center lg:pr-6">
            <div
              className="relative h-[440px] w-[280px] shrink-0 sm:h-[480px] sm:w-[320px]"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {order.map((imgIndex, pos) => {
                const isFront = pos === 0;
                const isSwiping = swipingId === imgIndex;

                const depth = isSwiping ? 0 : pos;
                const baseRotate = ROT_JITTER[imgIndex];
                const stackRotate =
                  depth === 0 ? 0 : baseRotate * (0.55 + depth * 0.18);
                const translateY = depth * 14;
                const scale = 1 - depth * 0.055;

                const transform = isSwiping
                  ? `translate(120%, -10%) rotate(${28 + baseRotate}deg) scale(0.92)`
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
                    <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/10">
                      <img
                        src={STACK_IMAGES[imgIndex]}
                        alt={`Photo boutique ${imgIndex + 1}`}
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                      {isFront && (
                        <div className="absolute left-3 top-3 flex h-5 w-9 items-center rounded-full bg-white/25 px-0.5 backdrop-blur-sm">
                          <span className="h-4 w-4 rounded-full bg-emerald-400 shadow-sm animate-pulse" />
                        </div>
                      )}

                      {isFront && (
                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 max-w-[80%]">
                          {STACK_TAGS[imgIndex].map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-black/40 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-white backdrop-blur-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- CARROUSEL DES ARTICLES EN RAYON --- */}
        <div className="w-full flex flex-col items-center gap-6 rounded-3xl border border-zinc-200/80 bg-white/80 p-6 md:p-8 shadow-xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80">
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              Nos T-Shirts & Articles en rayon
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Survolez un article pour interrompre le défilement.
            </p>
          </div>

          <div className="relative w-full overflow-hidden py-2">
            <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-12 bg-gradient-to-r from-white/80 to-transparent dark:from-zinc-950/80" />
            <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-12 bg-gradient-to-l from-white/80 to-transparent dark:from-zinc-950/80" />

            {loadingProduits ? (
              <div className="flex justify-center gap-6 py-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-80 w-72 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900"
                  />
                ))}
              </div>
            ) : displayProduits.length > 0 ? (
              <div className="animate-marquee gap-5 pr-5">
                {displayProduits.map((item, idx) => (
                  <a
                    key={`${item.id}-${idx}`}
                    href="/boutique"
                    className="group flex w-[260px] shrink-0 flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/50 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/80"
                  >
                    <div className="relative h-48 w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      <img
                        src={item.photo_url}
                        alt={item.nom}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        draggable={false}
                      />
                      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            item.quantite > 0
                              ? "bg-emerald-400 animate-pulse"
                              : "bg-rose-500"
                          }`}
                        />
                        {item.quantite > 0
                          ? `En stock (${item.quantite})`
                          : "Épuisé"}
                      </div>

                      <div className="absolute right-3 top-3 rounded-full bg-pink-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                        🎟️ {item.prix_tickets}{" "}
                        {item.prix_tickets > 1 ? "Tickets" : "Ticket"}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-pink-500">
                          {item.type}
                        </span>
                        {item.taille && (
                          <span className="text-[10px] font-medium text-zinc-400">
                            Taille : {item.taille}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-pink-500 transition-colors line-clamp-1">
                        {item.nom}
                      </h3>

                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {item.genre && (
                          <span className="rounded-md bg-zinc-100/80 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300">
                            {item.genre}
                          </span>
                        )}
                        {item.couleur && (
                          <span className="rounded-md bg-zinc-100/80 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300">
                            Couleur : {item.couleur}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-zinc-500">
                Aucun article disponible pour le moment.
              </p>
            )}
          </div>
        </div>

        {/* --- SECTION NEWSLETTER --- */}
        <div className="w-full max-w-xl rounded-3xl border border-zinc-200/80 bg-white/80 p-6 md:p-8 text-center shadow-xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
            <span className="text-xl">💌</span>
          </div>
          <h3 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Alerte nouveaux vêtements
          </h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
            Soyez immédiatement informé dès qu'un nouvel article est disponible en boutique.
          </p>

          <form onSubmit={handleSubscribe} className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre.email@exemple.com"
              className="w-full rounded-xl border border-zinc-200/80 bg-white/80 px-4 py-2.5 text-xs text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-zinc-800/80 dark:bg-zinc-900/80 dark:text-zinc-100"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full shrink-0 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? "Inscription..." : "M'inscrire"}
            </button>
          </form>

          {statusMessage && (
            <p
              className={`mt-3 text-xs font-semibold ${
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
