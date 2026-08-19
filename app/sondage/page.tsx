"use client";

import { useState } from "react";

const NIVEAUX = [
  { label: "6ème", val: "6" },
  { label: "5ème", val: "5" },
  { label: "4ème", val: "4" },
  { label: "3ème", val: "3" },
];

const LETTRES = ["A", "B", "C", "D", "E"];

export default function SondagePage() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [niveau, setNiveau] = useState("");
  const [classePensee, setClassePensee] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  // Génération automatique des classes selon le niveau (ex: 3A, 3B...)
  const optionsClasses = niveau
    ? LETTRES.map((l) => `${niveau} ${l}`)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !prenom || !niveau || !classePensee || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage("");
    setStatusType("");

    try {
      const res = await fetch("https://api.boutique-bisou.vth-mc.fr/sondage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          prenom,
          niveau: `${niveau}ème`,
          classe_pensee: classePensee,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusType("success");
        setStatusMessage(data.message || "Sondage envoyé avec succès !");
        setNom("");
        setPrenom("");
        setNiveau("");
        setClassePensee("");
      } else {
        setStatusType("error");
        setStatusMessage(data.detail || "Une erreur est survenue.");
      }
    } catch {
      setStatusType("error");
      setStatusMessage("Impossible de contacter le serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        
        {/* En-tête */}
        <div className="text-center">
          <span className="inline-block rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
            Sondage
          </span>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Dans quelle classe penses-tu être ?
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Remplis les informations ci-dessous pour enregistrer ton pronostic.
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          
          {/* Nom & Prénom */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400 mb-1.5">
                Nom
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                placeholder="Dupont"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400 mb-1.5">
                Prénom
              </label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
                placeholder="Alex"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Choix du Niveau */}
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400 mb-1.5">
              Niveau
            </label>
            <div className="grid grid-cols-4 gap-2">
              {NIVEAUX.map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => {
                    setNiveau(item.val);
                    setClassePensee(""); // Réinitialise la classe au changement de niveau
                  }}
                  className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                    niveau === item.val
                      ? "border-pink-500 bg-pink-500 text-white shadow-sm"
                      : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Choix de la Classe pensée (s'affiche une fois le niveau choisi) */}
          {niveau && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400 mb-1.5">
                Classe dans laquelle tu penses être
              </label>
              <select
                value={classePensee}
                onChange={(e) => setClassePensee(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">-- Sélectionne une classe --</option>
                {optionsClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Classe {cls}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bouton Envoi */}
          <button
            type="submit"
            disabled={isSubmitting || !niveau || !classePensee}
            className="mt-2 w-full rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "Envoi en cours..." : "Valider mon pronostic"}
          </button>
        </form>

        {/* Message de confirmation / erreur */}
        {statusMessage && (
          <p
            className={`mt-4 text-center text-xs font-semibold ${
              statusType === "success" ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {statusType === "success" ? "✨ " : "⚠️ "}
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
}
