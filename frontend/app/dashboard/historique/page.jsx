"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { History } from "lucide-react";

export default function Historique() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorique = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cuisine/historique/`, {
        credentials: "include",
      });
      if (res.ok) setItems(await res.json());
      setLoading(false);
    };
    fetchHistorique();
  }, []);

  if (loading) return <p className="text-sm text-ink/40">Chargement...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Historique</h1>
        <p className="text-sm text-ink/60 mt-1">Ce que tu as déjà cuisiné avec MealMind.</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-dashed border-ink/20 rounded-xl p-8 text-center">
          <History className="mx-auto text-ink/30" size={28} />
          <p className="mt-3 text-sm text-ink/50">Aucune recette cuisinée pour l&apos;instant.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((it) => (
            <li
              key={it.id}
              className="bg-white border border-ink/10 rounded-xl px-4 py-3.5 flex items-center justify-between gap-3"
            >
              <Link href={`/recette/${it.recette}`} className="min-w-0 hover:opacity-70">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/40">
                  {new Date(it.cuisine_le).toLocaleDateString("fr-FR")} · {it.repas_nom}
                </p>
                <p className="font-semibold truncate">{it.recette_titre}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}