"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

// ────────────────────────────────────────────────────────────────────────
// ALGORITHME DE RECOMMANDATION
// ────────────────────────────────────────────────────────────────────────

type ViewCounts = {
  couleur: Record<string, number>;
  type: Record<string, number>;
  genre: Record<string, number>;
};

const VIEW_STORAGE_KEY = "bisou_view_counts";
const VIDE: ViewCounts = { couleur: {}, type: {}, genre: {} };

function normalise(v: string | null | undefined): string {
  return (v || "").trim().toLowerCase();
}

function loadViewCounts(): ViewCounts {
  if (typeof window === "undefined") return VIDE;
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY);
    if (!raw) return VIDE;
    const parsed = JSON.parse(raw);
    return {
      couleur: parsed.couleur || {},
      type: parsed.type || {},
      genre: parsed.genre || {},
    };
  } catch {
    return VIDE;
  }
}

function saveViewCounts(counts: ViewCounts) {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(counts));
  } catch {
    // stockage indisponible (navigation privée, etc.)
  }
}

function recordView(produit: Produit, counts: ViewCounts): ViewCounts {
  const next: ViewCounts = {
    couleur: { ...counts.couleur },
    type: { ...counts.type },
    genre: { ...counts.genre },
  };
  const couleur = normalise(produit.couleur);
  const type = normalise(produit.type);
  const genre = normalise(produit.genre);
  if (couleur) next.couleur[couleur] = (next.couleur[couleur] || 0) + 1;
  if (type) next.type[type] = (next.type[type] || 0) + 1;
  if (genre) next.genre[genre] = (next.genre[genre] || 0) + 1;
  saveViewCounts(next);
  return next;
}

function similarite(valeurProduit: string, valeurVue: string): number {
  if (!valeurProduit || !valeurVue) return 0;
  if (valeurProduit === valeurVue) return 1;
  if (valeurProduit.includes(valeurVue) || valeurVue.includes(valeurProduit)) return 0.5;
  return 0;
}

function scoreProduit(p: Produit, counts: ViewCounts): number {
  const couleur = normalise(p.couleur);
  const type = normalise(p.type);
  const genre = normalise(p.genre);

  let score = 0;
  for (const [c, n] of Object.entries(counts.couleur)) {
    score += 3 * n * similarite(couleur, c);
  }
  for (const [t, n] of Object.entries(counts.type)) {
    score += 2 * n * similarite(type, t);
  }
  for (const [g, n] of Object.entries(counts.genre)) {
    score += 1 * n * similarite(genre, g);
  }
  return score;
}

export default function BoutiquePage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [viewCounts, setViewCounts] = useState<ViewCounts>(VIDE);

  useEffect(() => {
    setViewCounts(loadViewCounts());
  }, []);

  const handleView = (p: Produit) => {
    setViewCounts((prev) => recordView(p, prev));
  };

  useEffect(() => {
    const fetchProduits = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/produits`);

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
    const filtres = q
      ? produits.filter((p) =>
          [p.nom, p.couleur, p.type, p.genre, p.taille]
            .filter(Boolean)
            .some((champ) => champ.toLowerCase().includes(q))
        )
      : produits;

    const aDeLHistorique =
      Object.keys(viewCounts.couleur).length > 0 ||
      Object.keys(viewCounts.type).length > 0 ||
      Object.keys(viewCounts.genre).length > 0;

    if (!aDeLHistorique) {
      return filtres.map((p) => ({ produit: p, recommande: false }));
    }

    const classes = filtres
      .map((p) => ({ produit: p, score: scoreProduit(p, viewCounts) }))
      .sort((a, b) => b.score - a.score);

    return classes.map((item, idx) => ({
      produit: item.produit,
      recommande: item.score > 0 && idx < 4,
    }));
  }, [produits, search, viewCounts]);

  const handleReserve = async (produitId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (reservingId) return;
    setReservingId(produitId);

    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produit_id: produitId }),
      });

      const data = await res.json();

      if (res.ok && data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        alert(data.detail || "Erreur lors de la réservation.");
        setReservingId(null);
      }
    } catch {
      alert("Impossible de contacter le serveur pour effectuer la réservation.");
      setReservingId(null);
    }
  };

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-16">
      <div>
        {/* Retour à l'accueil */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Retour à l'accueil
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            La boutique
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Tous les articles disponibles, réservables en 1 clic
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
              className="w-full rounded-xl border border-zinc-200/80 bg-white/80 py-2.5 pl-9 pr-3 text-sm text-zinc-900 outline-none backdrop-blur-md transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-zinc-800/80 dark:bg-zinc-950/80 dark:text-zinc-50"
            />
          </div>
          {!loading && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {resultats.length} article{resultats.length > 1 ? "s" : ""}
              {search.trim() ? ` pour « ${search.trim()} »` : ""}
            </p>
          )}
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-rose-200/80 bg-rose-50/80 px-4 py-2.5 text-sm font-medium text-rose-600 backdrop-blur-md dark:border-rose-900/80 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </p>
        )}

        {/* Grille des articles */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-white/40 dark:bg-zinc-900/40"
              />
            ))}
          </div>
        ) : resultats.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200/80 bg-white/80 px-6 py-12 text-center text-sm text-zinc-500 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 dark:text-zinc-400">
            {search.trim()
              ? "Aucun article ne correspond à ta recherche."
              : "Aucun article pour le moment."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {resultats.map(({ produit: p, recommande }) => (
              <div
                key={p.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950/80 ${
                  p.quantite === 0 ? "opacity-60" : ""
                }`}
              >
                {recommande && (
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                    ✨ Pour toi
                  </span>
                )}

                {/* Lien vers la vue de l'article */}
                <Link
                  href={`/boutique/view?id=${p.id}`}
                  onClick={() => handleView(p)}
                  className="block flex-1 cursor-pointer"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100/80 dark:bg-zinc-900/80">
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
                    <p className="truncate text-sm font-semibold text-zinc-900 transition group-hover:text-pink-600 dark:text-zinc-50 dark:group-hover:text-pink-400">
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
                        <span className="rounded-full bg-rose-100/80 px-2 py-0.5 text-[10px] font-medium text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                          Rupture
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {p.quantite} en stock
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Bouton de réservation */}
                <div className="p-3 pt-0">
                  <button
                    type="button"
                    disabled={p.quantite <= 0 || reservingId === p.id}
                    onClick={(e) => handleReserve(p.id, e)}
                    className="w-full rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 py-2 text-xs font-bold text-white shadow-md transition hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {reservingId === p.id
                      ? "Réservation..."
                      : p.quantite <= 0
                      ? "Indisponible"
                      : "Réserver ce vêtement 📌"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
