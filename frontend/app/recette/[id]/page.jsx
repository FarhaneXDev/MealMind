"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Clock3, Heart, ShoppingBasket, Wallet } from "lucide-react";
import { REPAS_OPTIONS } from "../../lib/repas";
import { ENVIE_OPTIONS } from "../../lib/envies";

export default function FicheRecette({ params }) {
  const { id } = use(params);

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favori, setFavori] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recettes/${id}/`);
        if (res.ok) setRecipe(await res.json());
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-sm text-ink/40">Chargement...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center px-5 text-center">
        <p className="text-lg font-bold">Recette introuvable</p>
        <p className="text-sm text-ink/50 mt-1">Elle a peut-être été retirée.</p>
        <Link href="/decouvrir" className="mt-5 text-sm font-semibold text-palm hover:underline">
          Trouver une autre recette
        </Link>
      </div>
    );
  }

  const repasIcons = recipe.repas
    .map((valeur) => REPAS_OPTIONS.find((o) => o.value === valeur))
    .filter(Boolean);

  const enviesInfo = recipe.envies
    .map((code) => ENVIE_OPTIONS.find((o) => o.value === code))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="max-w-md mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="p-2 -ml-2 text-ink/60 hover:text-ink" aria-label="Retour">
            <ArrowLeft size={20} />
          </Link>
          <button
            onClick={() => setFavori((v) => !v)}
            className="p-2 -mr-2"
            aria-label="Ajouter aux favoris"
          >
            <Heart size={22} className={favori ? "fill-piment text-piment" : "text-ink/30"} />
          </button>
        </div>

        <div className="h-40 rounded-2xl bg-gradient-to-br from-palm to-palm-dark flex items-center justify-center gap-3">
          {repasIcons.map(({ icon: Icon, value }) => (
            <Icon key={value} size={32} className="text-paper/90" />
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {recipe.repas.map((r) => (
            <span
              key={r}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-ink/10 text-ink/70"
            >
              {r}
            </span>
          ))}
        </div>

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight leading-tight">
          {recipe.titre}
        </h1>

        <div className="mt-4 flex items-center gap-4 text-sm text-ink/60">
          <span className="flex items-center gap-1.5">
            <Clock3 size={15} className="text-palm" />
            {recipe.duree_min} min
          </span>
          <span>{recipe.difficulte}</span>
          <span className="flex items-center gap-1.5">
            <Wallet size={15} className="text-palm" />
            ~{recipe.budget_fcfa} FCFA
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {enviesInfo.map(({ value, label, icon: Icon }) => (
            <span
              key={value}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-mais/15 text-ink/70"
            >
              <Icon size={13} />
              {label}
            </span>
          ))}
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-3">
            Ingrédients
          </p>
          <ul className="flex flex-col gap-2">
            {recipe.ingredients.map((ing) => (
              <li
                key={ing.nom}
                className="flex items-center justify-between bg-white border border-ink/10 rounded-lg px-4 py-2.5 text-sm"
              >
                {ing.nom}
                {!ing.essentiel && <span className="text-[11px] text-ink/40">optionnel</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-3">
            Préparation
          </p>
          <ol className="flex flex-col gap-3">
            {recipe.etapes.map((etape, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 w-6 h-6 rounded-full bg-palm text-paper text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-ink/80 pt-0.5">{etape}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 flex flex-col gap-3 pb-10">
          <Link
            href="/decouvrir"
            className="w-full flex items-center justify-center gap-2 bg-piment text-white font-semibold px-6 py-3.5 rounded-full hover:bg-piment-dark transition-colors"
          >
            <ShoppingBasket size={18} />
            Trouver une autre recette
          </Link>
        </div>
      </div>
    </div>
  );
}