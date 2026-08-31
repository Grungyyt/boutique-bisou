"use client";

import { useEffect } from "react";

const API_VISITE_URL = "https://api.boutique-bisou.vth-mc.fr/visite";

export default function VisitTracker() {
  useEffect(() => {
    // Vérification légère pour ne compter qu'une seule visite par session de navigateur
    const alreadyCounted = sessionStorage.getItem("bisou_visited");

    if (!alreadyCounted) {
      fetch(API_VISITE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.ok) {
            sessionStorage.setItem("bisou_visited", "true");
          }
        })
        .catch((err) => {
          console.error("Erreur lors de l'enregistrement de la visite :", err);
        });
    }
  }, []);

  return null; // Composant invisible
}
