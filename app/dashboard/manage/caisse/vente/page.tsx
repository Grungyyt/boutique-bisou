"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";

const CLASSES = ["6ème", "5ème", "4ème", "3ème", "Externe"] as const;
type Classe = (typeof CLASSES)[number];
type Genre = "fille" | "garcon";

type LogVente = {
  id: string | number;
  produit_id: string | null;
  produit_nom: string | null;
  details: string | null;
  created_at?: string;
};

export default function VenteInfoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const venteId = searchParams.get("id");

  const [log, setLog] = useState<LogVente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [age, setAge] = useState("");
  const [genre, setGenre] = useState<Genre | null>(null);
  const [classe, setClasse] = useState<Classe | null>(null);

  // Récupère les infos de la vente (produit concerné) pour affichage
  useEffect(() => {
    if (!venteId) {
      setError("Aucun identifiant de vente fourni.");
      setLoading(false);
      return;
    }

    const fetchLog = async () => {
      try {
        const res = await fetch(`${API_URL}/logs/${venteId}`, {
          credentials: "include",
        });
        if (res.status === 401) {
          setError("Vous devez être connecté pour accéder à cette page.");
          return;
        }
        if (!res.ok) {
          setError("Impossible de retrouver cette vente.");
          return;
        }
        const data = await res.json();
        setLog(data);
      } catch {
        setError("Impossible de contacter le serveur.");
      } finally {
        setLoading(false);
      }
    };

    fetchLog();
  }, [venteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venteId || saving) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/logs/${venteId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: age ? Number(age) : null,
          genre,
          classe,
        }),
      });

      if (res.status === 401) {
        setError("Vous devez être connecté pour effectuer cette action.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.detail || "Erreur lors de l'enregistrement.");
        return;
      }

      setSaved(true);
      setTimeout(() => router.push("/manage/caisse"), 900);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSaving(false);
    }
  };

  let produitNom = log?.produit_nom || null;
  let prixTickets: number | null = null;
  if (log?.details) {
    try {
      const parsed = JSON.parse(log.details);
      if (parsed?.prix_tickets !== undefined) prixTickets = parsed.prix_tickets;
    } catch {
      // details non-JSON, on ignore
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto max-w-lg">
        <div className="mb-6">
          <a
            href="/manage/caisse"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Retour à la caisse
          </a>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Informations sur l'achat
          </h1>

          {loading ? (
            <p className="mt-4 text-sm text-zinc-400">Chargement...</p>
          ) : (
            <>
              {produitNom && (
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Article vendu :{" "}
                  <span className="font-medium text-pink-600 dark:text-pink-400">
                    {produitNom}
                  </span>
                  {prixTickets !== null && ` · ${prixTickets} 🎟️`}
                </p>
              )}

              {error && (
                <p className="mt-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                  {error}
                </p>
              )}

              {saved ? (
                <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  ✓ Enregistré ! Retour à la caisse...
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
                  {/* Âge */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Âge
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Âge de l'élève"
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  </div>

                  {/* Genre */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Genre
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGenre("fille")}
                        className={`rounded-lg border py-2.5 text-sm font-medium transition ${
                          genre === "fille"
                            ? "border-pink-500 bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400"
                            : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                        }`}
                      >
                        Fille
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenre("garcon")}
                        className={`rounded-lg border py-2.5 text-sm font-medium transition ${
                          genre === "garcon"
                            ? "border-pink-500 bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400"
                            : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                        }`}
                      >
                        Garçon
                      </button>
                    </div>
                  </div>

                  {/* Classe */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Classe
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {CLASSES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setClasse(c)}
                          className={`rounded-lg border py-2 text-xs font-medium transition ${
                            classe === c
                              ? "border-pink-500 bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400"
                              : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="mt-2 w-full rounded-lg bg-pink-600 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/manage/caisse")}
                    className="text-center text-xs text-zinc-400 underline hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    Passer cette étape
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
