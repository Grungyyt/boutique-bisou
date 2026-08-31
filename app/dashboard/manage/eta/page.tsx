"use client";

import { useEffect, useState } from "react";

type OsaStatus = {
  status: string;
  message: string;
  timestamp: string;
};

const API_BASE = "https://api.boutique-bisou.vth-mc.fr";

const NIVEAUX = [
  {
    value: "operationnel",
    label: "Opérationnel",
    emoji: "🟢",
    dot: "bg-emerald-500",
    border: "#10b981",
    badge: "bg-emerald-500",
    defaultMessage: "Service opérationnel",
  },
  {
    value: "ralentissement_leger",
    label: "Ralentissement léger",
    emoji: "🟡",
    dot: "bg-yellow-300",
    border: "#fde047",
    badge: "bg-yellow-300 text-yellow-900",
    defaultMessage: "Le site répond un peu plus lentement que d'habitude",
  },
  {
    value: "degrade",
    label: "Légèrement dégradé",
    emoji: "🟠",
    dot: "bg-orange-500",
    border: "#f97316",
    badge: "bg-orange-500",
    defaultMessage: "Certaines fonctionnalités peuvent être instables",
  },
  {
    value: "extremement_degrade",
    label: "Extrêmement dégradé",
    emoji: "🔴",
    dot: "bg-red-600",
    border: "#dc2626",
    badge: "bg-red-600",
    defaultMessage: "Panne majeure en cours, intervention en cours",
  },
] as const;

function infoPourNiveau(value: string) {
  return NIVEAUX.find((n) => n.value === value) || NIVEAUX[0];
}

export default function OsaAdminPage() {
  const [status, setStatus] = useState<OsaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/osa-admin`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        setError("Vous devez être connecté en tant qu'administrateur pour voir cette page.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.detail || "Erreur lors de la récupération du statut.");
        return;
      }

      const data = await res.json();
      setStatus({
        status: data.status || "operationnel",
        message: data.message || "",
        timestamp: data.updated_at || data.created_at || new Date().toISOString(),
      });
      setMessage(data.message || "");
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleUpdate = async (niveau: string) => {
    setUpdating(true);
    setError(null);
    try {
      const info = infoPourNiveau(niveau);

      const res = await fetch(`${API_BASE}/osa-admin`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: niveau,
          message: message.trim() || info.defaultMessage,
        }),
      });

      if (res.status === 401) {
        setError("Vous devez être connecté en tant qu'administrateur pour faire cette action.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.detail || "Erreur lors de la mise à jour du statut.");
        return;
      }

      const data = await res.json();
      setStatus({
        status: data.status || niveau,
        message: data.message || "",
        timestamp: data.updated_at || new Date().toISOString(),
      });
      setMessage(data.message || "");
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de contacter le serveur.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  const infoActuel = status ? infoPourNiveau(status.status) : NIVEAUX[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            ⚙️ Gestion OSA
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Operating Système Alerte — contrôlez le niveau d'état du service
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Current Status Card */}
        <div
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6 border-l-4"
          style={{ borderColor: infoActuel.border }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              État actuel
            </h2>
            <span
              className={`px-4 py-2 rounded-full font-semibold text-white ${infoActuel.badge}`}
            >
              {infoActuel.emoji} {infoActuel.label.toUpperCase()}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Message</p>
              <p className="text-lg font-medium text-slate-900 dark:text-slate-50">
                {status?.message || "Aucun message"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Dernière mise à jour
              </p>
              <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                {status?.timestamp
                  ? new Date(status.timestamp).toLocaleString("fr-FR")
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Message personnalisé */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Message à afficher aux visiteurs
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex: Le site est actuellement plus lent que d'habitude"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
          />
        </div>

        {/* Sélecteur des 4 niveaux */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {NIVEAUX.map((n) => (
            <button
              key={n.value}
              onClick={() => handleUpdate(n.value)}
              disabled={updating}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl font-bold text-white transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${n.badge} hover:opacity-90`}
            >
              <span className="text-xl">{n.emoji}</span>
              <span className="text-left text-sm">{n.label}</span>
            </button>
          ))}
        </div>

        {/* Légende */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-8">
          <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
            ℹ️ Les 4 niveaux OSA
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>🟢 <strong>Opérationnel</strong> — tout fonctionne normalement</li>
            <li>🟡 <strong>Ralentissement léger</strong> — service un peu plus lent</li>
            <li>🟠 <strong>Légèrement dégradé</strong> — certaines fonctions instables</li>
            <li>🔴 <strong>Extrêmement dégradé</strong> — panne majeure en cours</li>
          </ul>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
            Ce statut s'affiche en bas de chaque page du site (pastille colorée dans le pied de page),
            et le niveau "Extrêmement dégradé" bloque l'accès au site via la page /eta-verif.
          </p>
        </div>
      </div>
    </div>
  );
}
