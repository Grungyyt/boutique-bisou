"use client";

import { useState } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGO_LEFT_URL = "https://storage.vth-mc.fr/pierred-dubois/img/web/logo-bisou.png";
const LOGO_RIGHT_URL = "https://storage.vth-mc.fr/vth-rose.png";
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
  const [isVerifying, setIsVerifying] = useState(false);

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

      // Déclenchement de la transition de vérification
      setIsVerifying(true);
      setTimeout(() => {
        window.location.href = DASHBOARD_URL;
      }, 1200);
    } catch {
      setError("Impossible de contacter le serveur. Réessaie.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-6 antialiased dark:bg-black">
      {/* Halo lumineux d'arrière-plan */}
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-pink-500/15 via-rose-500/15 to-amber-400/10 blur-[120px]" />

      {/* Écran de transition / vérification sur fond blanc/sombre */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white duration-500 animate-in fade-in dark:bg-zinc-950">
          <div className="mb-8 flex items-center justify-center gap-6">
            <img
              src={LOGO_LEFT_URL}
              alt="Boutique Bisou"
              className="h-10 w-auto animate-bounce dark:invert"
            />
            <span className="text-xl font-light text-pink-500">+</span>
            <img
              src={LOGO_RIGHT_URL}
              alt="VTH"
              className="h-10 w-auto animate-bounce duration-700"
            />
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Vérification de la session...
          </p>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="h-full w-full origin-left bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 animate-in slide-in-from-left duration-1000 ease-out" />
          </div>
        </div>
      )}

      {/* Disposition principale avec logos latéraux */}
      <div className="relative flex w-full max-w-5xl items-center justify-center gap-6 lg:gap-12">
        {/* Logo Gauche */}
        <div
          className={`hidden flex-1 justify-end transition-all duration-700 ease-out md:flex ${
            loading ? "translate-x-16 opacity-80" : ""
          }`}
        >
          <img
            src={LOGO_LEFT_URL}
            alt="Boutique Bisou"
            className="h-12 w-auto object-contain transition-transform duration-500 hover:scale-105 dark:invert"
          />
        </div>

        {/* Formulaire central */}
        <div className="relative w-full max-w-sm shrink-0">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 opacity-20 blur-lg transition-all duration-500 group-hover:opacity-40" />

          <form
            onSubmit={handleSubmit}
            className="relative w-full rounded-2xl border border-zinc-200/80 bg-white/80 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-500 dark:border-zinc-800/80 dark:bg-zinc-950/80"
          >
            {/* Logos visibles sur mobile uniquement */}
            <div className="mb-6 flex items-center justify-between md:hidden">
              <img
                src={LOGO_LEFT_URL}
                alt="Bisou"
                className="h-8 w-auto dark:invert"
              />
              <img src={LOGO_RIGHT_URL} alt="VTH" className="h-8 w-auto" />
            </div>

            <div className="group/head mb-8 flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500/10 to-rose-500/10 text-pink-500 transition-all duration-500 group-hover/head:scale-110 group-hover/head:from-pink-500 group-hover/head:to-rose-500 group-hover/head:text-white">
                <PapiconUser className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Connexion
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Espace d'authentification
                </p>
              </div>
            </div>

            {/* Champ Identifiant */}
            <div className="mb-5">
              <label
                htmlFor="identifier"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
              >
                Identifiant
              </label>
              <div className="group/field relative flex items-center">
                <span className="pointer-events-none absolute left-3.5 flex items-center text-zinc-400 transition-all duration-300 group-focus-within/field:rotate-6 group-focus-within/field:scale-110 group-focus-within/field:text-pink-500">
                  <PapiconUser className="h-5 w-5" />
                </span>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="nom@exemple.fr"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 py-2.5 pl-11 pr-4 text-sm font-medium text-zinc-900 outline-none transition-all duration-300 placeholder:text-zinc-400 focus:border-pink-500/80 focus:bg-white focus:ring-4 focus:ring-pink-500/10 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-pink-500/80 dark:focus:bg-zinc-900"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
              >
                Mot de passe
              </label>
              <div className="group/field relative flex items-center">
                <span className="pointer-events-none absolute left-3.5 flex items-center text-zinc-400 transition-all duration-300 group-focus-within/field:rotate-6 group-focus-within/field:scale-110 group-focus-within/field:text-pink-500">
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
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 py-2.5 pl-11 pr-4 text-sm font-medium text-zinc-900 outline-none transition-all duration-300 placeholder:text-zinc-400 focus:border-pink-500/80 focus:bg-white focus:ring-4 focus:ring-pink-500/10 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-pink-500/80 dark:focus:bg-zinc-900"
                />
              </div>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-500 dark:bg-rose-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group/btn relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 transition-all duration-300 hover:scale-[1.015] hover:shadow-xl hover:shadow-pink-500/35 active:scale-[0.97] disabled:opacity-50"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-in-out group-hover/btn:translate-x-full" />

              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <span className="relative flex items-center gap-2">
                  Se connecter
                  <svg
                    className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Logo Droit */}
        <div
          className={`hidden flex-1 justify-start transition-all duration-700 ease-out md:flex ${
            loading ? "-translate-x-16 opacity-80" : ""
          }`}
        >
          <img
            src={LOGO_RIGHT_URL}
            alt="VTH"
            className="h-12 w-auto object-contain transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>
    </div>
  );
}
