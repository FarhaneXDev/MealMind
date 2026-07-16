"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import {
  ChefHat,
  Clock3,
  Sparkles,
  ArrowRight,
  Heart,
  Menu,
  X,
  CalendarDays,
  ShoppingBasket,
  History,
} from "lucide-react";

const perforation = {
  backgroundImage:
    "radial-gradient(circle at 6px 6px, var(--color-paper) 6px, transparent 6.5px)",
  backgroundSize: "16px 13px",
  backgroundRepeat: "repeat-x",
};

const steps = [
  {
    label: "Repas",
    value: "Déjeuner",
    icon: ChefHat,
  },
  {
    label: "Temps",
    value: "20 min",
    icon: Clock3,
  },
  {
    label: "Envie",
    value: "Rapide",
    icon: Sparkles,
  },
];

export default function Home() {
  const [open, setOpen] = useState(false);
  const [connecte, setConnecte] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/moi/`,
          {
            credentials: "include",
          },
        );
        setConnecte(res.ok);
      } finally {
        setChecking(false);
      }
    };
    checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Nav */}
      <header className="max-w-5xl mx-auto px-5 sm:px-8 py-5 relative">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-lg tracking-tight">
            MealMind
          </span>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
            {checking ? null : connecte ? (
              <Link
                href="/dashboard"
                className="bg-palm text-paper px-4 py-2 rounded-full hover:bg-palm-dark transition-colors"
              >
                Mon tableau de bord
              </Link>
            ) : (
              <>
                <Link href="/connexion" className="text-ink/70 hover:text-ink">
                  Se connecter
                </Link>
                <Link
                  href="/inscription"
                  className="bg-palm text-paper px-4 py-2 rounded-full hover:bg-palm-dark transition-colors"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </nav>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Ouvrir le menu"
            className="sm:hidden p-2 -mr-2 text-ink/70 hover:text-ink"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile panel */}
        {open && (
          <div className="sm:hidden absolute left-5 right-5 top-full mt-2 bg-white border border-ink/10 rounded-xl shadow-lg p-4 flex flex-col gap-2 z-20">
            {connecte ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 bg-palm text-paper text-sm font-semibold px-4 py-3 rounded-lg hover:bg-palm-dark transition-colors"
              >
                Mon tableau de bord
              </Link>
            ) : (
              <>
                <Link
                  href="/connexion"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-ink/80 hover:text-ink px-3 py-3 rounded-lg hover:bg-paper transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/inscription"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 bg-palm text-paper text-sm font-semibold px-4 py-3 rounded-lg hover:bg-palm-dark transition-colors"
                >
                  Créer un compte
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pt-10 pb-16 sm:pt-16 sm:pb-24 text-center">
        <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight max-w-3xl mx-auto">
          Qu&apos;est-ce que je mange aujourd&apos;hui&nbsp;?
        </h1>

        <p className="mt-5 text-base sm:text-lg text-ink/70 max-w-md mx-auto">
          Dis-nous ton repas, ton temps, ton envie et ce que tu as sous la main.
          MealMind te propose une recette précise, tout de suite.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/decouvrir"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-piment text-white font-semibold px-7 py-3.5 rounded-full hover:bg-piment-dark transition-colors"
          >
            Trouver une recette
            <ArrowRight size={18} />
          </Link>

          <a
            href="#comment-ca-marche"
            className="text-sm font-medium text-ink/60 hover:text-ink"
          >
            Voir comment ça marche
          </a>
        </div>

        <p className="mt-4 text-xs text-ink/50">
          Aucune inscription nécessaire pour commencer.
        </p>
      </section>

      {/* Comment ça marche */}
      <section
        id="comment-ca-marche"
        className="max-w-5xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28"
      >
        <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight">
          Quelques questions. Une recette.
        </h2>
        <p className="text-center text-ink/60 mt-2 mb-12 text-sm sm:text-base">
          Comme au comptoir&nbsp;: on prend ta commande, on te tamponne un
          ticket.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const tilt = i % 2 === 0 ? "-rotate-1" : "rotate-1";
            return (
              <div key={step.label} className="contents">
                <div
                  className={`${tilt} bg-white border border-dashed border-ink/20 rounded-lg px-5 py-4 shadow-sm w-full sm:w-auto sm:flex-1 text-center`}
                >
                  <Icon className="mx-auto text-palm" size={22} />
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-ink/40">
                    {step.label}
                  </p>
                  <p className="font-bold text-ink">{step.value}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight
                    className="text-ink/25 rotate-90 sm:rotate-0 shrink-0"
                    size={20}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Ticket résultat */}
        <div className="relative mt-6 max-w-md mx-auto">
          <div className="relative bg-white border border-ink/10 rounded-lg shadow-md px-6 pt-8 pb-6 overflow-hidden">
            <div
              className="absolute -top-[6px] left-0 right-0 h-3"
              style={perforation}
            />
            <span className="absolute top-4 right-4 -rotate-6 border-2 border-piment text-piment text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              Prêt en 15 min
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/40">
              Ta recette
            </p>
            <p className="mt-1 text-xl font-extrabold">Riz sauté aux légumes</p>
            <p className="mt-1 text-sm text-ink/60">
              Facile · Budget léger · 4 ingrédients
            </p>
          </div>
        </div>
      </section>

      {/* Sans compte / avec compte */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28">
        <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight mb-12">
          Commence libre. Reste si ça te sert.
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Sans compte */}
          <div className="bg-white border border-ink/10 rounded-xl p-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Sans compte
            </p>
            <p className="mt-2 text-lg font-bold">Une suggestion, direct</p>
            <ul className="mt-5 space-y-3 text-sm text-ink/70">
              <li className="flex items-start gap-2">
                <Sparkles size={16} className="mt-0.5 text-palm shrink-0" />
                Réponds à 3 questions, reçois ta recette
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight size={16} className="mt-0.5 text-palm shrink-0" />
                &quot;Une autre idée&quot; si ça ne te va pas
              </li>
            </ul>
          </div>

          {/* Avec compte */}
          <div className="bg-palm text-paper rounded-xl p-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-paper/60">
              Avec un compte gratuit
            </p>
            <p className="mt-2 text-lg font-bold">Ta cuisine, organisée</p>
            <ul className="mt-5 space-y-3 text-sm text-paper/85">
              <li className="flex items-start gap-2">
                <History size={16} className="mt-0.5 shrink-0" />
                Historique de tout ce que tu as cuisiné
              </li>
              <li className="flex items-start gap-2">
                <CalendarDays size={16} className="mt-0.5 shrink-0" />
                Calendrier et menu de la semaine
              </li>
              <li className="flex items-start gap-2">
                <ShoppingBasket size={16} className="mt-0.5 shrink-0" />
                Garde-manger pour des suggestions sur mesure
              </li>
              <li className="flex items-start gap-2">
                <Heart size={16} className="mt-0.5 shrink-0" />
                Recettes favorites, à retrouver en un clic
              </li>
            </ul>
            <Link
              href="/inscription"
              className="mt-6 inline-flex items-center gap-2 bg-piment text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-piment-dark transition-colors"
            >
              Créer un compte gratuit
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="max-w-5xl mx-auto px-5 sm:px-8 py-8 text-center text-xs text-ink/40">
        Cuisine rapide
      </footer>
    </div>
  );
}
