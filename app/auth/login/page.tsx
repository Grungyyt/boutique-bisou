"use client";

import { useState } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGO_CENTER_URL = "https://storage.vth-mc.fr/vth-rose-rond.png";
const DASHBOARD_URL = "https://boutique-bisou.vth-mc.fr/dashboard";
const SESSION_VERIF_URL = "/verif";

function PapiconUser({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z" fill="currentColor" />
      <path d="M4.34542 18.5821C4.39658 18.224 4.42215 18.0449 4.43934 17.9545C4.8491 15.7994 6.4989 14.5405 8.68577 14.7142C8.77748 14.7215 9.03624 14.7541 9.55376 14.8193C10.4048 14.9265 11.2587 15 12 15C12.7413 15 13.5952 14.9265 14.4462 14.8193C14.9638 14.7541 15.2225 14.7215 15.3142 14.7142C17.5011 14.5405 19.1509 15.7994 19.5607 17.9545C19.5778 18.0449 19.6034 18.224 19.6546 18.5821C19.6722 18.7056 19.681 18.7673 19.6857 18.8178C19.7892 19.9495 18.9302 20.9399 17.7953 20.9974C17.7447 21 17.6823 21 17.5575 21H6.4425C6.31772 21 6.25533 21 6.2047 20.9974C5.06979 20.9399 4.21082 19.9495 4.31433 18.8178C4.31895 18.7673 4.32777 18.7056 4.34542 18.5821Z" fill="currentColor" />
    </svg>
  );
}

