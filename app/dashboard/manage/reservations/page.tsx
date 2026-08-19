"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGIN_URL = "/auth/login";

export default function ManageReservationsPage() {
  const [debugLog, setDebugLog] = useState<string>("Chargement en cours...");
  const [rawLocalStorage, setRawLocalStorage] = useState<string>("");

  useEffect(() => {
    async function runDebug() {
      // 1. Regarder ce qu'il y a dans le localStorage
      const rawUser = localStorage.getItem("user");
      setRawLocalStorage(rawUser || "AUCUN UTILISATEUR DANS LOCALSTORAGE");

      if (!rawUser) {
        setDebugLog("Erreur : Pas d'utilisateur dans le localStorage. Redirection imminente vers le login...");
        setTimeout(() => {
          window.location.href = LOGIN_URL;
        }, 2000);
        return;
      }

      let user;
      try {
        user = JSON.parse(rawUser);
      } catch (e) {
        setDebugLog("Erreur : Impossible de parser le JSON du localStorage.");
        return;
      }

      setDebugLog(`Utilisateur trouvé : ID = ${user.id}, Admin = ${user.is_admin}. Tentative de fetch de l'API...`);

      // 2. Tester l'appel API vers les réservations admin
      try {
        const res = await fetch(`${API_URL}/admin/reservations?user_id=${user.id}`, {
          credentials: "include",
        });

        const textResponse = await res.text();
        
        setDebugLog(
          `Réponse reçue du serveur !\n` +
          `Status HTTP : ${res.status} ${res.statusText}\n` +
          `Réponse brute : ${textResponse}`
        );

        if (res.status === 401 || res.status === 403) {
          setDebugLog((prev) => prev + "\n\n-> Le serveur a refusé l'accès (401/403). C'est pour cela que tu es bloqué !");
        }
      } catch (err: any) {
        setDebugLog(`Erreur réseau lors du fetch : ${err.message}`);
      }
    }

    runDebug();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black text-zinc-900 dark:text-zinc-50">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <Link href="/dashboard" className="text-sm text-pink-600 underline">
            ← Retour au tableau de bord
          </Link>
        </div>

        <h1 className="text-xl font-bold mb-4">🔍 Outil de Debug Réservations</h1>

        <div className="mb-6 rounded-xl border border-zinc-300 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-500 mb-1">Contenu du LocalStorage (« user ») :</h2>
          <pre className="text-xs bg-zinc-100 dark:bg-zinc-950 p-3 rounded overflow-x-auto">
            {rawLocalStorage}
          </pre>
        </div>

        <div className="rounded-xl border border-zinc-300 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-500 mb-1">Résultat du Test API :</h2>
          <pre className="text-xs bg-zinc-100 dark:bg-zinc-950 p-3 rounded whitespace-pre-wrap overflow-x-auto">
            {debugLog}
          </pre>
        </div>
      </div>
    </div>
  );
}
