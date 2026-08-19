"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";

type Produit = {
  id: string;
  nom: string;
  type: string;
  taille: string;
  couleur: string;
  photo: string | null;
  prix_tickets: number;
  disponible: boolean;
};

export default function HomePage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("Tous");
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [reservationSuccess, setReservationSuccess] = useState<{ code: string; nom: string } | null>(null);

  const topRef = useRef<HTMLDivElement>(null);

  const fetchProduits = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/produits`);
      if (!res.ok) throw new Error("Erreur lors de la récupération des produits.");
      const data = await res.json();
      setProduits(data.produits || data || []);
    } catch (err: any) {
      setError(err.message || "Impossible de charger le catalogue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProduits();
  }, [fetchProduits]);

  const typesList = useMemo(() => {
    const types = Array.from(new Set(produits.map((p) => p.type).filter(Boolean)));
    return ["Tous", ...types];
  }, [produits]);

  const filteredProduits = useMemo(() => {
    return produits.filter((p) => {
      const matchesSearch =
        p.nom.toLowerCase().includes(search.toLowerCase()) ||
        p.couleur.toLowerCase().includes(search.toLowerCase()) ||
        p.taille.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedType === "Tous" || p.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [produits, search, selectedType]);

  const handleReserver = async (produitId: string) => {
    setReservingId(produitId);
    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produit_id: produitId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la réservation.");
      }

      const data = await res.json();
      const target = produits.find((p) => p.id === produitId);

      setReservationSuccess({
        code: data.code_6_chiffres || data.code || "123456",
        nom: target?.nom || "Article",
      });

      fetchProduits();
    } catch (err: any) {
      alert(err.message || "Une erreur est survenue lors de la réservation.");
    } finally {
      setReservingId(null);
    }
  };

  return (
    <div ref={topRef} className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100 p-6">
      <header className="mx-auto max-w-6xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-black text-pink-600 dark:text-pink-400">
            Boutique Bisou 💋
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Réserve tes vêtements préférés en tickets !
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Espace Admin →
        </Link>
      </header>

      <main className="mx-auto max-w-6xl">
        {/* Validation de réservation */}
        {reservationSuccess && (
          <div className="mb-8 rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
            <h2 className="text-lg font-bold mb-2">🎉 Réservation réussie !</h2>
            <p className="text-sm mb-4">
              Article réservé : <strong>{reservationSuccess.nom}</strong>
            </p>
            <div className="rounded-xl bg-white p-4 text-center shadow-inner dark:bg-zinc-900">
              <p className="text-xs uppercase font-bold text-zinc-400">Présente ce code en boutique</p>
              <p className="text-3xl font-black font-mono text-pink-600 dark:text-pink-400 tracking-widest mt-1">
                #{reservationSuccess.code}
              </p>
            </div>
            <button
              onClick={() => setReservationSuccess(null)}
              className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Barre de recherche et filtres */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un vêtement, taille, couleur..."
            className="w-full sm:max-w-xs rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs outline-none focus:border-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {typesList.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  selectedType === type
                    ? "bg-pink-600 text-white"
                    : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Catalogue */}
        {loading ? (
          <div className="py-20 text-center text-xs text-zinc-400">
            Chargement de la boutique...
          </div>
        ) : filteredProduits.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
            Aucun vêtement ne correspond à votre recherche.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProduits.map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                  {p.photo ? (
                    <img
                      src={p.photo}
                      alt={p.nom}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                      Pas d'image
                    </div>
                  )}
                  {!p.disponible && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                        Indisponible
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                      {p.nom}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {p.type} · Taille {p.taille} · {p.couleur}
                    </p>
                    <p className="mt-2 text-sm font-black text-pink-600 dark:text-pink-400">
                      {p.prix_tickets} ticket(s) 🎟️
                    </p>
                  </div>

                  <button
                    onClick={() => handleReserver(p.id)}
                    disabled={!p.disponible || reservingId === p.id}
                    className="w-full rounded-xl bg-pink-600 py-2.5 text-xs font-bold text-white transition hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reservingId === p.id
                      ? "Réservation..."
                      : p.disponible
                      ? "Réserver cet article"
                      : "Non disponible"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
