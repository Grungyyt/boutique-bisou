"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  description?: string;
  created_at: string;
};

function ViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Aucun identifiant d'article n'a été fourni.");
      setLoading(false);
      return;
    }

    const fetchProduit = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/produits/${id}`);
        if (!res.ok) {
          const resAll = await fetch(`${API_URL}/produits`);
          if (resAll.ok) {
            const dataAll = await resAll.json();
            const found = (dataAll.produits || []).find((p: Produit) => p.id === id);
            if (found) {
              setProduit(found);
              setLoading(false);
              return;
            }
          }
          setError("Impossible de trouver cet article.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setProduit(data.produit || data);
      } catch {
        setError("Erreur de connexion lors du chargement de l'article.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduit();
  }, [id]);

  const handleReserve = async () => {
    if (!produit || isReserving) return;

    setIsReserving(true);

    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produit_id: produit.id }),
      });

      const data = await res.json();

      if (res.ok && data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        alert(data.detail || "Erreur lors de la réservation.");
        setIsReserving(false);
      }
    } catch {
      alert("Impossible de contacter le serveur pour effectuer la réservation.");
      setIsReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !produit) {
    return (
      <div className="mx-auto max-w-xl text-center py-16">
        <p className="mb-4 font-medium text-rose-500">{error || "Article introuvable."}</p>
        <Link
          href="/boutique"
          className="inline-flex items-center gap-2 text-sm font-semibold text-pink-600 hover:underline dark:text-pink-400"
        >
          ← Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link
          href="/boutique"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Retour à la boutique
        </Link>
      </div>

      <div className="grid gap-8 rounded-3xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 md:grid-cols-2 md:p-8">
        {/* Photo de l'article */}
        <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/80">
          {produit.photo_url ? (
            <img
              src={produit.photo_url}
              alt={produit.nom}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
              Aucune image disponible
            </div>
          )}
        </div>

        {/* Informations & Action */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="inline-block rounded-full bg-pink-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-pink-500 backdrop-blur-md">
                {produit.type}
              </span>
              <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {produit.nom}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-pink-600 dark:text-pink-400">
                {produit.prix_tickets} 🎟️ ticket{produit.prix_tickets > 1 ? "s" : ""}
              </span>
              {produit.quantite > 0 ? (
                <span className="rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  {produit.quantite} en stock
                </span>
              ) : (
                <span className="rounded-full bg-rose-100/80 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                  Rupture de stock
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-zinc-200/50 bg-zinc-100/60 p-4 text-sm backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-900/60">
              <div>
                <span className="block text-xs text-zinc-400">Genre</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {produit.genre || "-"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-zinc-400">Taille</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {produit.taille || "-"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-zinc-400">Couleur</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {produit.couleur || "-"}
                </span>
              </div>
            </div>

            {produit.description && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Description
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {produit.description}
                </p>
              </div>
            )}
          </div>

          {/* Bouton de réservation */}
          <div className="border-t border-zinc-200/80 pt-4 dark:border-zinc-800/80">
            <button
              type="button"
              disabled={produit.quantite <= 0 || isReserving}
              onClick={handleReserve}
              className="w-full rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 py-3.5 text-sm font-bold text-white shadow-md transition hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isReserving
                ? "Réservation en cours..."
                : produit.quantite <= 0
                ? "Indisponible"
                : "Réserver ce vêtement 📌"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewPage() {
  return (
    <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-16">
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
          </div>
        }
      >
        <ViewContent />
      </Suspense>
    </div>
  );
}
