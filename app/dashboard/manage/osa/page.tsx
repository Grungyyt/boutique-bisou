"use client";

import { useEffect, useState } from "react";

const API_BASE = "https://api.boutique-bisou.vth-mc.fr";

// ────────────────────────────────────────────────────────────────────────
// OSA — Operating Système Alerte (4 niveaux)
// ────────────────────────────────────────────────────────────────────────

type OsaStatus = {
  status: string;
  message: string;
  timestamp: string;
};

const NIVEAUX_OSA = [
  {
    value: "operationnel",
    label: "Opérationnel",
    emoji: "🟢",
    border: "#10b981",
    badge: "bg-emerald-500",
    defaultMessage: "Service opérationnel",
  },
  {
    value: "ralentissement_leger",
    label: "Ralentissement léger",
    emoji: "🟡",
    border: "#fde047",
    badge: "bg-yellow-300 text-yellow-900",
    defaultMessage: "Le site répond un peu plus lentement que d'habitude",
  },
  {
    value: "degrade",
    label: "Légèrement dégradé",
    emoji: "🟠",
    border: "#f97316",
    badge: "bg-orange-500",
    defaultMessage: "Certaines fonctionnalités peuvent être instables",
  },
  {
    value: "extremement_degrade",
    label: "Extrêmement dégradé",
    emoji: "🔴",
    border: "#dc2626",
    badge: "bg-red-600",
    defaultMessage: "Panne majeure en cours, intervention en cours",
  },
] as const;

function infoOsaPourNiveau(value: string) {
  return NIVEAUX_OSA.find((n) => n.value === value) || NIVEAUX_OSA[0];
}

// ────────────────────────────────────────────────────────────────────────
// ETA — Ancien système (booléen maintenance ON/OFF)
// ────────────────────────────────────────────────────────────────────────

type EtaStatus = {
  operational: boolean;
  message: string;
  timestamp: string;
};

