"use client";

import { useEffect, useState } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  state: "Session de connexion expirée. Réessaie.",
  auth: "La connexion avec VTH a échoué. Réessaie.",
  access: "L'accès à ce service a été refusé par VTH.",
};

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
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code) setError(ERROR_MESSAGES[code] ?? "Une erreur est survenue.");
  }, []);

  const goTo = (href: string) => {
    setError(null);
    setIsVerifying(true);
    setTimeout(() => {
      window.location.href = href;
    }, 900);
  };

  const buttonClass =
    "group/btn relative mt-6 flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-500/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50";

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-zinc-50 font-sans text-zinc-900 antialiased selection:bg-pink-500/20 selection:text-pink-600 dark:bg-black dark:text-zinc-100">
      {/* Halo de lumière d'arrière-plan */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-pink-500/20 via-rose-500/20 to-amber-400/10 blur-[100px]" />

      {/* Écran de redirection */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-50 dark:bg-black transition-all duration-500">
          <div className="h-0.5 w-32 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full w-full origin-left bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 animate-in slide-in-from-left duration-700 ease-out" />
          </div>
        </div>
      )}

      <div className="flex h-full w-full flex-col justify-between">
        <main className="relative flex-1 overflow-hidden">
          {/* VUE 1 : LOGIN */}
          <div
            className={`absolute inset-0 flex h-full w-full flex-col md:flex-row transition-all duration-500 ease-in-out ${
              activeTab === "login"
                ? "pointer-events-auto opacity-100 translate-x-0"
                : "pointer-events-none opacity-0 -translate-x-4"
            }`}
          >
            <div className="relative flex flex-1 flex-col justify-between p-6 md:p-12 lg:p-20">
              <div className="my-auto max-w-sm">
                <span className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                  Authentification
                </span>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
                  Se connecter
                </h1>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Connecte-toi avec ton compte VTH pour accéder au tableau de bord.
                </p>
              </div>

              <div className="text-[11px] font-medium tracking-wider text-zinc-400 dark:text-zinc-600 uppercase">
                Boutique Bisou — VTH
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-center p-6 md:p-12 lg:p-20">
              <div className="relative mx-auto w-full max-w-xs">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 opacity-15 blur transition duration-500" />

                <div className="relative w-full rounded-2xl border border-zinc-200/80 bg-white/80 p-6 md:p-8 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80">
                  <div className="mb-4 flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <PapiconLock className="h-4 w-4" />
                    <span className="text-xs">Connexion sécurisée via VTH Authentification</span>
                  </div>

                  {error && (
                    <p className="mb-2 text-xs text-rose-500">{error}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => goTo("/api/auth/login")}
                    className={buttonClass}
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover/btn:translate-x-full" />
                    Se connecter avec VTH
                  </button>
                </div>
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
            <div className="flex flex-1 flex-col justify-center p-6 md:p-12 lg:p-20">
              <div className="relative mx-auto w-full max-w-xs">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 opacity-15 blur transition duration-500" />
                <div className="relative w-full rounded-2xl border border-zinc-200/80 bg-white/80 p-6 md:p-8 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80">
                  <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Session mémorisée
                  </h2>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Si tu t'es déjà connecté avec VTH, tu peux reprendre ta session directement.
                  </p>

                  <button
                    type="button"
                    onClick={() => goTo("/dashboard")}
                    className={buttonClass}
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover/btn:translate-x-full" />
                    Ouvrir ma session
                  </button>
                </div>
              </div>
            </div>

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

        <footer className="relative z-20 shrink-0 w-full border-t border-zinc-200/80 bg-white/60 px-4 py-3 backdrop-blur-md dark:border-zinc-800/80 dark:bg-black/60">
          <div className="mx-auto flex max-w-xs justify-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
            <button
              type="button"
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
              type="button"
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
