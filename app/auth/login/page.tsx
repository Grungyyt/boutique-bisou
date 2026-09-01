"use client";

import { useState } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
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
      }, 900);
    } catch {
      setError("Impossible de contacter le serveur. Réessaie.");
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
    <div className="relative h-dvh w-full overflow-hidden bg-zinc-50 font-sans text-zinc-900 antialiased selection:bg-pink-500/20 selection:text-pink-600 dark:bg-black dark:text-zinc-100">
      {/* Halo de lumière d'arrière-plan */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-pink-500/20 via-rose-500/20 to-amber-400/10 blur-[100px]" />

      {/* Écran de redirection/vérification */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-50 dark:bg-black transition-all duration-500">
          <div className="h-0.5 w-32 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full w-full origin-left bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 animate-in slide-in-from-left duration-700 ease-out" />
          </div>
        </div>
      )}

      {/* Layout Fullscreen */}
      <div className="flex h-full w-full flex-col justify-between">
        {/* Zone de contenu central */}
        <main className="relative flex-1 overflow-hidden">
          {/* VUE 1 : LOGIN */}
          <div
            className={`absolute inset-0 flex h-full w-full flex-col md:flex-row transition-all duration-500 ease-in-out ${
              activeTab === "login"
                ? "pointer-events-auto opacity-100 translate-x-0"
                : "pointer-events-none opacity-0 -translate-x-4"
            }`}
          >
            {/* Panneau visuel (Gauche) */}
            <div className="relative flex flex-1 flex-col justify-between p-6 md:p-12 lg:p-20">
              <div className="my-auto max-w-sm">
                <span className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                  Authentification
                </span>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
                  Se connecter
                </h1>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Renseigne tes accès pour ouvrir ta session et accéder au tableau de bord.
                </p>
              </div>

              <div className="text-[11px] font-medium tracking-wider text-zinc-400 dark:text-zinc-600 uppercase">
                Boutique Bisou — VTH
              </div>
            </div>

            {/* Formulaire (Droit) */}
            <div className="flex flex-1 flex-col justify-center p-6 md:p-12 lg:p-20">
              <div className="relative mx-auto w-full max-w-xs">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 opacity-15 blur transition duration-500" />

                <form
                  onSubmit={handleSubmit}
                  className="relative w-full rounded-2xl border border-zinc-200/80 bg-white/80 p-6 md:p-8 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80"
                >
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="identifier" className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Email ou nom d'utilisateur
                      </label>
                      <div className="group/input relative flex items-center">
                        <span className="pointer-events-none absolute left-3 flex items-center text-zinc-400 transition-all duration-300 group-focus-within/input:text-pink-500">
                          <PapiconUser className="h-4 w-4" />
                        </span>
                        <input
                          id="identifier"
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          required
                          autoComplete="username"
                          placeholder="Ex: bisou@data.fr"
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9 pr-3 text-sm outline-none transition-all duration-300 placeholder:text-zinc-400 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/15 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-pink-500 dark:focus:bg-zinc-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Mot de passe
                      </label>
                      <div className="group/input relative flex items-center">
                        <span className="pointer-events-none absolute left-3 flex items-center text-zinc-400 transition-all duration-300 group-focus-within/input:text-pink-500">
                          <PapiconLock className="h-4 w-4" />
                        </span>
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9 pr-3 text-sm outline-none transition-all duration-300 placeholder:text-zinc-400 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/15 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-pink-500 dark:focus:bg-zinc-900"
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="animate-[bounce_0.2s_ease-in-out_2] text-xs text-rose-500">
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group/btn relative mt-6 flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-500/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover/btn:translate-x-full" />
                    {loading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      "Se connecter"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* VUE 2 : SESSION */}
          <div
            className={`absolute inset-0 flex h-full w-full flex-col md:flex-row transition-all duration-500 ease-in-out ${
              activeTab === "session"
                ? "pointer-events-auto opacity-100 translate-x-0"
                : "pointer-events-none opacity-0 translate-x-4"
            }`}
          >
            {/* Action Session (Gauche) */}
            <div className="flex flex-1 flex-col justify-center p-6 md:p-12 lg:p-20">
              <div className="relative mx-auto w-full max-w-xs">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 opacity-15 blur transition duration-500" />
                <div className="relative w-full rounded-2xl border border-zinc-200/80 bg-white/80 p-6 md:p-8 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80">
                  <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Session mémorisée
                  </h2>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Une session active a été détectée. Tu peux te reconnecter sans ressaisir tes accès.
                  </p>

                  <button
                    onClick={handleSessionRedirect}
                    className="group/btn relative mt-6 flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-500/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover/btn:translate-x-full" />
                    Ouvrir ma session
                  </button>
                </div>
              </div>
            </div>

            {/* Panneau visuel (Droit) */}
            <div className="relative flex flex-1 flex-col justify-between p-6 md:p-12 lg:p-20">
              <div className="my-auto max-w-sm">
                <span className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                  Accès Rapide
                </span>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
                  Reprendre la session
                </h1>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Poursuis tes activités immédiatement en toute sécurité.
                </p>
              </div>

              <div className="text-[11px] font-medium tracking-wider text-zinc-400 dark:text-zinc-600 uppercase">
                Boutique Bisou — VTH
              </div>
            </div>
          </div>
        </main>

        {/* Navigation Onglets (Footer Minimaliste) */}
        <footer className="relative z-20 shrink-0 w-full border-t border-zinc-200/80 bg-white/60 px-4 py-3 backdrop-blur-md dark:border-zinc-800/80 dark:bg-black/60">
          <div className="mx-auto flex max-w-xs justify-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 rounded-lg py-2 text-center text-[11px] font-medium uppercase tracking-wider transition-all ${
                activeTab === "login"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("session")}
              className={`flex-1 rounded-lg py-2 text-center text-[11px] font-medium uppercase tracking-wider transition-all ${
                activeTab === "session"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
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
