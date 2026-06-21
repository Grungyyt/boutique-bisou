"use client";

import { useEffect, useState } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGIN_URL = "/auth/login";

type Produit = {
  id: string;
  nom: string;
  couleur: string;
  type: string;
  genre: string;
  taille: string;
  prix_tickets: number;
  created_at: string;
};

const TYPES = ["Tee-Shirt", "Pantalon", "Robe", "Pull", "Veste / Manteau", "Short", "Jupe", "Pyjama", "Chaussures", "Autre"];
const GENRES = ["Fille", "Garçon", "Mixte"];
const TAILLES = [
  "0-3 mois",
  "3-6 mois",
  "6-12 mois",
  "1 an",
  "2 ans",
  "3 ans",
  "4 ans",
  "5 ans",
  "6 ans",
  "8 ans",
  "10 ans",
  "12 ans",
  "14 ans",
  "16 ans",
  "Adulte",
];

const emptyForm = {
  nom: "",
  couleur: "",
  type: TYPES[0],
  genre: GENRES[2],
  taille: TAILLES[0],
  prix_tickets: 1,
};

export default function ManageProduitPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchProduits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/produits`, { credentials: "include" });

      if (res.status === 401) {
        window.location.href = LOGIN_URL;
        return;
      }

      if (!res.ok) {
        setError("Impossible de charger les produits.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setProduits(data.produits || []);
      setTotalTickets(data.total_tickets || 0);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/produits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        window.location.href = LOGIN_URL;
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.detail || "Impossible d'ajouter le produit.");
        setSubmitting(false);
        return;
      }

      setForm(emptyForm);
      await fetchProduits();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/produits/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401) {
        window.location.href = LOGIN_URL;
        return;
      }

      if (!res.ok) {
        setError("Impossible de supprimer ce produit.");
        return;
      }

      setProduits((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Impossible de contacter le serveur.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        {/* Header avec total à droite */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Gestion des vêtements
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Entrée / sortie du stock de vêtements
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-right shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Total vêtements</p>
              <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{produits.length}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-right shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Valeur totale</p>
              <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{totalTickets} 🎟️</p>
            </div>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </p>
        )}

        {/* Formulaire d'ajout (entrée) */}
        <form
          onSubmit={handleAdd}
          className="mb-8 grid grid-cols-1 gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">Nom</label>
            <input
              type="text"
              required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">Couleur</label>
            <input
              type="text"
              required
              value={form.couleur}
              onChange={(e) => setForm({ ...form, couleur: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">Genre</label>
            <select
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">Taille</label>
            <select
              value={form.taille}
              onChange={(e) => setForm({ ...form, taille: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              {TAILLES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">Prix (tickets)</label>
            <input
              type="number"
              min={0}
              required
              value={form.prix_tickets}
              onChange={(e) => setForm({ ...form, prix_tickets: Number(e.target.value) })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Ajout..." : "Ajouter le vêtement"}
            </button>
          </div>
        </form>

        {/* Liste des produits (sortie possible via suppression) */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Couleur</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Genre</th>
                <th className="px-4 py-3">Taille</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-zinc-400">
                    Chargement...
                  </td>
                </tr>
              )}

              {!loading && produits.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-zinc-400">
                    Aucun vêtement pour le moment.
                  </td>
                </tr>
              )}

              {produits.map((p) => (
                <tr key={p.id} className="text-zinc-700 dark:text-zinc-300">
                  <td className="px-4 py-3 font-medium">{p.nom}</td>
                  <td className="px-4 py-3">{p.couleur}</td>
                  <td className="px-4 py-3">{p.type}</td>
                  <td className="px-4 py-3">{p.genre}</td>
                  <td className="px-4 py-3">{p.taille}</td>
                  <td className="px-4 py-3">{p.prix_tickets} 🎟️</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs font-medium text-rose-500 hover:text-rose-600"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
