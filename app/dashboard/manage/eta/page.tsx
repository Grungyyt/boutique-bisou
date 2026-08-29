"use client";

import { useState, useEffect } from "react";

type EtaStatus = {
  operational: boolean;
  message: string;
  timestamp: string;
};

// Domaine du backend FastAPI (pas de préfixe /api ici : on tape directement l'API)
const API_BASE = "https://api.boutique-bisou.vth-mc.fr";

export default function EtaAdminPage() {
  const [status, setStatus] = useState<EtaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Récupère l'état actuel depuis le serveur
  const fetchStatus = async () => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/eta-admin`, {
        method: "GET",
        credentials: "include", // envoie le cookie de session admin (bisou_token)
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
        operational: data.operational,
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

  const handleUpdate = async (operational: boolean) => {
    setUpdating(true);
    setError(null);
    try {
      const defaultMessage = operational
        ? "Service opérationnel"
        : "Maintenance préventive en cours";

      const res = await fetch(`${API_BASE}/eta-admin`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operational,
          message: message.trim() || defaultMessage,
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
        operational: data.operational,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            ⚙️ Gestion ETA
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Contrôlez l'état opérationnel du service
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
          style={{
            borderColor: status?.operational ? "#10b981" : "#ef4444",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              État actuel
            </h2>
            <span
              className={`px-4 py-2 rounded-full font-semibold text-white ${
                status?.operational ? "bg-emerald-500" : "bg-red-500"
              }`}
            >
              {status?.operational ? "✓ OPÉRATIONNEL" : "⚠️ MAINTENANCE"}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Message
              </p>
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
            placeholder="Ex: Maintenance préventive en cours - Environ 2 heures"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bouton Maintenance */}
          <button
            onClick={() => handleUpdate(false)}
            disabled={updating}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition active:scale-95"
          >
            🔧 Passer en MAINTENANCE
          </button>

          {/* Bouton Opérationnel */}
          <button
            onClick={() => handleUpdate(true)}
            disabled={updating}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition active:scale-95"
          >
            ✓ Passer en OPÉRATIONNEL
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-8">
          <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
            ℹ️ Comment ça fonctionne
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>
              Les utilisateurs accédant au site verront la page{" "}
              <code>/eta-verif</code>
            </li>
            <li>
              Si ETA = <strong>true</strong> : redirection vers l'accueil, service normal
            </li>
            <li>
              Si ETA = <strong>false</strong> : blocage sur page maintenance
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
