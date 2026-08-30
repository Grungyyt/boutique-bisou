"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";

type LogVente = {
  id: string | number;
  action: string;
  produit_id: string | null;
  produit_nom: string | null;
  details: string | null;
  user_email?: string | null;
  created_at?: string;
};

type DetailsParsed = {
  prix_tickets?: number;
  stock_avant?: number;
  stock_apres?: number;
  taille?: string;
  couleur?: string;
  age?: number | null;
  genre?: "fille" | "garcon" | null;
  classe?: string | null;
};

function parseDetails(details: string | null): DetailsParsed {
  if (!details) return {};
  try {
    const parsed = JSON.parse(details);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export default function HistoriqueVentesPage() {
  const [logs, setLogs] = useState<LogVente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/logs?limit=1000`, {
          credentials: "include",
        });
        if (res.status === 401) {
          setError("Vous devez être connecté en tant qu'administrateur.");
          return;
        }
        if (!res.ok) {
          setError("Impossible de charger l'historique des ventes.");
          return;
        }
        const data = await res.json();
        const ventes = (data.logs || []).filter(
          (l: LogVente) => l.action === "vente"
        );
        setLogs(ventes);
      } catch {
        setError("Impossible de contacter le serveur.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const resultats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) => {
      const d = parseDetails(l.details);
      return [
        l.produit_nom,
        d.taille,
        d.couleur,
        d.classe,
        d.genre,
        l.user_email,
      ]
        .filter(Boolean)
        .some((c) => String(c).toLowerCase().includes(q));
    });
  }, [logs, search]);

  const totalTickets = resultats.reduce((sum, l) => {
    const d = parseDetails(l.details);
    return sum + (d.prix_tickets || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-2">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Retour
          </a>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Historique des ventes
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {resultats.length} vente{resultats.length > 1 ? "s" : ""} ·{" "}
              {totalTickets} 🎟️ au total
            </p>
          </div>

          <div className="relative w-full max-w-xs">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (article, classe, genre...)"
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-900" />
            ))}
          </div>
        ) : resultats.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
            {search.trim() ? "Aucune vente ne correspond à ta recherche." : "Aucune vente enregistrée pour le moment."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Article</th>
                  <th className="px-4 py-3 font-medium">Détails</th>
                  <th className="px-4 py-3 font-medium">Prix</th>
                  <th className="px-4 py-3 font-medium">Genre</th>
                  <th className="px-4 py-3 font-medium">Âge</th>
                  <th className="px-4 py-3 font-medium">Classe</th>
                  <th className="px-4 py-3 font-medium">Caissier·ère</th>
                </tr>
              </thead>
              <tbody>
                {resultats.map((l) => {
                  const d = parseDetails(l.details);
                  return (
                    <tr
                      key={l.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                        {l.created_at
                          ? new Date(l.created_at).toLocaleString("fr-FR")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                        {l.produit_nom || "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                        {[d.couleur, d.taille].filter(Boolean).join(" · ") || "-"}
                      </td>
                      <td className="px-4 py-3 font-medium text-pink-600 dark:text-pink-400">
                        {d.prix_tickets !== undefined ? `${d.prix_tickets} 🎟️` : "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                        {d.genre === "fille" ? "Fille" : d.genre === "garcon" ? "Garçon" : "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                        {d.age ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                        {d.classe || "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                        {l.user_email || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
