import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Boutique Bisou",
  description: "Conditions Générales d'Utilisation de la Boutique Bisou.",
};

export default function CGUPage() {
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
          Conditions Générales d'Utilisation
        </h1>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Dernière mise à jour : Septembre 2026
        </p>
      </div>

      <div className="space-y-8 rounded-2xl border border-zinc-200/80 bg-white/80 p-6 md:p-10 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            1. Objet des CGU
          </h2>
          <p>
            Les présentes Conditions Générales d'Utilisation (CGU) encadrent l'accès et l'utilisation du site <strong>Boutique Bisou</strong>, géré par l'équipe VTH Group pour le Collège Pierre Dubois.
          </p>
        </section>

        <hr className="border-zinc-200/80 dark:border-zinc-800/80" />

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            2. Accès au site et création de compte
          </h2>
          <p>
            L'accès au site est réservé aux élèves, personnels et partenaires autorisés. Certains espaces nécessitent une connexion via un compte utilisateur. Vos identifiants sont strictement personnels et confidentiels.
          </p>
        </section>

        <hr className="border-zinc-200/80 dark:border-zinc-800/80" />

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            3. Règles de conduite
          </h2>
          <p>
            En utilisant la plateforme, l'utilisateur s'engage à :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ne pas tenter de contourner les systèmes de sécurité du site.</li>
            <li>Ne pas usurper l'identité d'un autre utilisateur.</li>
            <li>Respecter la courtoisie et le règlement du collège.</li>
          </ul>
        </section>

        <hr className="border-zinc-200/80 dark:border-zinc-800/80" />

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            4. Données personnelles
          </h2>
          <p>
            Les données récoltées (session, identifiants) servent uniquement au fonctionnement technique du site et au suivi des visites. Elles ne sont ni vendues ni cédées à des tiers.
          </p>
        </section>

        <hr className="border-zinc-200/80 dark:border-zinc-800/80" />

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            5. Modification des CGU
          </h2>
          <p>
            L'équipe VTH Group se réserve le droit de modifier les présentes CGU à tout moment afin de garantir leur conformité avec la réglementation en vigueur.
          </p>
        </section>

      </div>
    </div>
  );
}
