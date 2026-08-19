"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://api.boutique-bisou.vth-mc.fr";

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

export default function DashboardPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(rawUser);

    // Vérification stricte du statut administrateur
    if (!user.is_admin) {
      alert("Accès refusé : Ce compte n'a pas les privilèges administrateur.");
      router.push("/boutique");
      return;
    }

    // Charger les réservations pour les admins
    fetch(`${API_URL}/admin/reservations?user_id=${user.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur d'accès aux réservations admin");
        return res.json();
      })
      .then((data) => setReservations(data.reservations || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="p-8 text-center">Vérification des droits...</div>;
  if (error) return <div className="p-8 text-center text-rose-500">{error}</div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">
          Tableau de bord Admin - Réservations
        </h1>

        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="p-4">Client (Nom / Prénom)</th>
                <th className="p-4">Article</th>
                <th className="p-4">Code 6 chiffres</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td className="p-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    {r.user_nom} {r.user_prenom}
                  </td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-300">
                    {r.produit_nom} ({r.produit_type})
                  </td>
                  <td className="p-4 font-mono font-bold text-pink-600">
                    {r.code_6_chiffres}
                  </td>
                  <td className="p-4">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-zinc-400">
                    {new Date(r.created_at).toLocaleString("fr-FR")}
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
