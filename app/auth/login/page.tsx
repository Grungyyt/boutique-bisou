"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGO_URL = "https://storage.vth-mc.fr/pierred-dubois/img/web/logo-bisou.png";
const DASHBOARD_URL = "https://boutique-bisou.vth-mc.fr/dashboard";

// Composant d'icône SVG Papicons avec gestion du remplissage dynamique
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
      {/* Logo avec apparition en douceur */}
      <motion.img
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        src={LOGO_URL}
        alt="BisouData"
        width={140}
        height={28}
        className="mb-10 dark:invert"
      />

      {/* Carte du formulaire animée */}
      <motion.form
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        {/* Titre avec Icône Papicons animée */}
        <div className="mb-6 flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500"
          >
            <PapiconUser className="h-6 w-6" />
          </motion.div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Connexion
          </h1>
        </div>

        <div className="mb-4">
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
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div className="mb-6">
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
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        {/* Message d'erreur fluide */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 text-sm text-rose-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Bouton interactif avec micro-animations */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="relative w-full overflow-hidden rounded-lg bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95 disabled:opacity-50"
        >
          {loading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            "Se connecter"
          )}
        </motion.button>
      </motion.form>
    </div>
  );
}
