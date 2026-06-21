"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGIN_URL = "/auth/login";

type Ticket = {
  id: string;
  type: string;
  valeur: number; // pour combien de vêtements compte 1 ticket de ce type
  quantite: number; // stock de tickets de ce type
  created_at: string;
};

const emptyCreateForm = {
  type: "",
  valeur: 1,
  quantite: 0,
};

export default function ManageTicketPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalStock, setTotalStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyCreateForm);

  // Pour ajouter du stock à un type existant (sans créer de doublon).
  const [ajoutQuantites, setAjoutQuantites] = useState<Record<string, number>>({});
  const [ajoutEnCours, setAjoutEnCours] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/tickets`, { credentials: "include" });

      if (res.status === 401) {
        window.location.href = LOGIN_URL;
        return;
      }

      if (!res.ok) {
        setError("Impossible de charger les tickets.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setTickets(data.tickets || []);
      setTotalStock(data.total_stock || 0);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type.trim(),
          valeur: form.valeur,
          quantite: form.quantite,
        }),
      });

      if (res.status === 401) {
        window.location.href = LOGIN_URL;
        return;
      }

      if (res.status === 409) {
        setError("Ce type de ticket existe déjà. Ajoute du stock directement sur la ligne correspondante.");
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.detail || "Impossible de créer ce type de ticket.");
        setSubmitting(false);
        return;
      }

      setForm(emptyCreateForm);
      await fetchTickets();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAjouterStock = async (id: string) => {
    const quantite = ajoutQuantites[id] || 0;
    if (quantite <= 0) return;

    setError(null);
    setAjoutEnCours(id);

    try {
      const res = await fetch(`${API_URL}/tickets/${id}/ajouter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantite }),
      });

      if (res.status === 401) {
        window.location.href = LOGIN_URL;
        return;
      }

      if (!res.ok) {
        setError("Impossible d'ajouter ces tickets au stock.");
        setAjoutEnCours(null);
        return;
      }

      const updated = await res.json();
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setTotalStock((prev) => prev + quantite);
      setAjoutQuantites((prev) => ({ ...prev, [id]: 0 }));
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setAjoutEnCours(null);
    }
  };

  const handleQuantiteChange = async (id: string, newQuantite: number) => {
    if (newQuantite < 0) return;

    const previous = tickets;
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, quantite: newQuantite } : t)));

    try {
      const res = await fetch(`${API_URL}/tickets/${id}/quantite`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantite: newQuantite }),
      });

      if (res.status === 401) {
        window.location.href = LOGIN_URL;
        return;
      }

      if (!res.ok) {
        setError("Impossible de mettre à jour la quantité.");
        setTickets(previous);
      }
    } catch {
      setError("Impossible de contacter le serveur.");
      setTickets(previous);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/tickets/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401) {
        window.location.href = LOGIN_URL;
        return;
      }

      if (!res.ok) {
        setError("Impossible de supprimer ce type de ticket.");
        return;
      }

      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Impossible de contacter le serveur.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        {/* Retour vers le dashboard */}
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Retour au tableau de bord
          </Link>
        </div>

        {/* Header avec total à droite */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Gestion des tickets
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Types de tickets, valeur en vêtements et stock
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-right shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Types de tickets</p>
              <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{tickets.length}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-right shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Tickets en stock</p>
              <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{totalStock} 🎟️</p>
            </div>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </p>
        )}

        {/* Formulaire de création d'un nouveau type de ticket */}
        <form
          onSubmit={handleAdd}
          className="mb-8 grid grid-cols-1 gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Nom du type
            </label>
            <input
              type="text"
              required
              placeholder="ex: Carnet 5 tickets"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Compte pour (vêtements)
            </label>
            <input
              type="number"
              min={1}
              required
              value={form.valeur}
              onChange={(e) => setForm({ ...form, valeur: Number(e.target.value) })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Quantité initiale
            </label>
            <input
              type="number"
              min={0}
              required
              value={form.quantite}
              onChange={(e) => setForm({ ...form, quantite: Number(e.target.value) })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Création..." : "Créer le type"}
            </button>
          </div>

          <p className="text-xs text-zinc-400 sm:col-span-2 lg:col-span-4">
            Un type ne peut être créé qu'une seule fois. Pour ajouter des tickets à un type déjà
            existant, utilise le champ "Ajouter au stock" sur sa ligne dans le tableau ci-dessous.
          </p>
        </form>

        {/* Liste des types de tickets */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Compte pour</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Ajouter au stock</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                    Chargement...
                  </td>
                </tr>
              )}

              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                    Aucun type de ticket pour le moment.
                  </td>
                </tr>
              )}

              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className={`text-zinc-700 dark:text-zinc-300 ${t.quantite === 0 ? "opacity-60" : ""}`}
                >
                  <td className="px-4 py-3 font-medium">{t.type}</td>
                  <td className="px-4 py-3">
                    {t.valeur} vêtement{t.valeur > 1 ? "s" : ""} 🎟️
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantiteChange(t.id, t.quantite - 1)}
                        disabled={t.quantite <= 0}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">{t.quantite}</span>
                      <button
                        onClick={() => handleQuantiteChange(t.id, t.quantite + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        +
                      </button>
                    </div>
                    {t.quantite === 0 && (
                      <span className="mt-1 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                        Rupture de stock
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={ajoutQuantites[t.id] || ""}
                        placeholder="0"
                        onChange={(e) =>
                          setAjoutQuantites((prev) => ({ ...prev, [t.id]: Number(e.target.value) }))
                        }
                        className="w-20 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      />
                      <button
                        onClick={() => handleAjouterStock(t.id)}
                        disabled={ajoutEnCours === t.id || !ajoutQuantites[t.id]}
                        className="rounded-lg border border-pink-300 px-3 py-1.5 text-xs font-medium text-pink-600 transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-pink-900 dark:text-pink-400 dark:hover:bg-pink-950/30"
                      >
                        {ajoutEnCours === t.id ? "..." : "Ajouter"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(t.id)}
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
