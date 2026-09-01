"use client";

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

export default function ReservationConfirmationPage() {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setError("Token de réservation introuvable.");
      setLoading(false);
      return;
    }

    const fetchReservation = async () => {
      try {
        const res = await fetch(`${API_URL}/reservations/lookup?token=${encodeURIComponent(token)}`);
        if (!res.ok) {
          throw new Error("Réservation introuvable ou expirée.");
        }
        const data = await res.json();
        setReservation(data);
      } catch (err: any) {
        setError(err.message || "Impossible de récupérer les détails de la réservation.");
      } font-medium {
        setLoading(false);
      }
    };

    fetchReservation();
  }, []);

  const handleCopyCode = () => {
    if (reservation?.code_6_chiffres) {
      navigator.clipboard.writeText(reservation.code_6_chiffres);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full rounded-3xl border border-zinc-200/80 bg-white/80 p-6 text-center shadow-xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 sm:p-8">
        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <img
            src="https://storage.vth-mc.fr/pierred-dubois/img/web/logo-bisou.png"
            alt="Boutique Bisou"
            className="h-16 w-auto object-contain"
          />
        </div>

        {loading ? (
          <div className="py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent" />
            <p className="mt-4 text-xs font-medium text-zinc-400">Chargement de votre réservation...</p>
          </div>
        ) : error ? (
          <div className="py-8">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-100/80 text-xl text-rose-600 backdrop-blur-md dark:bg-rose-950/50 dark:text-rose-400">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Réservation introuvable</h2>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
            <Link
              href="/boutique"
              className="mt-6 inline-block rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:scale-[1.01] active:scale-[0.98]"
            >
              Retour à la boutique
            </Link>
          </div>
        ) : reservation ? (
          <div>
            {/* Tag Succès */}
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-1 text-xs font-bold text-emerald-600 backdrop-blur-md dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span>✨</span>
              <span>Vêtement réservé avec succès !</span>
            </div>

            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Conservez votre numéro
            </h1>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Présentez ce numéro lors de votre passage en boutique.
            </p>

            {/* Encadré Code à 6 chiffres */}
            <div className="my-6 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-400 p-0.5 shadow-lg">
              <div className="rounded-[15px] bg-white/90 p-6 backdrop-blur-md dark:bg-zinc-950/90">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Numéro de Réservation
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="font-mono text-4xl font-black tracking-wider text-pink-600 dark:text-pink-400 sm:text-5xl">
                    {reservation.code_6_chiffres}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-pink-600 hover:underline dark:text-pink-400"
                >
                  {copied ? "✓ Copié !" : "📋 Copier le numéro"}
                </button>
              </div>
            </div>

            {/* Information "À présenter à la boutique bisou" */}
            <div className="mb-6 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3.5 text-left backdrop-blur-md dark:border-amber-800/50 dark:bg-amber-950/30">
              <p className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <span>📍</span> À présenter à la Boutique Bisou
              </p>
              <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                Montrez ce numéro à l'équipe pour récupérer votre article et donner vos {reservation.prix_tickets} ticket(s).
              </p>
            </div>

            {/* Récapitulatif de l'article */}
            <div className="flex items-center gap-4 rounded-2xl border border-zinc-200/60 bg-zinc-100/60 p-3.5 text-left backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-900/60">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80">
                {reservation.produit_photo ? (
                  <img
                    src={reservation.produit_photo}
                    alt={reservation.produit_nom}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                    Sans photo
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {reservation.produit_nom}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {reservation.produit_type} · {reservation.produit_taille} · {reservation.produit_couleur}
                </p>
                <p className="mt-1 text-xs font-bold text-pink-600 dark:text-pink-400">
                  {reservation.prix_tickets} ticket(s) 🎟️
                </p>
              </div>
            </div>

            {/* Lien retour */}
            <div className="mt-6">
              <Link
                href="/boutique"
                className="text-xs font-semibold text-zinc-500 transition hover:text-pink-600 dark:text-zinc-400 dark:hover:text-pink-400"
              >
                ← Continuer à visiter la boutique
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
