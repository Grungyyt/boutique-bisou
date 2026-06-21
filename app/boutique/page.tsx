"use client";

import { useEffect, useMemo, useState } from "react";

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
  created_at: string;
};

export default function BoutiquePage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProduits = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/produits`, { credentials: "include" });

        if (!res.ok) {
          setError("Impossible de charger les articles.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setProduits(data.produits || []);
      } catch {
        setError("Impossible de contacter le serveur.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduits();
  }, []);

  const resultats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return produits;

    return produits.filter((p) =>
      [p.nom, p.couleur, p.type, p.genre, p.taille]
        .filter(Boolean)
        .some((champ) => champ.toLowerCase().includes(q))
    );
  }, [produits, search]);

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto max-w-6xl">
        {/* Retour à l'accueil */}
        <div className="mb-4">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Retour à l'accueil
          </a>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            La boutique
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Tous les articles disponibles, en un coup d'œil
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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
              {resultats.length} article{resultats.length > 1 ? "s" : ""}
              {search.trim() ? ` pour « ${search.trim()} »` : ""}
            </p>
          )}
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </p>
        )}

        {/* Grille des articles */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-900"
              />
            ))}
          </div>
        ) : resultats.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
            {search.trim() ? "Aucun article ne correspond à ta recherche." : "Aucun article pour le moment."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {resultats.map((p) => (
              <div
                key={p.id}
                className={`group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 ${
                  p.quantite === 0 ? "opacity-60" : ""
                }`}
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  {p.photo_url ? (
                    <img
                      src={p.photo_url}
                      alt={p.nom}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                      Pas de photo
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {p.nom}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {p.type} · {p.genre} · {p.taille}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                      {p.prix_tickets} 🎟️
                    </span>
                    {p.quantite === 0 ? (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                        Rupture
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-400">
                        {p.quantite} en stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
