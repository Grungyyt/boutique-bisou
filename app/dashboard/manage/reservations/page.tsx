"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGIN_URL = "/auth/login";

type ReservationAdmin = {
  id: string;
  produit_id: string;
  code_6_chiffres: string;
  produit_nom: string;
  produit_type: string;
  produit_taille: string;
  produit_couleur: string;
  produit_photo?: string | null;
  prix_tickets: number;
  status: string;
  user_id?: string | null;
  user_nom?: string | null;
  user_prenom?: string | null;
  created_at: string;
};

export default function ManageReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationAdmin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);

      try {
        let user = null;
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          try {
            user = JSON.parse(rawUser);
          } catch (e) {
            console.error("Erreur parsing user localStorage");
          }
        }

        if (!user) {
          const meRes = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
          if (meRes.ok) {
            const meData = await meRes.json();
            user = meData.user || meData;
            localStorage.setItem("user", JSON.stringify(user));
          }
        }

        if (!user) {
          window.location.href = LOGIN_URL;
          return;
        }

        const userId = user.id || user.user_id;

        const res = await fetch(`${API_URL}/reservations${userId ? `?user_id=${userId}` : ""}`, {
          credentials: "include",
        });

        if (res.status === 401 || res.status === 403) {
          window.location.href = LOGIN_URL;
          return;
        }

        if (!res.ok) {
          throw new Error("Impossible de charger les réservations.");
        }

        const data = await res.json();
        setReservations(data.reservations || data || []);
      } catch (err: any) {
        setError(err.message || "Impossible de contacter le serveur.");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // Fonction pour marquer comme vendue / validée
  const handleMarkAsSold = async (reservationId: string) => {
    if (!confirm("Voulez-vous vraiment marquer cette réservation comme vendue ?")) return;

    setActionLoadingId(reservationId);
    try {
      // Ajustez l'endpoint selon votre API (ex: PUT ou POST sur /reservations/{id}/vendre ou /reservations/{id})
      const res = await fetch(`${API_URL}/reservations/${reservationId}`, {
        method: "PUT", // Ou "POST" selon votre backend
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "vendu" }), // ou "validé"
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour de la réservation.");
      }

      // Mise à jour de la liste locale pour enlever ou modifier le statut instantanément
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: "vendu" } : r))
      );
    } catch (err: any) {
      alert(err.message || "Impossible d'effectuer l'action.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtrage par recherche
  const filteredReservations = reservations.filter((r) => {
    const query = searchQuery.toLowerCase();
    const code = (r.code_6_chiffres || "").toLowerCase();
    const nomClient = (r.user_nom || "").toLowerCase();
    const prenomClient = (r.user_prenom || "").toLowerCase();
    const nomProduit = (r.produit_nom || "").toLowerCase();

    return (
      code.includes(query) ||
      nomClient.includes(query) ||
      prenomClient.includes(query) ||
      nomProduit.includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Retour au tableau de bord
          </Link>
        </div>

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Gestion des réservations
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Consultez et validez les réservations des clients
            </p>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Rechercher par code (ex: 120020)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Article</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">Chargement...</td>
                </tr>
              ) : filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">Aucune réservation trouvée.</td>
                </tr>
              ) : (
                filteredReservations.map((r, index) => (
                  <tr key={r.id || index} className="text-zinc-700 dark:text-zinc-300">
                    <td className="px-4 py-3">
                      {r.produit_photo ? (
                        <img
                          src={r.produit_photo}
                          alt={r.produit_nom || "Produit"}
                          className="h-16 w-16 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {r.user_nom || r.user_prenom ? `${r.user_nom || ""} ${r.user_prenom || ""}` : <span className="text-zinc-400 italic">Non assigné</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{r.produit_nom || "Article"}</div>
                      <div className="text-xs text-zinc-500">{r.produit_type || "-"} {r.produit_taille ? `• ${r.produit_taille}` : ""}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-base font-bold text-pink-600">
                      {r.code_6_chiffres || "------"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        r.status === "vendu" 
                          ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      }`}>
                        {r.status || "Actif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status !== "vendu" ? (
                        <button
                          onClick={() => handleMarkAsSold(r.id)}
                          disabled={actionLoadingId === r.id}
                          className="rounded-xl bg-pink-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-pink-700 disabled:opacity-50"
                        >
                          {actionLoadingId === r.id ? "Validation..." : "Marquer comme vendue"}
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-400 italic">Déjà vendu</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
