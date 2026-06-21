"use client";

import { useEffect } from "react";

const LOGIN_URL = "/auth/login";
const DASHBOARD_URL = "/dashboard";
const LOGO_URL = "https://storage.vth-mc.fr/pierred-dubois/img/web/logo-bisou.png";
const API_URL = "https://api.boutique-bisou.vth-mc.fr";

export default function Home() {
  useEffect(() => {
    // Le cookie de session est httpOnly (posé par l'API) -> on ne peut plus
    // le lire en JS, donc on demande directement à l'API si la session est valide.
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("not authenticated");
        window.location.href = DASHBOARD_URL;
      })
      .catch(() => {
        window.location.href = LOGIN_URL;
      });
  }, []);

  return (
    <div className="relative flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 dark:bg-black overflow-hidden">
      <img
        src={LOGO_URL}
        alt="BisouData"
        width={140}
        height={28}
        className="dark:invert mb-8"
      />
      <p className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">
        Vérification de la connexion...
      </p>
    </div>
  );
}
