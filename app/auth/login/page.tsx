"use client";

import { useState } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGO_URL = "https://storage.vth-mc.fr/pierred-dubois/img/web/logo-bisou.png";
const DASHBOARD_URL = "https://boutique-bisou.vth-mc.fr/dashboard";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // requis pour que le cookie de session soit posé
        body: JSON.stringify({ identifier, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.detail || "Identifiants invalides.");
        setLoading(false);
        return;
      }

      window.location.href = DASHBOARD_URL;
    } catch {
      setError("Impossible de contacter le serveur. Réessaie.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <img src={LOGO_URL} alt="BisouData" width={140} height={28} className="mb-10 dark:invert" />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Connexion
        </h1>

        <label htmlFor="identifier" className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Email ou nom d'utilisateur
        </label>
        <input
          id="identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoComplete="username"
          className="mb-4 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />

        <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="mb-6 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />

        {error && <p className="mb-4 text-sm text-rose-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
