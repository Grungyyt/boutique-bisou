"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGIN_URL = "/auth/login";

type Stats = {
  totalProduits: number;
  totalTickets: number;
};

// Ajoute une entrée ici à chaque nouveau module de gestion.
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
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/produits`, { credentials: "include" });

        if (res.status === 401) {
          window.location.href = LOGIN_URL;
          return;
        }

        if (!res.ok) {
          setError("Impossible de charger les statistiques.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setStats({
          totalProduits: data.total ?? (data.produits?.length || 0),
          totalTickets: data.total_tickets || 0,
        });
      } catch {
        setError("Impossible de contacter le serveur.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto max-w-5xl">
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

        {/* Stats */}
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

        {/* Navigation vers les modules de gestion */}
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
  );
}
