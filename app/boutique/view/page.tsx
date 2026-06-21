"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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

function BoutiqueViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Aucun article sélectionné.");
      setLoading(false);
      return;
    }

    const fetchProduit = async () => {
      setLoading(true);
      setError(null);
      try {
        // La route /produits est publique, pas besoin d'être connecté.
        const res = await fetch(`${API_URL}/produits`);

        if (!res.ok) {
          setError("Impossible de charger cet article.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        const found = (data.produits || []).find(
          (p: Produit) => p.id === id
        );

        if (!found) {
          setError("Cet article n'existe pas ou plus.");
        } else {
          setProduit(found);
        }
      } catch {
        setError("Impossible de contacter le serveur.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduit();
  }, [id]);

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto max-w-4xl">
        {/* Retour à la boutique */}
        <div className="mb-6">
          <a
            href="/boutique"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Retour à la boutique
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-900" />
            <div className="space-y-3">
              <div className="h-6 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-900" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-900" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-900" />
            </div>
          </div>
        ) : error ? (
          <p className="rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
            {error}
          </p>
        ) : produit ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {/* Photo */}
            <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              {produit.photo_url ? (
                <img
                  src={produit.photo_url}
                  alt={produit.nom}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
                  Pas de photo
                </div>
              )}
            </div>

            {/* Détails */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {produit.nom}
              </h1>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  {produit.type}
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  {produit.genre}
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  Taille {produit.taille}
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  {produit.couleur}
                </span>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <span className="text-2xl font-semibold text-pink-600 dark:text-pink-400">
                  {produit.prix_tickets} 🎟️
                </span>
                {produit.quantite === 0 ? (
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                    Rupture de stock
                  </span>
                ) : (
                  <span className="text-sm text-zinc-400">
                    {produit.quantite} en stock
                  </span>
                )}
              </div>

              <p className="mt-8 text-xs text-zinc-400">
                Ajouté le{" "}
                {new Date(produit.created_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function BoutiqueViewPage() {
  // useSearchParams nécessite un boundary Suspense côté App Router.
  return (
    <Suspense fallback={null}>
      <BoutiqueViewContent />
    </Suspense>
  );
}
