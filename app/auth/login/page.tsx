"use client";

import { useState } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGO_CENTER_URL = "https://storage.vth-mc.fr/vth-rose-rond.png";
const DASHBOARD_URL = "https://boutique-bisou.vth-mc.fr/dashboard";
const SESSION_VERIF_URL = "/verif";

function IconUser({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "session">("login");
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

      setIsVerifying(true);
      setTimeout(() => {
        window.location.href = DASHBOARD_URL;
      }, 900);
    } catch {
      setError("Impossible de contacter le serveur.");
      setLoading(false);
    }
  };

  const handleSessionRedirect = () => {
    setIsVerifying(true);
    setTimeout(() => {
      window.location.href = SESSION_VERIF_URL;
    }, 900);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-rose-500/20 selection:text-rose-200">
      
      {/* Écran de vérification minimaliste */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 transition-all duration-500">
          <img
            src={LOGO_CENTER_URL}
            alt="Logo"
            className="mb-6 h-12 w-12 animate-pulse rounded-full opacity-90"
          />
          <div className="h-0.5 w-32 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-full origin-left bg-gradient-to-r from-rose-500 to-amber-500 animate-in slide-in-from-left duration-700 ease-out" />
          </div>
        </div>
      )}

      {/* Structure globale */}
      <div className="flex h-full w-full flex-col">
        
        {/* Header minimaliste */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center p-8">
          <img
            src={LOGO_CENTER_URL}
            alt="Logo"
            className="h-10 w-10 opacity-90 transition-opacity hover:opacity-100"
          />
        </header>

        {/* Espace central de contenu */}
        <main className="relative flex-1">
          
          {/* VUE 1 : LOGIN */}
          <div
            className={`absolute inset-0 flex h-full w-full flex-col transition-all duration-500 ease-in-out md:flex-row ${
              activeTab === "login"
                ? "pointer-events-auto opacity-100 translate-x-0"
                : "pointer-events-none opacity-0 -translate-x-4"
            }`}
          >
            {/* Dégradé pro & minimaliste (Gaucher) */}
            <div className="relative flex flex-col justify-between bg-gradient-to-br from-zinc-900 via-zinc-900 to-rose-950/40 p-12 text-zinc-100 md:w-1/2 md:p-20">
              <div className="my-auto max-w-sm">
                <span className="text-xs font-semibold uppercase tracking-widest text-rose-400/80">
                  Authentification
                </span>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  Se connecter
                </h1>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  Accédez à votre compte pour gérer vos activités.
                </p>
              </div>

              <div className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                Boutique Bisou — VTH
              </div>
            </div>

            {/* Formulaire (Droit) */}
            <div className="flex flex-1 flex-col justify-center bg-zinc-950 p-8 md:p-20 md:w-1/2">
              <form onSubmit={handleSubmit} className="mx-auto flex h-full w-full max-w-xs flex-col justify-center">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="identifier" className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                      Identifiant
                    </label>
                    <div className="relative flex items-center">
                      <span className="pointer-events-none absolute left-3.5 text-zinc-500">
                        <IconUser />
                      </span>
                      <input
                        id="identifier"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        placeholder="nom@exemple.fr"
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2.5 pl-10 pr-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-rose-500/50 focus:bg-zinc-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                      Mot de passe
                    </label>
                    <div className="relative flex items-center">
                      <span className="pointer-events-none absolute left-3.5 text-zinc-500">
                        <IconLock />
                      </span>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2.5 pl-10 pr-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-rose-500/50 focus:bg-zinc-900"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-rose-400">
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center rounded-lg bg-zinc-100 py-2.5 text-sm font-medium text-zinc-950 transition-all hover:bg-white active:scale-[0.99]"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                  ) : (
                    "Connexion"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* VUE 2 : SESSION */}
          <div
            className={`absolute inset-0 flex h-full w-full flex-col transition-all duration-500 ease-in-out md:flex-row ${
              activeTab === "session"
                ? "pointer-events-auto opacity-100 translate-x-0"
                : "pointer-events-none opacity-0 translate-x-4"
            }`}
          >
            {/* Contenu (Gaucher) */}
            <div className="flex flex-1 flex-col justify-center bg-zinc-950 p-8 md:p-20 md:w-1/2">
              <div className="mx-auto flex h-full w-full max-w-xs flex-col justify-center">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Session active
                  </h2>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    Une session valide a été trouvée pour cet appareil.
                  </p>
                </div>

                <button
                  onClick={handleSessionRedirect}
                  className="mt-6 flex w-full items-center justify-center rounded-lg bg-zinc-100 py-2.5 text-sm font-medium text-zinc-950 transition-all hover:bg-white active:scale-[0.99]"
                >
                  Me connecter à ma session
                </button>
              </div>
            </div>

            {/* Dégradé pro & minimaliste (Droit) */}
            <div className="relative flex flex-col justify-between bg-gradient-to-bl from-zinc-900 via-zinc-900 to-rose-950/40 p-12 text-zinc-100 md:w-1/2 md:p-20">
              <div className="my-auto max-w-sm">
                <span className="text-xs font-semibold uppercase tracking-widest text-rose-400/80">
                  Accès Rapide
                </span>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  Reprendre la session
                </h1>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  Poursuivez immédiatement sans réintroduire vos accès.
                </p>
              </div>

              <div className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                Boutique Bisou — VTH
              </div>
            </div>
          </div>
        </main>

        {/* Navigation d'onglets au style minimaliste */}
        <footer className="relative z-20 w-full border-t border-zinc-900 bg-zinc-950 px-4 py-3">
          <div className="mx-auto flex max-w-xs justify-center gap-1 rounded-xl bg-zinc-900/60 p-1">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 rounded-lg py-2 text-center text-[11px] font-medium uppercase tracking-wider transition-all ${
                activeTab === "login"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("session")}
              className={`flex-1 rounded-lg py-2 text-center text-[11px] font-medium uppercase tracking-wider transition-all ${
                activeTab === "session"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Session
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
