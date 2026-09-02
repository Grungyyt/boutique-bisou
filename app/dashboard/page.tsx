"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const VERIF_URL = "/verif";
const TUTORIEL_NOM = "dashboard";

type Stats = {
  totalProduits: number;
  totalTickets: number;
  ticketsEnCirculation: number;
};

const MODULES = [
  {
    title: "Gestion des vêtements",
    description: "Ajouter, consulter et supprimer les vêtements du stock",
    href: "/dashboard/manage/produit",
    emoji: "👕",
  },
  {
    title: "Gestion des tickets",
    description: "Créer des types de tickets et gérer leur stock",
    href: "/dashboard/manage/ticket",
    emoji: "🎟️",
  },
  {
    title: "Gestion des réservations",
    description: "Consulter et valider les réservations des clients",
    href: "/dashboard/manage/reservations",
    emoji: "📌",
  },
  {
    title: "Caisse",
    description: "Encaisser un vêtement et retirer 1 du stock en un clic",
    href: "/dashboard/manage/caisse",
    emoji: "🛒",
  },
  {
    title: "Tracker",
    description: "Historique complet des ventes, ajouts et toutes les actions",
    href: "/dashboard/manage/tracker",
    emoji: "📊",
  },
  {
    title: "Historique des Ventes",
    description: "Voir chaque vente en détail : quand, quel article, âge, genre et classe",
    href: "/dashboard/manage/historique-des-ventes",
    emoji: "🧾",
  },
  {
    title: "Gestion OSA & ETA",
    description: "Contrôler le statut du service : niveau OSA (4 niveaux) et bascule ETA (maintenance ON/OFF)",
    href: "/dashboard/manage/osa",
    emoji: "⚙️",
  },
];

type TutorielStep = {
  title: string;
  text: string;
  // clé de la case à mettre en valeur : "stats" pour le bloc de statistiques,
  // le href du module pour une case de la grille "Gestion", ou null pour une
  // étape sans case ciblée (intro / conclusion, affichée centrée).
  targetKey: string | null;
};

