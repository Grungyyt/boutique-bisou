"use client";

import { useEffect } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const API_KEY = "PUBLICKEY";

export default function VisitTracker() {
  useEffect(() => {
    // Génère un ID unique par session navigateur
    let clientId = sessionStorage.getItem("vth_client_id");
    if (!clientId) {
      clientId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem("vth_client_id", clientId);
    }

    const currentPath = window.location.pathname;

    // 1. Inscription du visiteur
    fetch(`${API_URL}/protection/calculateur-user/add?client_id=${clientId}`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
      },
    }).catch(console.error);

    // 2. Suppression lors de la fermeture de la page
    const handleUnload = () => {
      const path = window.location.pathname;
      if (path.includes("/osa")) return;

      const url = `${API_URL}/protection/calculateur-user/remove?client_id=${clientId}&current_path=${encodeURIComponent(path)}`;
      
      // sendBeacon garantit l'envoi de la requête même si la page se ferme
      const blob = new Blob([], { type: "text/plain" });
      navigator.sendBeacon(url, blob);
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return null;
}
