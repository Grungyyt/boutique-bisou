"use client";

import { useState } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGO_LEFT_URL = "https://storage.vth-mc.fr/pierred-dubois/img/web/logo-bisou.png";
const LOGO_RIGHT_URL = "https://storage.vth-mc.fr/vth-rose.png";
const DASHBOARD_URL = "https://boutique-bisou.vth-mc.fr/dashboard";
const SESSION_VERIF_URL = "/verif";

function PapiconUser({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z" fill="currentColor" />
      <path d="M4.34542 18.5821C4.39658 18.224 4.42215 18.0449 4.43934 17.9545C4.8491 15.7994 6.4989 14.5405 8.68577 14.7142C8.77748 14.7215 9.03624 14.7541 9.55376 14.8193C10.4048 14.9265 11.2587 15 12 15C12.7413 15 13.5952 14.9265 14.4462 14.8193C14.9638 14.7541 15.2225 14.7215 15.3142 14.7142C17.5011 14.5405 19.1509 15.7994 19.5607 17.9545C19.5778 18.0449 19.6034 18.224 19.6546 18.5821C19.6722 18.7056 19.681 18.7673 19.6857 18.8178C19.7892 19.9495 18.9302 20.9399 17.7953 20.9974C17.7447 21 17.6823 21 17.5575 21H6.4425C6.31772 21 6.25533 21 6.2047 20.9974C5.06979 20.9399 4.21082 19.9495 4.31433 18.8178C4.31895 18.7673 4.32777 18.7056 4.34542 18.5821Z" fill="currentColor" />
    </svg>
  );
}

function PapiconLock({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-6 antialiased dark:bg-black">
      {/* Halo lumineux */}
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-pink-500/15 via-rose-500/15 to-amber-400/10 blur-[120px]" />

      {/* Écran de vérification / Transition */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500 animate-in fade-in dark:bg-zinc-950">
          <div className="mb-8 flex items-center justify-center gap-6">
            <img src={LOGO_LEFT_URL} alt="Bisou" className="h-10 w-auto animate-bounce dark:invert" />
            <span className="text-xl font-light text-pink-500">+</span>
            <img src={LOGO_RIGHT_URL} alt="VTH" className="h-10 w-auto animate-bounce duration-700" />
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Vérification de la session...
          </p>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="h-full w-full origin-left bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 animate-in slide-in-from-left duration-1000 ease-out" />
          </div>
        </div>
      )}

      {/* Conteneur principal */}
      <div className="relative flex w-full max-w-5xl items-center justify-center gap-6 lg:gap-12">
        {/* Logo Gauche */}
        <div className={`hidden flex-1 justify-end transition-all duration-700 ease-out md:flex ${isVerifying ? "translate-x-16 opacity-80" : ""}`}>
          <img src={LOGO_LEFT_URL} alt="Boutique Bisou" className="h-12 w-auto object-contain transition-transform duration-500 hover:scale-105 dark:invert" />
        </div>

        {/* Panneau central de connexion */}
        <div className="relative w-full max-w-2xl shrink-0 overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-2xl backdrop-blur-2xl transition-all duration-500 dark:border-zinc-800/80 dark:bg-zinc-950">
          <div className="flex flex-col md:flex-row">
            
            {/* VUE 1 : LOGIN */}
            {activeTab === "login" && (
              <>
                {/* Dégradé à GAUCHE */}
                <div className="relative flex flex-col justify-between p-8 text-white md:w-1/2 bg-gradient-to-br from-pink-500 via-rose-500 to-amber-400">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Se connecter</h2>
                    <p className="mt-2 text-xs text-white/80">
                      Renseigne tes identifiants pour accéder à ton espace.
                    </p>
                  </div>
                  <div className="mt-8 text-xs font-medium text-white/60">
                    Boutique Bisou × VTH
                  </div>
                </div>

                {/* Formulaire à DROITE */}
                <div className="p-8 md:w-1/2">
                  <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full">
                    <div>
                      <div className="mb-4">
                        <label htmlFor="identifier" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Identifiant
                        </label>
                        <div className="group/field relative flex items-center">
                          <span className="pointer-events-none absolute left-3 flex items-center text-zinc-400 transition-all duration-300 group-focus-within/field:text-pink-500">
                            <PapiconUser className="h-4 w-4" />
                          </span>
                          <input
                            id="identifier"
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            placeholder="nom@exemple.fr"
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-sm font-medium text-zinc-900 outline-none transition-all focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-pink-500"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Mot de passe
                        </label>
                        <div className="group/field relative flex items-center">
                          <span className="pointer-events-none absolute left-3 flex items-center text-zinc-400 transition-all duration-300 group-focus-within/field:text-pink-500">
                            <PapiconLock className="h-4 w-4" />
                          </span>
                          <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-sm font-medium text-zinc-900 outline-none transition-all focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-pink-500"
                          />
                        </div>
                      </div>

                      {error && (
                        <p className="mb-3 text-xs font-medium text-rose-500">
                          {error}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group/btn relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.98]"
                    >
                      {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        "Connexion"
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* VUE 2 : SESSION EXISTANTE */}
            {activeTab === "session" && (
              <>
                {/* Contenu à GAUCHE */}
                <div className="p-8 md:w-1/2 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                      Session active détectée
                    </h2>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Une session précédente est enregistrée sur cet appareil.
                    </p>
                  </div>

                  <button
                    onClick={handleSessionRedirect}
                    className="group/btn relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.98]"
                  >
                    Me connecter à ma session
                  </button>
                </div>

                {/* Dégradé à DROITE */}
                <div className="relative flex flex-col justify-between p-8 text-white md:w-1/2 bg-gradient-to-br from-pink-500 via-rose-500 to-amber-400">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Accès Rapide</h2>
                    <p className="mt-2 text-xs text-white/80">
                      Poursuis ton travail sans ressaisir tes identifiants.
                    </p>
                  </div>
                  <div className="mt-8 text-xs font-medium text-white/60">
                    Boutique Bisou × VTH
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Navigation par onglets (Bottom Bar) */}
          <div className="grid grid-cols-2 border-t border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <button
              onClick={() => setActiveTab("login")}
              className={`py-3 text-xs font-semibold tracking-wider uppercase transition-all ${
                activeTab === "login"
                  ? "bg-white text-pink-500 shadow-sm dark:bg-zinc-950 dark:text-pink-400"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("session")}
              className={`py-3 text-xs font-semibold tracking-wider uppercase transition-all ${
                activeTab === "session"
                  ? "bg-white text-pink-500 shadow-sm dark:bg-zinc-950 dark:text-pink-400"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              J'ai déjà une session
            </button>
          </div>
        </div>

        {/* Logo Droit */}
        <div className={`hidden flex-1 justify-start transition-all duration-700 ease-out md:flex ${isVerifying ? "-translate-x-16 opacity-80" : ""}`}>
          <img src={LOGO_RIGHT_URL} alt="VTH" className="h-12 w-auto object-contain transition-transform duration-500 hover:scale-105" />
        </div>
      </div>
    </div>
  );
}
