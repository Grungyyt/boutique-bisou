"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGIN_URL = "/auth/login";

const STARTUP_VIDEOS = [
  "https://storage.vth-mc.fr/vid/web/bisou-startup.mp4",
  "https://storage.vth-mc.fr/vid/vth-startup.mp4",
];

type Stats = {
  totalProduits: number;
  totalTickets: number;
};

const MODULES = [
  {
    title: "Gestion des vêtements",
    description: "Ajouter, consulter et supprimer les vêtements du stock",
    href: "/dashboard/manage/produit",
    emoji: "👕",
  },
  {
    title: "Gestion des tickets",
    description: "Créer des types de tickets et gérer leur stock",
    href: "/dashboard/manage/ticket",
    emoji: "🎟️",
  },
  {
    title: "Caisse",
    description: "Encaisser un vêtement et retirer 1 du stock en un clic",
    href: "/dashboard/manage/caisse",
    emoji: "🛒",
  },
  {
    title: "Tracker",
    description: "Historique complet des ventes, ajouts et toutes les actions",
    href: "/dashboard/manage/tracker",
    emoji: "📊",
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Intro state
  const [showIntro, setShowIntro] = useState(false);
  const [waitingClick, setWaitingClick] = useState(false); // splash "cliquez pour lancer"
  const [videoIndex, setVideoIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const played = sessionStorage.getItem("bisou-intro-played");
    if (!played) {
      setShowIntro(true);
      setWaitingClick(true);
    }
  }, []);

  // Lance la vidéo après le clic utilisateur (nécessaire pour le son)
  const handleStartClick = () => {
    setWaitingClick(false);
    // Le rendu de la vidéo va se faire, on joue dans le prochain tick
    setTimeout(() => {
      videoRef.current?.play().catch(() => dismiss());
    }, 50);
  };

  // Quand une vidéo se termine, passer à la suivante ou fermer
  const handleVideoEnd = () => {
    if (videoIndex < STARTUP_VIDEOS.length - 1) {
      setVideoIndex((i) => i + 1);
    } else {
      dismiss();
    }
  };

  // Joue la vidéo suivante dès que l'index change (et qu'on n'est plus en splash)
  useEffect(() => {
    if (!waitingClick && showIntro && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => dismiss());
    }
  }, [videoIndex]);

  const dismiss = () => {
    setFadingOut(true);
    setTimeout(() => {
      setShowIntro(false);
      sessionStorage.setItem("bisou-intro-played", "1");
    }, 600);
  };

  // Stats fetch
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/produits`, { credentials: "include" });
        if (res.status === 401) { window.location.href = LOGIN_URL; return; }
        if (!res.ok) { setError("Impossible de charger les statistiques."); setLoading(false); return; }
        const data = await res.json();
        setStats({
          totalProduits: data.total ?? (data.produits?.length || 0),
          totalTickets: data.total_tickets || 0,
        });
      } catch {
        setError("Impossible de contacter le serveur.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      {/* ── Intro plein écran ── */}
      {showIntro && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.6s ease",
            opacity: fadingOut ? 0 : 1,
          }}
        >
          {/* Splash "clic pour lancer" — affiché avant la première interaction */}
          {waitingClick ? (
            <button
              onClick={handleStartClick}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              {/* Icône play */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  backdropFilter: "blur(4px)",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                ▶
              </div>
              <span style={{ fontSize: 15, opacity: 0.7, letterSpacing: "0.05em" }}>
                Cliquez pour lancer
              </span>
            </button>
          ) : (
            <>
              <video
                ref={videoRef}
                key={videoIndex}
                onEnded={handleVideoEnd}
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              >
                <source src={STARTUP_VIDEOS[videoIndex]} type="video/mp4" />
              </video>

              {/* Points de progression */}
              <div
                style={{
                  position: "absolute",
                  bottom: 24,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 8,
                }}
              >
                {STARTUP_VIDEOS.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: i === videoIndex ? "#fff" : "rgba(255,255,255,0.3)",
                      transition: "background-color 0.3s",
                    }}
                  />
                ))}
              </div>

              {/* Bouton passer */}
              <button
                onClick={dismiss}
                style={{
                  position: "absolute",
                  top: 20,
                  right: 24,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: "pointer",
                  backdropFilter: "blur(6px)",
                }}
              >
                Passer →
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Dashboard ── */}
      <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
        <div className="mx-auto max-w-5xl">

          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              ← Retour à l'accueil
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Tableau de bord
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Vue d'ensemble de la boutique
            </p>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              {error}
            </p>
          )}

          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total vêtements</p>
              <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                {loading ? "…" : stats?.totalProduits ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Valeur totale</p>
              <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                {loading ? "…" : stats?.totalTickets ?? 0} 🎟️
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Gestion
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map((mod) => (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-pink-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-pink-900"
                >
                  <div className="mb-3 text-2xl">{mod.emoji}</div>
                  <h3 className="text-base font-semibold text-zinc-900 transition group-hover:text-pink-600 dark:text-zinc-50 dark:group-hover:text-pink-400">
                    {mod.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {mod.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
