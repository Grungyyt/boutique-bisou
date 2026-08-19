"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";
const LOGIN_URL = "/auth/login";

type ReservationAdmin = {
  id: string;
  user_nom: string;
  user_prenom: string;
  produit_nom: string;
  produit_type: string;
  code_6_chiffres: string;
  status: string;
  created_at: string;
};

export default function ManageReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationAdmin[]>([]);
  const [loading, setLoading] = useState(true);
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

        // Si on n'a pas l'utilisateur en local, on interroge l'API via les cookies
        if (!user) {
          const meRes = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
          if (meRes.ok) {
            const meData = await meRes.json();
            user = meData.user || meData;
            localStorage.setItem("user", JSON.stringify(user));
          }
        }

        // Si toujours aucun utilisateur connecté, redirection vers le login
        if (!user) {
          window.location.href = LOGIN_URL;
          return;
        }

        const userId = user.id || user.user_id;

        // Appel POST pour éviter l'erreur 405 (Method Not Allowed) sur la route admin
        const res = await fetch(`${API_URL}/admin/reservations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ user_id: userId }),
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

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Retour au tableau de bord
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Gestion des réservations
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Consultez et validez les réservations des clients
          </p>
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
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Article</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">Chargement...</td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">Aucune réservation.</td>
                </tr>
              ) : (
                reservations.map((r, index) => (
                  <tr key={r.id || index} className="text-zinc-700 dark:text-zinc-300">
                    <td className="px-4 py-3 font-medium">{r.user_nom || "Client"} {r.user_prenom || ""}</td>
                    <td className="px-4 py-3">{r.produit_nom || "Article"} ({r.produit_type || "-"})</td>
                    <td className="px-4 py-3 font-mono font-bold text-pink-600">{r.code_6_chiffres || "------"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        {r.status || "Actif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString("fr-FR") : "-"}
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
