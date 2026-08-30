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
// Principe : à chaque fois qu'une personne consulte un article, on compte
// +1 pour sa couleur, son type et son genre dans le navigateur (localStorage,
// anonyme). Plus une caractéristique a été vue souvent, plus les articles qui
// la partagent (ou qui s'en rapprochent, ex: "gris" ~ "gris foncé") remontent
// en haut de la boutique.

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
    // stockage indisponible (navigation privée, etc.) : on ignore silencieusement
  }
}

// Enregistre une consultation : +1 sur la couleur, le type et le genre du produit regardé
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

// Similarité entre une caractéristique déjà vue et celle d'un produit :
// - identique → poids plein (1)
// - l'une contient l'autre, ex: "gris" est inclus dans "gris foncé" → poids partiel (0.5)
// - rien en commun → 0
function similarite(valeurProduit: string, valeurVue: string): number {
  if (!valeurProduit || !valeurVue) return 0;
  if (valeurProduit === valeurVue) return 1;
  if (valeurProduit.includes(valeurVue) || valeurVue.includes(valeurProduit)) return 0.5;
  return 0;
}

// Score de recommandation d'un produit selon l'historique de consultation.
// La couleur pèse le plus (demande explicite : "10 pantalons gris vs 1 vert
// → proposer plus de gris ET de couleurs ressemblantes"), puis le type,
// puis le genre en dernier.
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

  // Charge l'historique de consultation stocké localement
  useEffect(() => {
    setViewCounts(loadViewCounts());
  }, []);

  // Appelé quand on clique sur un article pour le consulter
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

    // Sans historique de consultation : ordre d'origine (le plus récent d'abord)
    if (!aDeLHistorique) {
      return filtres.map((p) => ({ produit: p, recommande: false }));
    }

    // Avec historique : on classe par score de recommandation décroissant.
    // Array.prototype.sort est stable en JS moderne, donc à score égal
    // l'ordre d'origine est conservé.
    const classes = filtres
      .map((p) => ({ produit: p, score: scoreProduit(p, viewCounts) }))
      .sort((a, b) => b.score - a.score);

    return classes.map((item, idx) => ({
      produit: item.produit,
      // On met en avant les 4 meilleurs résultats seulement s'ils ont un vrai
      // lien avec l'historique (score > 0), pour ne pas sur-étiqueter la grille
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
    <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto max-w-6xl">
        {/* Retour à l'accueil */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Retour à l'accueil
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            La boutique
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
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
            {search.trim()
              ? "Aucun article ne correspond à ta recherche."
              : "Aucun article pour le moment."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {resultats.map(({ produit: p, recommande }) => (
              <div
                key={p.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 ${
                  p.quantite === 0 ? "opacity-60" : ""
                }`}
              >
                {recommande && (
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                    ✨ Pour toi
                  </span>
                )}

                {/* Lien vers la vue de l'article /boutique/view?id=... */}
                <Link
                  href={`/boutique/view?id=${p.id}`}
                  onClick={() => handleView(p)}
                  className="block flex-1 cursor-pointer"
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
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-pink-600 transition">
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
                </Link>

                {/* Bouton de réservation */}
                <div className="p-3 pt-0">
                  <button
                    type="button"
                    disabled={p.quantite <= 0 || reservingId === p.id}
                    onClick={(e) => handleReserve(p.id, e)}
                    className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-2 text-xs font-bold text-white shadow transition hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
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
