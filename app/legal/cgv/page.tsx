import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — Boutique Bisou",
  description: "Conditions Générales de Vente de la Boutique Bisou.",
};

export default function CGVPage() {
  return (
    <div className="relative mx-auto max-w-3xl px-4 py-12 md:py-20">
      <Link
        href="/legal"
        className="inline-flex items-center text-xs font-medium text-pink-500 hover:text-pink-600 transition-colors mb-8"
      >
        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour aux informations légales
      </Link>

      <div className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-pink-500">
          Réglementation
        </span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
          Conditions Générales de Vente
        </h1>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Dernière mise à jour : Septembre 2026
        </p>
      </div>

      <div className="space-y-8 rounded-2xl border border-zinc-200/80 bg-white/80 p-6 md:p-10 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        
        {/* Objet */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            1. Objet et champ d'application
          </h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les modalités de mise à disposition des produits présentés sur le site <strong>Boutique Bisou</strong>.
          </p>
        </section>

        <hr className="border-zinc-200/80 dark:border-zinc-800/80" />

        {/* Absence de transactions monétaires */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            2. Absence de transaction en argent réel
          </h2>
          <p>
            Aucune vente ne donne lieu à un paiement en monnaie réelle (Euros ou toute autre devise). La plateforme ne traite aucune transaction bancaire ou monétaire en ligne.
          </p>
        </section>

        <hr className="border-zinc-200/80 dark:border-zinc-800/80" />

        {/* Système de tickets physiques */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            3. Modalités d'échange et tickets physiques
          </h2>
          <p>
            L'intégralité des articles et services référencés sur le site s'obtient exclusivement en échange de <strong>tickets physiques</strong> délivrés au sein de l'établissement partenaire.
          </p>
        </section>

        <hr className="border-zinc-200/80 dark:border-zinc-800/80" />

        {/* Exonération de responsabilité */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            4. Limitation de responsabilité
          </h2>
          <p>
            La plateforme <strong>Boutique Bisou</strong> ainsi que l'équipe <strong>VTH Group</strong> déclinent toute responsabilité en cas de litige, perte, vol, dégradation ou contestation liés aux échanges manuels ou physiques de tickets entre utilisateurs ou au sein de l'établissement.
          </p>
        </section>

      </div>
    </div>
  );
}