function PapiconLock({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 15C12.8284 15 13.5 14.3284 13.5 13.5C13.5 12.6716 12.8284 12 12 12C11.1716 12 10.5 12.6716 10.5 13.5C10.5 14.3284 11.1716 15 12 15Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M8 9V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V9H17C18.1046 9 19 9.89543 19 11V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V11C5 9.89543 5.89543 9 7 9H8ZM10 7C10 5.89543 10.8954 5 12 5C13.1046 5 14 5.89543 14 7V9H10V7Z" fill="currentColor" />
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
      }, 1000);
    } catch {
      setError("Impossible de contacter le serveur. Réessaie.");
      setLoading(false);
    }
  };

  const handleSessionRedirect = () => {
    setIsVerifying(true);
    setTimeout(() => {
      window.location.href = SESSION_VERIF_URL;
    }, 1000);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900 font-sans text-slate-100 antialiased selection:bg-pink-500 selection:text-white">
      {/* Écran de chargement / Vérification */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 transition-all duration-500">
          <img
            src={LOGO_CENTER_URL}
            alt="Logo"
            className="mb-6 h-16 w-16 animate-pulse rounded-full border border-pink-500/20 shadow-xl shadow-pink-500/10"
          />
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-400">
            Connexion en cours...
          </p>
          <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-full origin-left bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 animate-in slide-in-from-left duration-1000 ease-out" />
          </div>
        </div>
      )}

      {/* Layout Fullscreen */}
      <div className="flex h-full w-full flex-col">
        {/* Header simple avec logo */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center p-6">
          <img
            src={LOGO_CENTER_URL}
            alt="Logo"
            className="h-12 w-12 rounded-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </header>

        {/* Espace central de contenu */}
        <main className="relative flex-1">
          {/* VUE 1 : LOGIN */}
          <div
            className={`absolute inset-0 flex h-full w-full flex-col transition-all duration-500 ease-out md:flex-row ${
              activeTab === "login"
                ? "pointer-events-auto opacity-100 translate-x-0"
                : "pointer-events-none opacity-0 -translate-x-8"
            }`}
          >
            {/* Dégradé réaliste et fluide (Côté Gauche) */}
            <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-pink-600 via-rose-500 to-amber-500 p-10 text-white md:w-1/2 md:p-16">
              {/* Effet d'ombrage léger pour le relief */}
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />

              <div className="relative z-10 my-auto max-w-md">
                <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                  Se connecter
                </h1>
                <p className="mt-4 text-sm font-medium text-white/90 leading-relaxed md:text-base">
                  Renseigne tes accès pour ouvrir ta session et accéder à ton espace.
                </p>
              </div>

              <div className="relative z-10 text-xs font-semibold tracking-wider text-white/70 uppercase">
                Boutique Bisou × VTH
              </div>
            </div>

            {/* Formulaire (Côté Droit) */}
            <div className="flex flex-1 flex-col justify-center bg-slate-950 p-8 md:p-16 md:w-1/2">
              <form onSubmit={handleSubmit} className="mx-auto flex h-full w-full max-w-sm flex-col justify-center">
                <div className="space-y-5">
                  <div>
                    <label htmlFor="identifier" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Identifiant
                    </label>
                    <div className="relative flex items-center">
                      <span className="pointer-events-none absolute left-3.5 text-slate-500">
                        <PapiconUser className="h-4 w-4" />
                      </span>
                      <input
                        id="identifier"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        placeholder="nom@exemple.fr"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-pink-500 focus:bg-slate-900 focus:ring-1 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Mot de passe
                    </label>
                    <div className="relative flex items-center">
                      <span className="pointer-events-none absolute left-3.5 text-slate-500">
                        <PapiconLock className="h-4 w-4" />
                      </span>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-pink-500 focus:bg-slate-900 focus:ring-1 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs font-medium text-rose-400">
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-8 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-pink-500/10 transition-all hover:brightness-110 active:scale-[0.99]"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "Connexion"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* VUE 2 : SESSION */}
          <div
            className={`absolute inset-0 flex h-full w-full flex-col transition-all duration-500 ease-out md:flex-row ${
              activeTab === "session"
                ? "pointer-events-auto opacity-100 translate-x-0"
                : "pointer-events-none opacity-0 translate-x-8"
            }`}
          >
            {/* Contenu (Côté Gauche) */}
            <div className="flex flex-1 flex-col justify-center bg-slate-950 p-8 md:p-16 md:w-1/2">
              <div className="mx-auto flex h-full w-full max-w-sm flex-col justify-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">
                    Session enregistrée
                  </h2>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                    Une session active a été trouvée. Tu peux te reconnecter immédiatement sans retaper tes identifiants.
                  </p>
                </div>

                <button
                  onClick={handleSessionRedirect}
                  className="mt-8 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-pink-500/10 transition-all hover:brightness-110 active:scale-[0.99]"
                >
                  Me connecter à ma session
                </button>
              </div>
            </div>

            {/* Dégradé réaliste (Côté Droit) */}
            <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-pink-600 via-rose-500 to-amber-500 p-10 text-white md:w-1/2 md:p-16">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />

              <div className="relative z-10 my-auto max-w-md">
                <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                  Accès Rapide
                </h1>
                <p className="mt-4 text-sm font-medium text-white/90 leading-relaxed md:text-base">
                  Reprends tes activités là où tu t'étais arrêté en un instant.
                </p>
              </div>

              <div className="relative z-10 text-xs font-semibold tracking-wider text-white/70 uppercase">
                Boutique Bisou × VTH
              </div>
            </div>
          </div>
        </main>

        {/* Nouveau design d'onglets en bas (Moderne et réaliste) */}
        <footer className="relative z-20 w-full border-t border-slate-800 bg-slate-950/90 backdrop-blur-md">
          <div className="mx-auto grid max-w-2xl grid-cols-2 p-2">
            <button
              onClick={() => setActiveTab("login")}
              className={`relative flex items-center justify-center py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-300 rounded-lg ${
                activeTab === "login"
                  ? "text-pink-400 bg-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Login
              {activeTab === "login" && (
                <span className="absolute bottom-1 h-0.5 w-6 rounded-full bg-pink-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("session")}
              className={`relative flex items-center justify-center py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-300 rounded-lg ${
                activeTab === "session"
                  ? "text-pink-400 bg-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              J'ai déjà une session
              {activeTab === "session" && (
                <span className="absolute bottom-1 h-0.5 w-6 rounded-full bg-pink-500" />
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