const TUTORIEL_STEPS: TutorielStep[] = [
  {
    title: "Bienvenue sur le tableau de bord 👋",
    text: "On te fait faire un tour rapide de chaque case pour que tu saches à quoi elle sert. Tu peux passer le tuto à tout moment, il ne réapparaîtra plus une fois terminé.",
    targetKey: null,
  },
  {
    title: "Tes statistiques en direct",
    text: "Ces 3 cases affichent en temps réel le nombre de vêtements en stock, la valeur totale en tickets, et les tickets actuellement en circulation chez les élèves.",
    targetKey: "stats",
  },
  ...MODULES.map((mod) => ({
    title: `${mod.emoji} ${mod.title}`,
    text: `${mod.description}. Clique sur cette case pour y accéder.`,
    targetKey: mod.href,
  })),
  {
    title: "C'est tout bon ! 🎉",
    text: "Tu connais maintenant toutes les cases du dashboard. Bonne gestion de la boutique !",
    targetKey: null,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAllowed, setIsAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  // Gestion de l'écran de chargement via sessionStorage
  const [showSplash, setShowSplash] = useState(false);
  
  // Suivi des requêtes HTTP
  const [currentRequest, setCurrentRequest] = useState<string | null>(null);
  const [failedRequest, setFailedRequest] = useState<string | null>(null);

  // ── Tuto de première connexion ──
  const [showTutoriel, setShowTutoriel] = useState(false);
  const [tutorielStep, setTutorielStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const moduleRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  // Vérifie auprès de l'API si le compte connecté a déjà vu le tuto du dashboard
  useEffect(() => {
    if (!isAllowed) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/tutoriel/${TUTORIEL_NOM}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && !data.vu) {
          setShowTutoriel(true);
        }
      } catch {
        // Si l'API ne répond pas, on n'affiche pas le tuto pour ne pas bloquer l'accès au dashboard
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAllowed]);

  // Recalcule la position de la case à mettre en valeur à chaque étape (+ resize/scroll)
  useEffect(() => {
    if (!showTutoriel) return;

    const step = TUTORIEL_STEPS[tutorielStep];

    const updateRect = () => {
      if (!step.targetKey) {
        setHighlightRect(null);
        return;
      }
      const el =
        step.targetKey === "stats" ? statsRef.current : moduleRefs.current[step.targetKey];
      if (el) {
        setHighlightRect(el.getBoundingClientRect());
      } else {
        setHighlightRect(null);
      }
    };

    const el =
      step.targetKey === "stats" ? statsRef.current : step.targetKey ? moduleRefs.current[step.targetKey] : null;
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    const t = setTimeout(updateRect, 300);

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [showTutoriel, tutorielStep]);

  // Bloque le scroll de la page tant que le tuto est affiché
  useEffect(() => {
    if (showTutoriel) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [showTutoriel]);

  const marquerTutorielVu = async () => {
    try {
      await fetch(`${API_URL}/tutoriel/${TUTORIEL_NOM}/vu`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Tant pis : au pire le tuto réapparaîtra à la prochaine connexion
    }
  };

  const fermerTutoriel = () => {
    setShowTutoriel(false);
    marquerTutorielVu();
  };

  const etapeSuivante = () => {
    if (tutorielStep >= TUTORIEL_STEPS.length - 1) {
      fermerTutoriel();
    } else {
      setTutorielStep((s) => s + 1);
    }
  };

  const etapePrecedente = () => {
    setTutorielStep((s) => Math.max(0, s - 1));
  };

  const getTooltipStyle = (rect: DOMRect | null): React.CSSProperties => {
    if (!rect || typeof window === "undefined") {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const placeBelow = rect.top < vh / 2;
    const top = placeBelow ? Math.min(rect.bottom + 20, vh - 40) : Math.max(rect.top - 20, 40);
    const left = Math.min(Math.max(rect.left + rect.width / 2, 180), vw - 180);
    return placeBelow
      ? { top, left, transform: "translate(-50%, 0)" }
      : { top, left, transform: "translate(-50%, -100%)" };
  };

  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();

    // ÉTAPE 1 : Vérifie que l'utilisateur vient de /verif
    const checkReferrer = () => {
      // document.referrer contient la page d'où on vient
      const referrer = document.referrer;
      
      // Vérifie si le referrer contient /verif
      if (!referrer || !referrer.includes("/verif")) {
        // Ne vient pas de /verif → redirection
        if (isMounted) {
          router.push(VERIF_URL);
        }
        return false;
      }
      
      return true;
    };

    // ÉTAPE 2 : Récupère les stats si autorisé
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      setFailedRequest(null);

      const requestUrl = `${API_URL}/produits`;
      const ticketsUrl = `${API_URL}/tickets`;
      setCurrentRequest(requestUrl);

      try {
        const [res, ticketsRes] = await Promise.all([
          fetch(requestUrl, { credentials: "include" }),
          fetch(ticketsUrl, { credentials: "include" }),
        ]);

        if (res.status === 401 || ticketsRes.status === 401) {
          // Pas authentifié → redirection vers /verif
          if (isMounted) {
            router.push(VERIF_URL);
          }
          return;
        }

        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }

        const data = await res.json();
        const ticketsData = ticketsRes.ok ? await ticketsRes.json() : null;

        if (isMounted) {
          setStats({
            totalProduits: data.total ?? (data.produits?.length || 0),
            totalTickets: data.total_tickets || 0,
            ticketsEnCirculation: ticketsData?.tickets_en_circulation || 0,
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setError("Impossible de charger les statistiques.");
          setFailedRequest(requestUrl);
        }
      } finally {
        if (isMounted) {
          setCurrentRequest(null);
          setLoading(false);

          const hasSeenSplash = sessionStorage.getItem("dashboard_splash_seen");
          if (!hasSeenSplash) {
            // S'assure que le splash dure au moins 4 secondes pour le premier affichage
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 4000 - elapsedTime);

            setTimeout(() => {
              if (isMounted) {
                setShowSplash(false);
                sessionStorage.setItem("dashboard_splash_seen", "true");
              }
            }, remainingTime);
          }
        }
      }
    };

    // Vérifie le referrer
    const isAllowedAccess = checkReferrer();
    
    if (isAllowedAccess) {
      if (isMounted) {
        setIsAllowed(true);
      }
      
      // Vérification de sessionStorage pour le splash screen
      const hasSeenSplash = sessionStorage.getItem("dashboard_splash_seen");
      if (!hasSeenSplash) {
        setShowSplash(true);
      }

      // Récupère les stats
      fetchStats();
    }
    
    if (isMounted) {
      setChecking(false);
    }

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Pendant la vérification du referrer, affiche rien
  if (checking) {
    return null;
  }

  // Si pas autorisé, ne rien afficher (redirection en cours)
  if (!isAllowed) {
    return null;
  }

  return (
    <>
      {/* ── Écran de chargement (uniquement lors de la première visite de la session) ── */}
      {showSplash && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-white p-6 md:p-12">
          <div />

          <div className="flex flex-col items-center gap-4 text-zinc-800">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-800" />
            <p className="animate-pulse text-lg font-medium">
              Chargement en cours...
            </p>
          </div>

          <div className="relative flex w-full items-end justify-between">
            <div className="max-w-xs text-xs text-zinc-500">
              {currentRequest ? (
                <p className="truncate">
                  <span className="font-semibold text-zinc-700">Chargement :</span> {currentRequest}
                </p>
              ) : (
                <p className="text-zinc-400">Toutes les requêtes sont terminées</p>
              )}
            </div>

            <div className="absolute left-1/2 -translate-x-1/2">
              <img
                src="https://storage.vth-mc.fr/vth-b.png"
                alt="Logo VTH"
                className="h-60 w-auto object-contain md:h-60"
              />
            </div>

            <div className="max-w-xs text-right text-xs">
              {failedRequest && (
                <p className="truncate font-medium text-rose-600">
                  ⚠️ Échec : {failedRequest}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Dashboard ── */}
      <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              ← Retour à l'accueil
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Tableau de bord
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Vue d'ensemble de la boutique
            </p>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              {error}
            </p>
          )}

          <div ref={statsRef} className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total vêtements</p>
              <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                {loading ? "…" : stats?.totalProduits ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Valeur totale</p>
              <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                {loading ? "…" : stats?.totalTickets ?? 0} 🎟️
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Tickets en circulation</p>
              <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                {loading ? "…" : stats?.ticketsEnCirculation ?? 0} 🎟️
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Gestion
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map((mod) => (
                <Link
                  key={mod.href}
                  href={mod.href}
                  ref={(el) => {
                    moduleRefs.current[mod.href] = el;
                  }}
                  className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-pink-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-pink-900"
                >
                  <div className="mb-3 text-2xl">{mod.emoji}</div>
                  <h3 className="text-base font-semibold text-zinc-900 transition group-hover:text-pink-600 dark:text-zinc-50 dark:group-hover:text-pink-400">
                    {mod.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {mod.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Overlay du tuto de première connexion ── */}
      {showTutoriel && !showSplash && (
        <>
          {/* Bloque tous les clics sur le dashboard pendant le tuto */}
          <div className="fixed inset-0 z-[60]" onClick={(e) => e.stopPropagation()} />

          {/* Fond assombri + découpe autour de la case mise en valeur, contour noir */}
          {highlightRect ? (
            <div
              className="pointer-events-none fixed z-[61] animate-vth-tuto-pulse rounded-2xl border-[3px] border-black transition-all duration-300"
              style={{
                top: highlightRect.top - 8,
                left: highlightRect.left - 8,
                width: highlightRect.width + 16,
                height: highlightRect.height + 16,
              }}
            />
          ) : (
            <div className="pointer-events-none fixed inset-0 z-[61] bg-black/70 transition-all duration-300" />
          )}

          {/* Bulle d'explication */}
          <div
            className="fixed z-[62] w-[90vw] max-w-sm rounded-2xl border-2 border-black bg-white p-5 shadow-xl transition-all duration-300"
            style={getTooltipStyle(highlightRect)}
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-pink-600">
              Étape {tutorielStep + 1} / {TUTORIEL_STEPS.length}
            </p>
            <h3 className="mb-2 text-lg font-bold text-zinc-900">
              {TUTORIEL_STEPS[tutorielStep].title}
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-zinc-600">
              {TUTORIEL_STEPS[tutorielStep].text}
            </p>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={fermerTutoriel}
                className="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
              >
                Passer le tutoriel
              </button>
              <div className="flex gap-2">
                {tutorielStep > 0 && (
                  <button
                    onClick={etapePrecedente}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    Précédent
                  </button>
                )}
                <button
                  onClick={etapeSuivante}
                  className="rounded-lg bg-black px-4 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                  {tutorielStep >= TUTORIEL_STEPS.length - 1 ? "Terminer" : "Suivant"}
                </button>
              </div>
            </div>
          </div>

          <style jsx global>{`
            @keyframes vth-tuto-pulse {
              0%,
              100% {
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 0 0 rgba(0, 0, 0, 0.35);
              }
              50% {
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 0 8px rgba(0, 0, 0, 0);
              }
            }
            .animate-vth-tuto-pulse {
              animation: vth-tuto-pulse 1.8s ease-in-out infinite;
            }
          `}</style>
        </>
      )}
    </>
  );
}
