"use client";

import { useEffect } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";

// Intervalle entre deux "battements" pour rester compté comme présent.
// Doit rester strictement inférieur à CALCULATEUR_USER_ACTIF_SECONDES côté backend (90s).
const HEARTBEAT_MS = 45_000;

const STORAGE_KEY = "bb_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let id = sessionStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

async function ping(sessionId: string) {
  try {
    await fetch(`${API_URL}/protection/calculateur-user/ping`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
      keepalive: true,
      cache: "no-store",
    });
  } catch {
    // un échec de ping ne doit jamais bloquer la navigation
  }
}

/**
 * Composant invisible à monter une seule fois (dans le layout racine).
 * Dès l'arrivée sur le site : envoie un premier ping au backend FastAPI,
 * puis un heartbeat régulier tant que l'onglet reste ouvert, pour que
 * /protection/calculateur-user/get renvoie le nombre de visiteurs réellement présents.
 */
export default function CalculateurUserTracker() {
  useEffect(() => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    ping(sessionId);
    const interval = setInterval(() => ping(sessionId), HEARTBEAT_MS);

    return () => clearInterval(interval);
  }, []);

  return null;
}
