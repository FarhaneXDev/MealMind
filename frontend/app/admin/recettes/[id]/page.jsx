"use client";

import { useState, useEffect, use } from "react";
import RecetteForm from "../../components/RecetteForm";

export default function EditerRecette({ params }) {
  const { id } = use(params);

  const [recette, setRecette] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecette = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/backstage/recettes/${id}/`,
          { credentials: "include" }
        );
        if (!res.ok) {
          console.error("Erreur fetch recette:", res.status, await res.text());
          setLoading(false);
          return;
        }
        setRecette(await res.json());
      } catch (err) {
        console.error("Erreur réseau:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecette();
  }, [id]);

  if (loading) return <p className="text-sm text-ink/40">Chargement...</p>;
  if (!recette) return <p className="text-sm text-ink/50">Recette introuvable.</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Modifier la recette</h1>
        <p className="text-sm text-ink/60 mt-1">{recette.titre}</p>
      </div>
      <RecetteForm recetteExistante={recette} />
    </div>
  );
}