export default function StatusAdminPage() {
  // --- État OSA ---
  const [osaStatus, setOsaStatus] = useState<OsaStatus | null>(null);
  const [osaLoading, setOsaLoading] = useState(true);
  const [osaUpdating, setOsaUpdating] = useState(false);
  const [osaMessage, setOsaMessage] = useState("");
  const [osaError, setOsaError] = useState<string | null>(null);

  // --- État ETA ---
  const [etaStatus, setEtaStatus] = useState<EtaStatus | null>(null);
  const [etaLoading, setEtaLoading] = useState(true);
  const [etaUpdating, setEtaUpdating] = useState(false);
  const [etaMessage, setEtaMessage] = useState("");
  const [etaError, setEtaError] = useState<string | null>(null);

  // ─── Chargement initial ───────────────────────────────────────────────
  const fetchOsa = async () => {
    setOsaError(null);
    try {
      const res = await fetch(`${API_BASE}/osa-admin`, { credentials: "include" });
      if (res.status === 401) {
        setOsaError("Vous devez être connecté en tant qu'administrateur.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setOsaError(data?.detail || "Erreur lors de la récupération du statut OSA.");
        return;
      }
      const data = await res.json();
      setOsaStatus({
        status: data.status || "operationnel",
        message: data.message || "",
        timestamp: data.updated_at || data.created_at || new Date().toISOString(),
      });
      setOsaMessage(data.message || "");
    } catch {
      setOsaError("Impossible de contacter le serveur.");
    } finally {
      setOsaLoading(false);
    }
  };

  const fetchEta = async () => {
    setEtaError(null);
    try {
      const res = await fetch(`${API_BASE}/eta-admin`, { credentials: "include" });
      if (res.status === 401) {
        setEtaError("Vous devez être connecté en tant qu'administrateur.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setEtaError(data?.detail || "Erreur lors de la récupération du statut ETA.");
        return;
      }
      const data = await res.json();
      setEtaStatus({
        operational: data.operational,
        message: data.message || "",
        timestamp: data.updated_at || data.created_at || new Date().toISOString(),
      });
      setEtaMessage(data.message || "");
    } catch {
      setEtaError("Impossible de contacter le serveur.");
    } finally {
      setEtaLoading(false);
    }
  };

  useEffect(() => {
    fetchOsa();
    fetchEta();
  }, []);

  // ─── Actions ──────────────────────────────────────────────────────────
  const handleUpdateOsa = async (niveau: string) => {
    setOsaUpdating(true);
    setOsaError(null);
    try {
      const info = infoOsaPourNiveau(niveau);
      const res = await fetch(`${API_BASE}/osa-admin`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: niveau,
          message: osaMessage.trim() || info.defaultMessage,
        }),
      });
      if (res.status === 401) {
        setOsaError("Vous devez être connecté en tant qu'administrateur.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setOsaError(data?.detail || "Erreur lors de la mise à jour du statut OSA.");
        return;
      }
      const data = await res.json();
      setOsaStatus({
        status: data.status || niveau,
        message: data.message || "",
        timestamp: data.updated_at || new Date().toISOString(),
      });
      setOsaMessage(data.message || "");
    } catch {
      setOsaError("Impossible de contacter le serveur.");
    } finally {
      setOsaUpdating(false);
    }
  };

  const handleUpdateEta = async (operational: boolean) => {
    setEtaUpdating(true);
    setEtaError(null);
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
          message: etaMessage.trim() || defaultMessage,
        }),
      });
      if (res.status === 401) {
        setEtaError("Vous devez être connecté en tant qu'administrateur.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setEtaError(data?.detail || "Erreur lors de la mise à jour du statut ETA.");
        return;
      }
      const data = await res.json();
      setEtaStatus({
        operational: data.operational,
        message: data.message || "",
        timestamp: data.updated_at || new Date().toISOString(),
      });
      setEtaMessage(data.message || "");
    } catch {
      setEtaError("Impossible de contacter le serveur.");
    } finally {
      setEtaUpdating(false);
    }
  };

  const osaLoadingGlobal = osaLoading || etaLoading;

  if (osaLoadingGlobal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  const infoOsaActuel = osaStatus ? infoOsaPourNiveau(osaStatus.status) : NIVEAUX_OSA[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            ⚙️ Gestion du statut du service
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Deux systèmes à contrôler depuis cette page : OSA (4 niveaux) et ETA (ancien système, ON/OFF).
          </p>
        </div>

        {/* ═══════════════ SECTION OSA ═══════════════ */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            🟢🟡🟠🔴 OSA — Operating Système Alerte
          </h2>

          {osaError && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 dark:text-red-200">{osaError}</p>
            </div>
          )}

          <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-4 border-l-4"
            style={{ borderColor: infoOsaActuel.border }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                État actuel
              </h3>
              <span className={`px-4 py-2 rounded-full font-semibold text-white ${infoOsaActuel.badge}`}>
                {infoOsaActuel.emoji} {infoOsaActuel.label.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Message</p>
            <p className="text-base font-medium text-slate-900 dark:text-slate-50 mb-2">
              {osaStatus?.message || "Aucun message"}
            </p>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {osaStatus?.timestamp
                ? new Date(osaStatus.timestamp).toLocaleString("fr-FR")
                : "-"}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Message à afficher (OSA)
            </label>
            <input
              type="text"
              value={osaMessage}
              onChange={(e) => setOsaMessage(e.target.value)}
              placeholder="Ex: Le site est un peu plus lent que d'habitude"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NIVEAUX_OSA.map((n) => (
              <button
                key={n.value}
                onClick={() => handleUpdateOsa(n.value)}
                disabled={osaUpdating}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl font-bold text-white transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${n.badge} hover:opacity-90`}
              >
                <span className="text-xl">{n.emoji}</span>
                <span className="text-left text-sm">{n.label}</span>
              </button>
            ))}
          </div>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* ═══════════════ SECTION ETA ═══════════════ */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            🛠️ ETA — Ancien système (maintenance ON/OFF)
          </h2>

          {etaError && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 dark:text-red-200">{etaError}</p>
            </div>
          )}

          <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-4 border-l-4"
            style={{ borderColor: etaStatus?.operational ? "#10b981" : "#ef4444" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                État actuel
              </h3>
              <span
                className={`px-4 py-2 rounded-full font-semibold text-white ${
                  etaStatus?.operational ? "bg-emerald-500" : "bg-red-500"
                }`}
              >
                {etaStatus?.operational ? "✓ OPÉRATIONNEL" : "⚠️ MAINTENANCE"}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Message</p>
            <p className="text-base font-medium text-slate-900 dark:text-slate-50 mb-2">
              {etaStatus?.message || "Aucun message"}
            </p>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {etaStatus?.timestamp
                ? new Date(etaStatus.timestamp).toLocaleString("fr-FR")
                : "-"}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Message à afficher (ETA)
            </label>
            <input
              type="text"
              value={etaMessage}
              onChange={(e) => setEtaMessage(e.target.value)}
              placeholder="Ex: Maintenance préventive en cours - Environ 2 heures"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleUpdateEta(false)}
              disabled={etaUpdating}
              className="px-5 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition active:scale-95"
            >
              🔧 Passer en MAINTENANCE
            </button>
            <button
              onClick={() => handleUpdateEta(true)}
              disabled={etaUpdating}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition active:scale-95"
            >
              ✓ Passer en OPÉRATIONNEL
            </button>
          </div>
        </section>

        {/* Légende globale */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
            ℹ️ Comment ça s'articule
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>Le badge en bas du site (pied de page) affiche le statut <strong>OSA</strong>.</li>
            <li>
              La page <code>/eta-verif</code> bloque tout le site si <strong>OSA = 🔴 extrêmement dégradé</strong>{" "}
              OU si <strong>ETA = maintenance</strong>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
