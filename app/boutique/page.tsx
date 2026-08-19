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

export default function BoutiquePage() {
const [produits, setProduits] = useState<Produit[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [search, setSearch] = useState("");
const [reservingId, setReservingId] = useState<string | null>(null);

useEffect(() => {
const fetchProduits = async () => {
setLoading(true);
setError(null);
try {
const res = await fetch(${API_URL}/produits);

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


{/* Navigation retour */}


← Retour à l'accueil



    {/* En-tête de la page */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        La boutique ✨
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Découvrez tous nos vêtements disponibles. Cliquez sur une fiche pour voir les détails ou réserver directement.
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
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-pink-500"
        />
      </div>
      {!loading && (
        <p className="mt-2 text-xs text-zinc-400">
          {resultats.length} article{resultats.length > 1 ? "s" : ""}
          {search.trim() ? ` pour « ${search.trim()} »` : ""}
        </p>
      )}
    </div>

    {/* Message d'erreur */}
    {error && (
      <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
        {error}
      </div>
    )}

    {/* Grille des articles */}
    {loading ? (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 gap-y-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-900"
          />
        ))}
      </div>
    ) : resultats.length === 0 ? (
      <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
        {search.trim()
          ? "Aucun article ne correspond à votre recherche."
          : "Aucun article disponible pour le moment."}
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 gap-y-6">
        {resultats.map((p) => (
          <div
            key={p.id}
            className={`group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 ${
              p.quantite === 0 ? "opacity-60" : ""
            }`}
          >
            {/* Lien cliquable vers la fiche vêtement /boutique/view?id=... */}
            <Link
              href={`/boutique/view?id=${p.id}`}
              className="block flex-1"
            >
              <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
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
              <div className="p-3.5">
                <p className="truncate text-sm font-semibold text-zinc-900 transition group-hover:text-pink-600 dark:text-zinc-50 dark:group-hover:text-pink-400">
                  {p.nom}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {p.type} · {p.genre} · {p.taille}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
                    {p.prix_tickets} 🎟️
                  </span>
                  {p.quantite === 0 ? (
                    <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                      Rupture
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-zinc-400">
                      {p.quantite} en stock
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Bouton de réservation isolé */}
            <div className="p-3.5 pt-0">
              <button
                type="button"
                disabled={p.quantite <= 0 || reservingId === p.id}
                onClick={(e) => handleReserve(p.id, e)}
                className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-2.5 text-xs font-bold text-white shadow transition-all hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
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
