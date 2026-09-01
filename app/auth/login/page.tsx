"use client";

import { useState } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGO_URL = "https://storage.vth-mc.fr/pierred-dubois/img/web/logo-bisou.png";
const DASHBOARD_URL = "https://boutique-bisou.vth-mc.fr/dashboard";

function PapiconUser({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z"
        fill="currentColor"
      />
      <path
        d="M4.34542 18.5821C4.39658 18.224 4.42215 18.0449 4.43934 17.9545C4.8491 15.7994 6.4989 14.5405 8.68577 14.7142C8.77748 14.7215 9.03624 14.7541 9.55376 14.8193C10.4048 14.9265 11.2587 15 12 15C12.7413 15 13.5952 14.9265 14.4462 14.8193C14.9638 14.7541 15.2225 14.7215 15.3142 14.7142C17.5011 14.5405 19.1509 15.7994 19.5607 17.9545C19.5778 18.0449 19.6034 18.224 19.6546 18.5821C19.6722 18.7056 19.681 18.7673 19.6857 18.8178C19.7892 19.9495 18.9302 20.9399 17.7953 20.9974C17.7447 21 17.6823 21 17.5575 21H6.4425C6.31772 21 6.25533 21 6.2047 20.9974C5.06979 20.9399 4.21082 19.9495 4.31433 18.8178C4.31895 18.7673 4.32777 18.7056 4.34542 18.5821Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PapiconLock({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 15C12.8284 15 13.5 14.3284 13.5 13.5C13.5 12.6716 12.8284 12 12 12C11.1716 12 10.5 12.6716 10.5 13.5C10.5 14.3284 11.1716 15 12 15Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 9V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V9H17C18.1046 9 19 9.89543 19 11V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V11C5 9.89543 5.89543 9 7 9H8ZM10 7C10 5.89543 10.8954 5 12 5C13.1046 5 14 5.89543 14 7V9H10V7Z"
        fill="currentColor"
      />
    </svg>
  );
}

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
        credentials: "include",
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
      <img
        src={LOGO_URL}
        alt="BisouData"
        width={140}
        height={28}
        className="mb-10 transition-transform duration-500 hover:scale-110 dark:invert"
      />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-zinc-200/80 bg-white/80 p-8 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl dark:border-zinc-800/80 dark:bg-zinc-950/80"
      >
        <div className="group mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 group-hover:bg-pink-500/20">
            <PapiconUser className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Connexion
          </h1>
        </div>

        {/* Champ Identifiant avec animation d'icône fluide */}
        <div className="mb-4">
          <label htmlFor="identifier" className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Email ou nom d'utilisateur
          </label>
          <div className="group relative flex items-center">
            <span className="pointer-events-none absolute left-3 flex items-center text-zinc-400 transition-all duration-300 group-focus-within:translate-x-0.5 group-focus-within:scale-110 group-focus-within:text-pink-500">
              <PapiconUser className="h-5 w-5" />
            </span>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              placeholder="Ex: bisou@data.fr"
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 py-2.5 pl-10 pr-3 text-sm outline-none transition-all duration-300 placeholder:text-zinc-400 focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/15 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:bg-zinc-900"
            />
          </div>
        </div>

        {/* Champ Mot de passe avec animation d'icône fluide */}
        <div className="mb-6">
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Mot de passe
          </label>
          <div className="group relative flex items-center">
            <span className="pointer-events-none absolute left-3 flex items-center text-zinc-400 transition-all duration-300 group-focus-within:translate-x-0.5 group-focus-within:scale-110 group-focus-within:text-pink-500">
              <PapiconLock className="h-5 w-5" />
            </span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 py-2.5 pl-10 pr-3 text-sm outline-none transition-all duration-300 placeholder:text-zinc-400 focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/15 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:bg-zinc-900"
            />
          </div>
        </div>

        {error && (
          <p className="mb-4 animate-shake text-sm text-rose-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="relative flex w-full items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-pink-500/40 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Se connecter"
          )}
        </button>
      </form>
    </div>
  );
}
