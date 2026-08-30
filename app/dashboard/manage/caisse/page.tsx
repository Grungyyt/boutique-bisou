"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";

type Produit = {
  id: string;
  nom: string;
  couleur: string;
  type: string;
  genre: string;
  taille: string;
  prix_tickets: number;
  quantite: number;
  photo_url: string | null;
};

type Toast = {
  id: number;
  nom: string;
  ok: boolean;
};

export default function CaissePage() {
  const router = useRouter();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  let toastCounter = 0;

  // ─── Chargement initial ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchProduits();
  }, []);

  async function fetchProduits() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/produits`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProduits(data.produits || []);
    } catch {
      setError("Impossible de charger les articles.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Encaisser (stock - 1) ────────────────────────────────────────────────
  async function vendu(p: Produit) {
    if (pending.has(p.id) || p.quantite === 0) return;

    setPending((prev) => new Set(prev).add(p.id));
    try {
      const res = await fetch(`${API_URL}/produits/${p.id}/quantite`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantite: p.quantite - 1 }),
      });

      if (!res.ok) throw new Error();

      // Log de la vente : on attend la réponse pour récupérer l'id créé,
      // qui sert ensuite à identifier la vente sur la page de saisie des infos élève.
      let venteId: string | number | null = null;
      try {
        const logRes = await fetch(`${API_URL}/logs`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "vente",
            produit_id: p.id,
            produit_nom: p.nom,
            details: JSON.stringify({
              prix_tickets: p.prix_tickets,
              stock_avant: p.quantite,
              stock_apres: p.quantite - 1,
              taille: p.taille,
              couleur: p.couleur,
            }),
          }),
        });
        if (logRes.ok) {
          const logData = await logRes.json();
          venteId = logData?.id ?? null;
        }
      } catch {
        // silencieux si le log échoue : la vente reste enregistrée côté stock
      }

      // Mise à jour locale immédiate
      setProduits((prev) =>
        prev.map((x) =>
          x.id === p.id ? { ...x, quantite: x.quantite - 1 } : x
        )
      );
      addToast(p.nom, true);

      // Redirection vers la page de saisie des infos de l'élève pour cette vente
      if (venteId !== null) {
        router.push(`/dashboard/manage/caisse/vente?id=${venteId}`);
      }
    } catch {
      addToast(p.nom, false);
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(p.id);
        return next;
      });
    }
  }

  function addToast(nom: string, ok: boolean) {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, nom, ok }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      2800
    );
  }

  // ─── Filtrage ─────────────────────────────────────────────────────────────
  const resultats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return produits;
    return produits.filter((p) =>
      [p.nom, p.couleur, p.type, p.genre, p.taille]
        .filter(Boolean)
        .some((c) => c.toLowerCase().includes(q))
    );
  }, [produits, search]);

  const enStock = resultats.filter((p) => p.quantite > 0);
  const rupture = resultats.filter((p) => p.quantite === 0);
  const affichage = [...enStock, ...rupture];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all ${
              t.ok
                ? "bg-emerald-500 text-white"
                : "bg-rose-500 text-white"
            }`}
          >
            {t.ok ? (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            )}
            {t.ok ? `Vendu : ${t.nom}` : `Erreur pour ${t.nom}`}
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-2">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Retour
          </a>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Caisse
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Cliquez sur <span className="font-medium text-pink-600 dark:text-pink-400">Vendu</span> pour retirer 1 du stock
            </p>
          </div>

          <button
            onClick={fetchProduits}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Actualiser
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative max-w-md">
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
              placeholder="Rechercher (nom, couleur, type, genre, taille...)"
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
          {!loading && (
            <p className="mt-2 text-xs text-zinc-400">
              {enStock.length} article{enStock.length > 1 ? "s" : ""} en stock
              {search.trim() ? ` pour « ${search.trim()} »` : ""}
            </p>
          )}
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </p>
        )}

        {/* Grille */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-900" />
            ))}
          </div>
        ) : affichage.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
            {search.trim() ? "Aucun article ne correspond à ta recherche." : "Aucun article pour le moment."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {affichage.map((p) => {
              const isRupture = p.quantite === 0;
              const isLoading = pending.has(p.id);

              return (
                <div
                  key={p.id}
                  className={`overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 ${
                    isRupture ? "opacity-50" : ""
                  }`}
                >
                  {/* Photo */}
                  <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    {p.photo_url ? (
                      <img
                        src={p.photo_url}
                        alt={p.nom}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                        Pas de photo
                      </div>
                    )}
                  </div>

                  {/* Infos + bouton */}
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {p.nom}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {p.type} · {p.genre} · {p.taille}
                    </p>

                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                        {p.prix_tickets} 🎟️
                      </span>
                      {isRupture ? (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                          Rupture
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-400">
                          {p.quantite} en stock
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => vendu(p)}
                      disabled={isRupture || isLoading}
                      className={`mt-3 w-full rounded-lg py-2 text-sm font-semibold transition ${
                        isRupture
                          ? "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
                          : isLoading
                          ? "cursor-wait bg-pink-400 text-white opacity-70"
                          : "bg-pink-600 text-white hover:bg-pink-700 active:scale-95"
                      }`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                          </svg>
                          En cours…
                        </span>
                      ) : isRupture ? (
                        "Rupture de stock"
                      ) : (
                        "✓ Vendu"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
