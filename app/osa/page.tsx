"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type EtaResponse = {
  operational: boolean;
  message?: string;
};

type OsaResponse = {
  status: string; // "operationnel" | "ralentissement_leger" | "degrade" | "extremement_degrade"
  label?: string;
  message?: string;
};

const API_ETA_URL = "https://api.boutique-bisou.vth-mc.fr/eta";
const API_OSA_URL = "https://api.boutique-bisou.vth-mc.fr/osa";
const DEFAULT_MESSAGE =
  "Nous effectuons actuellement une maintenance préventive. Le service sera bientôt de retour.";

// Niveau OSA qui bloque complètement l'accès au site (au même titre que
// l'ancien "operational = false" de l'ETA classique)
const NIVEAU_OSA_BLOQUANT = "extremement_degrade";

export default function EtaVerifPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  // Vérifie les DEUX systèmes en parallèle :
  // - l'ancien ETA (booléen operational/maintenance)
  // - le nouveau OSA (4 niveaux)
  // Le site est bloqué si L'UN DES DEUX indique un problème bloquant.
  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const [etaRes, osaRes] = await Promise.allSettled([
        fetch(API_ETA_URL, { cache: "no-store" }),
        fetch(API_OSA_URL, { cache: "no-store" }),
      ]);

      let etaBloque = false;
      let osaBloque = false;
      let messageAAfficher = DEFAULT_MESSAGE;

      if (etaRes.status === "fulfilled" && etaRes.value.ok) {
        const data: EtaResponse = await etaRes.value.json();
        if (!data.operational) {
          etaBloque = true;
          messageAAfficher = data.message || DEFAULT_MESSAGE;
        }
      }

      if (osaRes.status === "fulfilled" && osaRes.value.ok) {
        const data: OsaResponse = await osaRes.value.json();
        if (data.status === NIVEAU_OSA_BLOQUANT) {
          osaBloque = true;
          messageAAfficher = data.message || DEFAULT_MESSAGE;
        }
      }

      if (!etaBloque && !osaBloque) {
        sessionStorage.setItem("bisou_eta_checked_at", Date.now().toString());
        router.replace("/");
        return;
      }

      setMessage(messageAAfficher);
    } catch (err) {
      console.error("Erreur lors de la vérification du statut :", err);
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
        <div className="mb-6 text-6xl">🔧</div>

        <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100 mb-2">
          Service en maintenance
        </h1>

        <p className="text-lg text-rose-800 dark:text-rose-200 mb-8">
          {message}
        </p>

        <div className="bg-white dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800 p-4 mb-6">
          <p className="text-sm text-rose-700 dark:text-rose-300">
            Veuillez réessayer dans quelques instants.
          </p>
        </div>

        <button
          onClick={checkStatus}
          className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition active:scale-95"
        >
          Réessayer
        </button>

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
