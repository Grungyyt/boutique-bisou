"use client";

import { useEffect } from "react";

const API_BASE = "https://api.boutique-bisou.vth-mc.fr";

/**
 * Composant invisible : signale une visite au backend à chaque chargement
 * de page. Sert à calculer le "pic" de personnes présentes sur le site au
 * moment où il bascule en maintenance/panne (affiché ensuite sur la page
 * de statut externe www.vth-mc.fr/non-ope).
 */
export default function VisitTracker() {
  useEffect(() => {
    fetch(`${API_BASE}/visite`, { method: "POST" }).catch(() => {
      // silencieux : le comptage de visites ne doit jamais gêner la navigation
    });
  }, []);

  return null;
}
