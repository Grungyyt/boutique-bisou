"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type OsaResponse = {
  status: string; // "operationnel" | "ralentissement_leger" | "degrade" | "extremement_degrade"
  label?: string;
  message?: string;
};

const API_OSA_URL = "https://api.boutique-bisou.vth-mc.fr/osa";
const DEFAULT_MESSAGE =
  "Nous effectuons actuellement une maintenance préventive. Le service sera bientôt de retour.";

// Seul le niveau le plus grave bloque complètement l'accès au site.
// Les niveaux "ralentissement léger" et "légèrement dégradé" n'empêchent pas
// la navigation : ils s'affichent seulement en bandeau via OsaStatusBadge
// dans le layout.
const NIVEAU_BLOQUANT = "extremement_degrade";

export default function EtaVerifPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  // Interroge le serveur pour connaître le niveau OSA actuel.
  // - Si le niveau n'est PAS "extremement_degrade" : on marque la vérification
  //   comme faite, puis on renvoie vers l'accueil.
  // - Si le niveau EST "extremement_degrade" : on reste sur cette page et on
  //   affiche le message renvoyé par le serveur.
  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch(API_OSA_URL, { cache: "no-store" });

      if (res.ok) {
        const data: OsaResponse = await res.json();

        if (data.status !== NIVEAU_BLOQUANT) {
          sessionStorage.setItem("bisou_eta_checked_at", Date.now().toString());
          router.replace("/");
          return;
        }

        setMessage(data.message || DEFAULT_MESSAGE);
      }
    } catch (err) {
      console.error("Erreur lors de la vérification du statut :", err);
      // Si le service de statut est injoignable, on laisse passer plutôt que
      // de bloquer tout le site à cause d'une panne réseau isolée.
      sessionStorage.setItem("bisou_eta_checked_at", Date.now().toString());
      router.replace("/");
      return;
    } finally {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 px-6">
      <div className="text-center max-w-md">
        {/* Icône d'erreur */}
        <div className="mb-6 text-6xl">
          🔧
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100 mb-2">
          Service extrêmement dégradé
        </h1>

        {/* Description (message dynamique renvoyé par le serveur) */}
        <p className="text-lg text-rose-800 dark:text-rose-200 mb-8">
          {message}
        </p>

        {/* Message informatif */}
        <div className="bg-white dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800 p-4 mb-6">
          <p className="text-sm text-rose-700 dark:text-rose-300">
            Veuillez réessayer dans quelques instants.
          </p>
        </div>

        {/* Bouton de réessai : relance la vérification sans recharger toute la page */}
        <button
          onClick={checkStatus}
          className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition active:scale-95"
        >
          Réessayer
        </button>

        {/* Email de support */}
        <p className="mt-6 text-xs text-rose-600 dark:text-rose-400">
          Pour toute question :<br />
          <a
            href="mailto:support@boutique-bisou.fr"
            className="underline hover:text-rose-700"
          >
            support@boutique-bisou.fr
          </a>
        </p>
      </div>
    </div>
  );
}
