import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales — Boutique Bisou",
  description: "Mentions légales de la Boutique Bisou, éditée par VTH Group.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="relative mx-auto max-w-3xl px-4 py-12 md:py-20">
      {/* Bouton Retour */}
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
          Information réglementaire
        </span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
          Mentions Légales
        </h1>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Dernière mise à jour : Septembre 2026
        </p>
      </div>

      <div className="space-y-8 rounded-2xl border border-zinc-200/80 bg-white/80 p-6 md:p-10 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        
        {/* Éditeur */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            1. Édition du site
          </h2>
          <p>
            Le site <strong>Boutique Bisou</strong> est édité par l'équipe <strong>VTH Group</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Projet réalisé pour :</strong> Collège Pierre Dubois</li>
            <li><strong>Contact e-mail :</strong> <a href="mailto:contact@vth-mc.fr" className="text-pink-500 underline">contact@vth-mc.fr</a></li>
            <li><strong>Site de l'éditeur :</strong> <a href="https://www.vth-mc.fr" target="_blank" rel="noopener noreferrer" className="text-pink-500 underline">www.vth-mc.fr</a></li>
          </ul>
        </section>

        <hr className="border-zinc-200/80 dark:border-zinc-800/80" />

        {/* Hébergeurs */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            2. Hébergement du site & des données
          </h2>
          <p>
            L'interface web (Frontend) et la base de données (Backend) du site sont hébergées auprès de prestataires tiers :
          </p>
          
          <div className="mt-3 space-y-3">
            <div className="rounded-xl border border-zinc-200/60 bg-zinc-50/50 p-4 dark:border-zinc-800/60 dark:bg-zinc-900/50">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider text-pink-500">
                Hébergement Frontend
              </h3>
              <p className="mt-1 text-xs">
                <strong>Vercel Inc.</strong><br />
                340 S Lemon Ave #4133 Walnut, CA 91789, États-Unis<br />
                Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-pink-500 underline">vercel.com</a>
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200/60 bg-zinc-50/50 p-4 dark:border-zinc-800/60 dark:bg-zinc-900/50">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider text-pink-500">
                Hébergement Base de données & API
              </h3>
              <p className="mt-1 text-xs">
                <strong>Supabase, Inc.</strong><br />
                970 Toa Payoh North #07-04, Singapour 318992<br />
                Site web : <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-pink-500 underline">supabase.com</a>
              </p>
            </div>
          </div>
        </section>

        <hr className="border-zinc-200/80 dark:border-zinc-800/80" />

        {/* Propriété intellectuelle */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            3. Propriété intellectuelle & Crédits
          </h2>
          <p>
            Toutes les marques, photographies, textes, commentaires, illustrations, images animées ou non, séquences vidéo, sons, ainsi que toutes les applications informatiques qui pourraient être utilisées pour faire fonctionner ce site sont protégés par les lois en vigueur au titre de la propriété intellectuelle.
          </p>
          <p>
            Les visuels et images affichés sur la plateforme sont fournis par le Collège Pierre Dubois ou par l'équipe de la Boutique Bisou.
          </p>
          <p className="text-xs italic text-zinc-500">
            Pour tout problème relatif aux crédits ou aux droits d'auteur, contactez-nous à <a href="mailto:contact@vth-mc.fr" className="text-pink-500 underline">contact@vth-mc.fr</a>.
          </p>
        </section>

      </div>
    </div>
  );
}
