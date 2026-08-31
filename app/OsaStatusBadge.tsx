"use client";

import { useEffect, useState } from "react";

const API_BASE = "https://api.boutique-bisou.vth-mc.fr";
const RAFRAICHISSEMENT_MS = 30000; // ré-interroge le statut toutes les 30 secondes

type OsaData = {
  status: string;
  label: string;
  message: string | null;
};

const NIVEAUX: Record<
  string,
  { dot: string; ring: string; label: string; text: string }
> = {
  operationnel: {
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/40",
    label: "Opérationnel",
    text: "text-emerald-400",
  },
  ralentissement_leger: {
    dot: "bg-yellow-300",
    ring: "ring-yellow-300/40",
    label: "Ralentissement léger",
    text: "text-yellow-300",
  },
  degrade: {
    dot: "bg-orange-500",
    ring: "ring-orange-500/40",
    label: "Légèrement dégradé",
    text: "text-orange-400",
  },
  extremement_degrade: {
    dot: "bg-red-600",
    ring: "ring-red-600/40",
    label: "Extrêmement dégradé",
    text: "text-red-500",
  },
};

export default function OsaStatusBadge() {
  const [data, setData] = useState<OsaData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/osa`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted) {
          setData({
            status: json.status || "operationnel",
            label: json.label || "Opérationnel",
            message: json.message || null,
          });
        }
      } catch {
        // silencieux : si le statut est injoignable, on n'affiche simplement rien
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, RAFRAICHISSEMENT_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!data) return null;

  const info = NIVEAUX[data.status] || NIVEAUX.operationnel;

  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-1.5">
        <span className={`relative flex h-2.5 w-2.5`}>
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${info.dot} opacity-60`}
          />
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${info.dot}`} />
        </span>
        <span className={`text-xs font-medium ${info.text}`}>{info.label}</span>
      </div>
      {data.message && (
        <p className="max-w-md text-center text-[11px] text-neutral-400">
          {data.message}
        </p>
      )}
    </div>
  );
}
