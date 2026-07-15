"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowRight, Clock3 } from "lucide-react";

export default function Favoris() {
  const [favoris, setFavoris] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavoris = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cuisine/favoris/`, {
      credentials: "include",
    });
    if (res.ok) setFavoris(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchFavoris();
  }, []);

  const retirer = async (recetteId) => {
    setFavoris((prev) => prev.filter((f) => f.recette !== recetteId));
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cuisine/favoris/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recette: recetteId }),
    });
  };

  if (loading) return <p className="text-sm text-ink/40">Chargement...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Favoris</h1>
        <p className="text-sm text-ink/60 mt-1">
          Tes recettes préférées, retrouvées en un clic.
        </p>
      </div>

      {favoris.length === 0 ? (
        <div className="bg-white border border-dashed border-ink/20 rounded-xl p-8 text-center">
          <Heart className="mx-auto text-ink/30" size={28} />
          <p className="mt-3 text-sm text-ink/50">Aucun favori pour l&apos;instant.</p>
          <Link
            href="/decouvrir"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-palm hover:underline"
          >
            Trouver une recette
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {favoris.map((f) => (
            <div key={f.id} className="bg-white border border-ink/10 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/recette/${f.recette}`} className="font-bold leading-snug hover:opacity-70">
                  {f.recette_titre}
                </Link>
                <button
                  onClick={() => retirer(f.recette)}
                  className="shrink-0 p-1.5 rounded-full hover:bg-paper"
                  aria-label="Retirer des favoris"
                >
                  <Heart size={17} className="fill-piment text-piment" />
                </button>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-ink/50">
                <Clock3 size={13} />
                {f.recette_duree} min · {f.recette_difficulte}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}