"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Photos et configurations de la pile d'origine
const IMAGES = [
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(1).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(2).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(3).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(4).jpg",
  "https://storage.vth-mc.fr/pierred-dubois/img/web/1%20(5).jpg",
];

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
const FRONT_HOLD_MS = 2400;
const HOLD_PAUSE = SWIPE_MS + SETTLE_MS + FRONT_HOLD_MS;

// Type pour les produits de l'API
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

  // --- Vérification de l'état opérationnel du service ---
  // À CHAQUE arrivée/reload sur l'accueil, on repasse par /eta-verif qui
  // interroge le serveur. On garde un très court délai de grâce (quelques
  // secondes) juste après avoir été confirmé opérationnel par /eta-verif,
  // pour éviter une boucle infinie entre les deux pages — mais un reload
  // "normal" (après ce délai) redéclenche bien une nouvelle vérification.
  useEffect(() => {
    const dernierCheck = Number(sessionStorage.getItem("bisou_eta_checked_at") || 0);
    const recent = Date.now() - dernierCheck < 3000;
    if (!recent) {
      router.replace("/eta-verif");
    }
  }, [router]);

  // --- États pour la pile de cartes originale ---
  const [order, setOrder] = useState<number[]>(IMAGES.map((_, i) => i));
  const [swipingId, setSwipingId] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- États pour les produits de l'API ---
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loadingProduits, setLoadingProduits] = useState(true);

  // --- États pour la newsletter ---
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation de la pile de cartes d'origine
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
  }, [runCycle]);

  // Récupération des articles depuis l'API
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

  // Soumission newsletter
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

  // Duplication de la liste pour défilement infini du marquee
  const displayProduits =
    produits.length > 0
      ? produits.length < 5
        ? [...produits, ...produits, ...produits, ...produits]
        : [...produits, ...produits]
      : [];

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      {/* CSS du défilement Modrinth */}
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

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-16 gap-20">
        {/* --- SECTION HERO : TEXTE + PILE DE PHOTOS ORIGINALE --- */}
        <div className="flex w-full flex-col items-center justify-center gap-10 lg:flex-row lg:gap-20">
          {/* Texte d'intro */}
          <div className="max-w-md text-center lg:text-left">
            <div className="mb-8 flex justify-center lg:justify-start">
              <img
                src="https://storage.vth-mc.fr/pierred-dubois/img/web/logo-bisou.png"
                alt="Logo Boutique Bisou"
                className="h-32 w-auto object-contain"
              />
            </div>

            <span className="mb-4 inline-block rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
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

          {/* Pile de photos originale */}
          <div
            className="relative h-[520px] w-[340px] shrink-0 sm:h-[580px] sm:w-[380px]"
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
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                    {isFront && (
                      <div className="absolute left-3 top-3 flex h-5 w-9 items-center rounded-full bg-white/25 px-0.5 backdrop-blur-sm">
                        <span className="h-4 w-4 rounded-full bg-emerald-400 shadow-sm animate-pulse" />
                      </div>
                    )}

                    {isFront && (
                      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 max-w-[80%]">
                        {TAGS[imgIndex].map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-black/40 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-white backdrop-blur-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

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

        {/* --- SECTION CAROUSSEL MODRINTH (ARTICLES API) --- */}
        <div className="w-full flex flex-col items-center gap-6 pt-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Nos T-Shirts & Articles en rayon
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Survolez un article avec la souris pour stopper le défilement.
            </p>
          </div>

          <div className="relative w-full overflow-hidden py-4">
            <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-16 bg-gradient-to-r from-zinc-50 to-transparent dark:from-black" />
            <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-16 bg-gradient-to-l from-zinc-50 to-transparent dark:from-black" />

            {loadingProduits ? (
              <div className="flex justify-center gap-6 py-10">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-80 w-72 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
                  />
                ))}
              </div>
            ) : displayProduits.length > 0 ? (
              <div className="animate-marquee gap-5 pr-5">
                {displayProduits.map((item, idx) => (
                  <a
                    key={`${item.id}-${idx}`}
                    href="/boutique"
                    className="group flex w-[280px] shrink-0 flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/50 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/90"
                  >
                    <div className="relative h-56 w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      <img
                        src={item.photo_url}
                        alt={item.nom}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        draggable={false}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

                      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
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

                      <div className="absolute right-3 top-3 rounded-full bg-pink-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                        🎟️ {item.prix_tickets}{" "}
                        {item.prix_tickets > 1 ? "Tickets" : "Ticket"}
                      </div>
                    </div>

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

                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {item.genre && (
                          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {item.genre}
                          </span>
                        )}
                        {item.couleur && (
                          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            Couleur : {item.couleur}
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
        </div>

        {/* Section Newsletter */}
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
