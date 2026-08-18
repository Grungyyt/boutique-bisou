"use client";

import { useEffect, useState } from "react";

const CATEGORIES_DISPONIBLES = [
  "Femme",
  "Homme",
  "Enfant & Ado",
  "Accessoires & Sacs",
  "Chaussures",
];

export default function EmailChosePage() {
  const [token, setToken] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [justConfirmed, setJustConfirmed] = useState<boolean>(false);

  const [notifNouveautes, setNotifNouveautes] = useState<boolean>(true);
  const [notifEvenements, setNotifEvenements] = useState<boolean>(true);
  const [notifReassort, setNotifReassort] = useState<boolean>(false);
  const [frequence, setFrequence] = useState<string>("immediat");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Femme",
    "Homme",
    "Enfant & Ado",
    "Accessoires & Sacs",
  ]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token") || "";
    const emailParam = params.get("email") || "";
    const confirmedParam = params.get("confirmed") === "true";

    setToken(tokenParam);
    if (emailParam) setUserEmail(emailParam);
    if (confirmedParam) setJustConfirmed(true);

    if (tokenParam) {
      fetch(
        `https://api.boutique-bisou.vth-mc.fr/newsletter/preferences?token=${encodeURIComponent(
          tokenParam
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.email) setUserEmail(data.email);
          if (data.preferences) {
            setNotifNouveautes(
              data.preferences.notif_nouveautes ?? true
            );
            setNotifEvenements(
              data.preferences.notif_evenements ?? true
            );
            setNotifReassort(data.preferences.notif_reassort ?? false);
            if (data.preferences.frequence)
              setFrequence(data.preferences.frequence);
            if (data.preferences.categories)
              setSelectedCategories(data.preferences.categories);
          }
        })
        .catch(() => {
          // Gestion discrète en cas d'erreur de chargement initial
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatusType("error");
      setStatusMessage("Jeton de vérification introuvable.");
      return;
    }

    setIsSaving(true);
    setStatusMessage("");

    try {
      const response = await fetch(
        "https://api.boutique-bisou.vth-mc.fr/newsletter/preferences",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            notif_nouveautes: notifNouveautes,
            notif_evenements: notifEvenements,
            notif_reassort: notifReassort,
            frequence,
            categories: selectedCategories,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatusType("success");
        setStatusMessage(
          data.message || "Vos préférences ont bien été enregistrées ! ✨"
        );
      } else {
        setStatusType("error");
        setStatusMessage(data.detail || "Une erreur est survenue.");
      }
    } catch {
      setStatusType("error");
      setStatusMessage("Impossible de joindre le serveur.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6">
      {}
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-pink-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-xl backdrop-blur-sm">
        {/* En-tête */}
        <div className="text-center mb-8">
          <img
            src="https://storage.vth-mc.fr/pierred-dubois/img/web/logo-bisou.png"
            alt="Logo Boutique Bisou"
            className="h-20 w-auto mx-auto mb-4 object-contain"
          />

          {justConfirmed && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 animate-fade-in">
              <span>✨</span>
              <span>Adresse e-mail vérifiée avec succès !</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Choix de vos notifications 💌
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Personnalisez les alertes que vous souhaitez recevoir de la Boutique Bisou.
          </p>

          {userEmail && (
            <div className="mt-3 inline-block rounded-xl bg-pink-50 dark:bg-pink-950/40 px-3.5 py-1 text-xs font-medium text-pink-600 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800/50">
              {userEmail}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-zinc-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent align-[-0.125em]" />
            <p className="mt-4 text-xs font-medium">Chargement de vos options...</p>
          </div>
        ) : (
          <form onSubmit={handleSavePreferences} className="space-y-8">
            {}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-4">
                1. Types de contenus souhaités
              </h2>

              <div className="space-y-3">
                {/* Switch Nouveaux vêtements */}
                <label className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 cursor-pointer hover:border-pink-300 dark:hover:border-pink-700 transition">
                  <div className="pr-4">
                    <span className="font-semibold text-sm block text-zinc-800 dark:text-zinc-100">
                      👗 Nouveaux vêtements au catalogue
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Alerte immédiate dès qu'un nouvel article est pris en photo et mis en ligne.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifNouveautes}
                    onChange={(e) => setNotifNouveautes(e.target.checked)}
                    className="h-5 w-5 rounded border-zinc-300 text-pink-600 focus:ring-pink-500 cursor-pointer accent-pink-500"
                  />
                </label>

                {/* Switch Événements */}
                <label className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 cursor-pointer hover:border-pink-300 dark:hover:border-pink-700 transition">
                  <div className="pr-4">
                    <span className="font-semibold text-sm block text-zinc-800 dark:text-zinc-100">
                      🎉 Événements & Ouvertures spéciales
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Annonces des journées portes ouvertes, friperies et rencontres médias.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifEvenements}
                    onChange={(e) => setNotifEvenements(e.target.checked)}
                    className="h-5 w-5 rounded border-zinc-300 text-pink-600 focus:ring-pink-500 cursor-pointer accent-pink-500"
                  />
                </label>

                {/* Switch Réassort */}
                <label className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 cursor-pointer hover:border-pink-300 dark:hover:border-pink-700 transition">
                  <div className="pr-4">
                    <span className="font-semibold text-sm block text-zinc-800 dark:text-zinc-100">
                      🔄 Réassorts & Arrivages
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Soyez notifié(e) des ajouts de stock ou retours en rayon.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifReassort}
                    onChange={(e) => setNotifReassort(e.target.checked)}
                    className="h-5 w-5 rounded border-zinc-300 text-pink-600 focus:ring-pink-500 cursor-pointer accent-pink-500"
                  />
                </label>
              </div>
            </div>

            {}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-4">
                2. Fréquence des e-mails
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "immediat",
                    label: "⚡ En temps réel",
                    desc: "À chaque nouvel ajout",
                  },
                  {
                    id: "hebdo",
                    label: "📅 Hebdomadaire",
                    desc: "Un condensé chaque vendredi",
                  },
                  {
                    id: "mensuel",
                    label: "🗓️ Mensuel",
                    desc: "Un récap le 1er du mois",
                  },
                ].map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => setFrequence(option.id)}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                      frequence === option.id
                        ? "border-pink-500 bg-pink-50/50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:border-pink-300"
                    }`}
                  >
                    <span className="font-semibold text-sm">{option.label}</span>
                    <span className="text-xs opacity-80 mt-1">{option.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-4">
                3. Catégories d'intérêt
              </h2>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES_DISPONIBLES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                        isSelected
                          ? "bg-pink-500 text-white shadow-md"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "} {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 py-3.5 text-sm font-bold text-white shadow-lg transition hover:opacity-95 active:scale-98 disabled:opacity-50"
              >
                {isSaving ? "Enregistrement..." : "Enregistrer mes choix ✨"}
              </button>

              {statusMessage && (
                <div
                  className={`mt-4 p-3 rounded-xl text-xs font-semibold text-center ${
                    statusType === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              <div className="mt-6 text-center">
                <a
                  href="/boutique"
                  className="inline-block text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-pink-600 dark:hover:text-pink-400 transition"
                >
                  ← Découvrir les vêtements en boutique
                </a>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
