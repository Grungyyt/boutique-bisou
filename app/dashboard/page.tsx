"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const VERIF_URL = "/verif";

type Stats = {
  totalProduits: number;
  totalTickets: number;
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
    title: "Gestion ETA",
    description: "Contrôler l'état opérationnel du service (maintenance/opérationnel)",
    href: "/dashboard/manage/eta",
    emoji: "⚙️",
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
      setCurrentRequest(requestUrl);

      try {
        const res = await fetch(requestUrl, { credentials: "include" });
        
        if (res.status === 401) {
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
        
        if (isMounted) {
          setStats({
            totalProduits: data.total ?? (data.produits?.length || 0),
            totalTickets: data.total_tickets || 0,
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

          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
    </>
  );
}
