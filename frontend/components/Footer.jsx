import Link from "next/link";
import { ChefHat } from "lucide-react";

export default function Footer() {
  const annee = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/10">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <span className="flex items-center gap-1.5 font-extrabold text-lg tracking-tight">
              <ChefHat size={18} className="text-palm" />
              MealMind
            </span>
            <p className="mt-2 text-sm text-ink/50 max-w-xs">
              L&apos;assistant qui répond à &quot;qu&apos;est-ce que je mange&quot;,
              avec de vrais plats d&apos;ici.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-3">
              Produit
            </p>
            <ul className="flex flex-col gap-2 text-sm text-ink/60">
              <li>
                <Link href="/decouvrir" className="hover:text-ink transition-colors">
                  Trouver une recette
                </Link>
              </li>
              <li>
                <Link href="/inscription" className="hover:text-ink transition-colors">
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link href="/connexion" className="hover:text-ink transition-colors">
                  Se connecter
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-3">
              À propos
            </p>
            <p className="text-sm text-ink/60 leading-relaxed">
              Un projet pensé et construit pour répondre à une
              question qu&apos;on se pose tous, tous les jours.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink/40">
          <span>© {annee} MealMind</span>
          <span className="px-2 py-0.5 rounded-full bg-ink/5">version 1.1</span>
        </div>
      </div>
    </footer>
  );
}