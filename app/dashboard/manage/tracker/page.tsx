"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGIN_URL = "/auth/login";

type Log = {
  id: string;
  action: string;
  produit_id: string | null;
  produit_nom: string | null;
  user_email: string | null;
  details: string | null;
  created_at: string;
};

type Details = {
  prix_tickets?: number;
  stock_avant?: number;
  stock_apres?: number;
  taille?: string;
  couleur?: string;
  [key: string]: unknown;
};

const ACTION_META: Record<string, { label: string; color: string; dot: string }> = {
  vente: {
    label: "Vente",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  ajout_produit: {
    label: "Ajout produit",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  suppression_produit: {
    label: "Suppression",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
    dot: "bg-rose-500",
  },
  connexion: {
    label: "Connexion",
    color: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
    dot: "bg-violet-500",
  },
};

function getActionMeta(action: string) {
  return (
    ACTION_META[action] ?? {
      label: action,
      color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
      dot: "bg-zinc-400",
    }
  );
}

function parseDetails(raw: string | null): Details | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function TrackerPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/logs?limit=500`, {
        credentials: "include",
      });
      if (res.status === 401) {
        window.location.href = LOGIN_URL;
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      setError("Impossible de charger les logs.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Filtres ─────────────────────────────────────────────────────────────
  const actions = useMemo(() => {
    const set = new Set(logs.map((l) => l.action));
    return ["all", ...Array.from(set)];
  }, [logs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      if (filterAction !== "all" && l.action !== filterAction) return false;
      if (!q) return true;
      return [l.produit_nom, l.user_email, l.action, l.details]
        .filter(Boolean)
        .some((c) => c!.toLowerCase().includes(q));
    });
  }, [logs, search, filterAction]);

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const ventes = logs.filter((l) => l.action === "vente");
    const ticketsTotal = ventes.reduce((acc, l) => {
      const d = parseDetails(l.details);
      return acc + (d?.prix_tickets ?? 0);
    }, 0);

    // Produit le plus vendu
    const compteProduit: Record<string, { nom: string; count: number }> = {};
    ventes.forEach((l) => {
      if (!l.produit_id) return;
      if (!compteProduit[l.produit_id]) {
        compteProduit[l.produit_id] = { nom: l.produit_nom ?? l.produit_id, count: 0 };
      }
      compteProduit[l.produit_id].count++;
    });
    const topProduit = Object.values(compteProduit).sort((a, b) => b.count - a.count)[0];

    // Ventes par jour (7 derniers jours)
    const now = new Date();
    const days: { label: string; count: number }[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return {
        label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        count: 0,
      };
    });
    ventes.forEach((l) => {
      const d = new Date(l.created_at);
      const label = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      const slot = days.find((x) => x.label === label);
      if (slot) slot.count++;
    });

    return { totalVentes: ventes.length, ticketsTotal, topProduit, days };
  }, [logs]);

  const maxDay = Math.max(...stats.days.map((d) => d.count), 1);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto max-w-5xl">

        {/* Retour */}
        <div className="mb-4">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Retour
          </a>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Tracker</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Historique complet des actions et statistiques
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Actualiser
          </button>
        </div>

        {/* ── Stats cards ── */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total ventes</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {loading ? "…" : stats.totalVentes}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Tickets encaissés</p>
            <p className="mt-1 text-2xl font-semibold text-pink-600 dark:text-pink-400">
              {loading ? "…" : `${stats.ticketsTotal} 🎟️`}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total événements</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {loading ? "…" : logs.length}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Article top vendu</p>
            <p className="mt-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {loading ? "…" : stats.topProduit ? `${stats.topProduit.nom} (×${stats.topProduit.count})` : "—"}
            </p>
          </div>
        </div>

        {/* ── Graphe ventes 7 jours ── */}
        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Ventes — 7 derniers jours
          </p>
          <div className="flex items-end gap-2 h-24">
            {stats.days.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-zinc-400">{d.count > 0 ? d.count : ""}</span>
                <div
                  className="w-full rounded-t-md bg-pink-500 dark:bg-pink-600 transition-all"
                  style={{ height: `${Math.round((d.count / maxDay) * 72)}px`, minHeight: d.count > 0 ? "4px" : "2px" }}
                />
                <span className="text-[10px] text-zinc-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filtres ── */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Recherche */}
          <div className="relative flex-1 max-w-sm">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (produit, utilisateur...)"
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>

          {/* Filtre action */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          >
            {actions.map((a) => (
              <option key={a} value={a}>
                {a === "all" ? "Toutes les actions" : getActionMeta(a).label}
              </option>
            ))}
          </select>

          {!loading && (
            <p className="text-xs text-zinc-400 shrink-0">
              {filtered.length} événement{filtered.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </p>
        )}

        {/* ── Table des logs ── */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
          {loading ? (
            <div className="flex flex-col gap-3 p-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-zinc-400">
              {search.trim() || filterAction !== "all" ? "Aucun résultat." : "Aucun log enregistré pour le moment."}
            </p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((log) => {
                const meta = getActionMeta(log.action);
                const details = parseDetails(log.details);
                const isOpen = expandedId === log.id;

                return (
                  <div key={log.id}>
                    <button
                      onClick={() => setExpandedId(isOpen ? null : log.id)}
                      className="w-full flex items-center gap-4 px-5 py-3.5 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    >
                      {/* Dot */}
                      <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />

                      {/* Badge action */}
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${meta.color}`}>
                        {meta.label}
                      </span>

                      {/* Produit */}
                      <span className="flex-1 truncate text-sm text-zinc-800 dark:text-zinc-200">
                        {log.produit_nom ?? <span className="italic text-zinc-400">—</span>}
                        {details?.taille && (
                          <span className="ml-1.5 text-xs text-zinc-400">· {details.taille}</span>
                        )}
                        {details?.couleur && (
                          <span className="ml-1 text-xs text-zinc-400">{details.couleur}</span>
                        )}
                      </span>

                      {/* Tickets */}
                      {details?.prix_tickets != null && (
                        <span className="shrink-0 text-sm font-semibold text-pink-600 dark:text-pink-400">
                          {details.prix_tickets} 🎟️
                        </span>
                      )}

                      {/* User */}
                      <span className="hidden sm:block shrink-0 text-xs text-zinc-400 w-32 truncate text-right">
                        {log.user_email ?? "—"}
                      </span>

                      {/* Date */}
                      <span className="hidden md:block shrink-0 text-xs text-zinc-400 w-28 text-right">
                        {formatDate(log.created_at)}
                      </span>

                      {/* Chevron */}
                      <svg
                        className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        viewBox="0 0 20 20" fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Détail expandé */}
                    {isOpen && (
                      <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 text-sm">
                          <div>
                            <dt className="text-xs text-zinc-400">ID log</dt>
                            <dd className="truncate font-mono text-xs text-zinc-600 dark:text-zinc-300">{log.id}</dd>
                          </div>
                          {log.produit_id && (
                            <div>
                              <dt className="text-xs text-zinc-400">ID produit</dt>
                              <dd className="truncate font-mono text-xs text-zinc-600 dark:text-zinc-300">{log.produit_id}</dd>
                            </div>
                          )}
                          {log.user_email && (
                            <div>
                              <dt className="text-xs text-zinc-400">Utilisateur</dt>
                              <dd className="text-zinc-700 dark:text-zinc-200">{log.user_email}</dd>
                            </div>
                          )}
                          <div>
                            <dt className="text-xs text-zinc-400">Date</dt>
                            <dd className="text-zinc-700 dark:text-zinc-200">{formatDate(log.created_at)}</dd>
                          </div>
                          {details && Object.entries(details).map(([k, v]) => (
                            <div key={k}>
                              <dt className="text-xs text-zinc-400">{k}</dt>
                              <dd className="text-zinc-700 dark:text-zinc-200">{String(v)}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-zinc-400 text-center">
          500 derniers événements · Logs enregistrés côté serveur dans Supabase
        </p>
      </div>
    </div>
  );
}
