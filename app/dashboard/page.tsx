"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGIN_URL = "/auth/login";

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
    title: "Réservations",
    description: "Consulter les numéros à 6 chiffres des réservations en cours",
    href: "/dashboard/manage/reservations",
    emoji: "📌",
  },
  {
    title: "Gestion des tickets",
    description: "Créer des types de tickets et gérer leur stock",
    href: "/dashboard/manage/ticket",
    emoji: "🎟️",
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
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<string | null>(null);
  const [failedRequest, setFailedRequest] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();
    const hasSeenSplash = sessionStorage.getItem("dashboard_splash_seen");

    if (!hasSeenSplash) {
      setShowSplash(true);
    }

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      setFailedRequest(null);

      const requestUrl = `${API_URL}/produits`;
      setCurrentRequest(requestUrl);

      try {
        const res = await fetch(requestUrl, { credentials: "include" });
        
        if (res.status === 401) {
          window.location.href = LOGIN_URL;
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

          if (!hasSeenSplash) {
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

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
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
      {}
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
