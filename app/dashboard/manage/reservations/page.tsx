"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";

type Reservation = {
  id: string;
  token: string;
  code_6_chiffres: string;
  produit_id: string;
  produit_nom: string;
  produit_type: string;
  produit_taille: string;
  produit_couleur: string;
  produit_photo: string | null;
  prix_tickets: number;
  status: string;
  created_at: string;
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await fetch(`${API_URL}/reservations`, { credentials: "include" });
        if (res.status === 401) {
          window.location.href = "/auth/login";
          return;
        }
        if (!res.ok) {
          throw new Error("Erreur de chargement des réservations.");
        }
        const data = await res.json();
        setReservations(data.reservations || []);
      } catch (err: any) {
        setError(err.message || "Impossible de contacter le serveur.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleMarkAsSold = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_URL}/reservations/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: "vendue" }),
      });

      if (res.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour du statut.");
      }

      // Mise à jour locale de l'état
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "vendue" } : r))
      );
    } catch (err: any) {
      alert(err.message || "Impossible de mettre à jour la réservation.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = reservations.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      r.code_6_chiffres.includes(q) ||
      r.produit_nom.toLowerCase().includes(q) ||
      r.token.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            ← Tableau de bord
          </Link>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              📌 Réservations en cours
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Associez le vêtement réservé avec le numéro à 6 chiffres présenté en boutique
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher code, nom..."
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs outline-none focus:border-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </p>
        )}

        {loading ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            Chargement des réservations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
            Aucune réservation enregistrée.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => {
              const isSold = r.status.toLowerCase() === "vendue";
              return (
                <div
                  key={r.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex items-center gap-4">
                    {/* Photo */}
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      {r.produit_photo ? (
                        <img
                          src={r.produit_photo}
                          alt={r.produit_nom}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                          Pas de photo
                        </div>
                      )}
                    </div>

                    {/* Infos Vêtement */}
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                        {r.produit_nom}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {r.produit_type} · {r.produit_taille} · {r.produit_couleur}
                      </p>
                      <p className="mt-1 text-xs font-bold text-pink-600 dark:text-pink-400">
                        Prix : {r.prix_tickets} ticket(s) 🎟️
                      </p>
                    </div>
                  </div>

                  {/* Code, Statut & Action */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 dark:border-zinc-800">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-zinc-400">
                        Numéro à présenter
                      </p>
                      <span className="text-2xl font-black font-mono tracking-wider text-pink-600 dark:text-pink-400">
                        #{r.code_6_chiffres}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          isSold
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300"
                        }`}
                      >
                        {r.status || "Réservé"}
                      </span>

                      {!isSold && (
                        <button
                          onClick={() => handleMarkAsSold(r.id)}
                          disabled={updatingId === r.id}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {updatingId === r.id ? "Mise à jour..." : "✓ Marquer vendue"}
                        </button>
                      )}
                    </div>
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
