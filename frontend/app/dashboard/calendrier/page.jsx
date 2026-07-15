"use client";

import { useState, useEffect } from "react";
import { CalendarDays, ShoppingBasket, Shuffle, Check } from "lucide-react";

const DUREES = [3, 5, 7];
const REPAS_CHOIX = ["Petit-déjeuner", "Déjeuner", "Dîner"];

function labelDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  const demain = new Date(aujourdhui);
  demain.setDate(demain.getDate() + 1);

  const diffJours = Math.round((date - aujourdhui) / 86400000);

  if (diffJours === 0) return "Aujourd'hui";
  if (diffJours === 1) return "Demain";

  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export default function Calendrier() {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [duree, setDuree] = useState(7);
  const [repasSelect, setRepasSelect] = useState([]);

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cuisine/menu/`, {
        credentials: "include",
      });
      if (res.ok) setMenu(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const toggleRepas = (r) => {
    setRepasSelect((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const handleGenerer = async () => {
    if (repasSelect.length === 0) return;
    setGenerating(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cuisine/menu/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duree, repas: repasSelect }),
    });
    if (res.ok) setMenu(await res.json());
    setGenerating(false);
  };

  if (loading) return <p className="text-sm text-ink/40">Chargement...</p>;

  const joursActifs = menu?.jours?.filter((j) => j.recette) || [];

  const listeCourses = joursActifs.length
    ? [...new Set(joursActifs.flatMap((j) => j.recette_ingredients))]
    : [];

  const coutTotal = joursActifs.reduce((sum, j) => sum + (j.recette_budget || 0), 0);

  const parDate = {};
  (menu?.jours || []).forEach((j) => {
    if (!parDate[j.date]) parDate[j.date] = [];
    parDate[j.date].push(j);
  });
  const datesTriees = Object.keys(parDate).sort();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Calendrier</h1>
        <p className="text-sm text-ink/60 mt-1">
          Planifie ta semaine, on s&apos;occupe des courses.
        </p>
      </div>

      <div className="bg-white border border-ink/10 rounded-xl p-5 flex flex-col gap-4">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Shuffle size={16} className="text-palm" />
          Générer un menu
        </p>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-2">
            Durée
          </p>
          <div className="flex gap-2.5">
            {DUREES.map((d) => (
              <button
                key={d}
                onClick={() => setDuree(d)}
                className={`flex-1 py-2 rounded-full border text-sm font-semibold transition-colors ${
                  duree === d
                    ? "border-palm bg-palm/5 text-palm"
                    : "border-ink/15 bg-white text-ink/70"
                }`}
              >
                {d} jours
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-2">
            Repas à planifier
          </p>
          <div className="flex flex-wrap gap-2">
            {REPAS_CHOIX.map((r) => (
              <button
                key={r}
                onClick={() => toggleRepas(r)}
                className={`flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-full border transition-colors ${
                  repasSelect.includes(r)
                    ? "bg-palm text-paper border-palm"
                    : "bg-white text-ink/70 border-ink/15"
                }`}
              >
                {repasSelect.includes(r) && <Check size={13} />}
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerer}
          disabled={generating || repasSelect.length === 0}
          className="mt-1 w-full bg-piment text-white font-semibold py-2.5 rounded-full hover:bg-piment-dark transition-colors disabled:opacity-50 text-sm"
        >
          {generating ? "Génération..." : "Générer le menu"}
        </button>
      </div>

      {datesTriees.length > 0 ? (
        <>
          <div className="flex flex-col gap-2.5">
            {datesTriees.map((dateStr) => {
              const entrees = parDate[dateStr];
              return (
                <div key={dateStr} className="bg-white border border-ink/10 rounded-xl px-4 py-3.5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-2">
                    {labelDate(dateStr)} · {entrees[0].jour_nom}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {entrees.map((e) => (
                      <div key={e.id} className="flex items-center justify-between text-sm">
                        <span className="text-ink/50">{e.repas_nom}</span>
                        {e.recette ? (
                          <span className="font-semibold truncate">{e.recette_titre}</span>
                        ) : (
                          <span className="text-ink/30">Libre</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {joursActifs.length > 0 && (
            <div className="bg-palm text-paper rounded-xl p-5">
              <p className="flex items-center gap-2 text-sm font-bold">
                <ShoppingBasket size={16} />
                Liste de courses
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {listeCourses.map((ing) => (
                  <span key={ing} className="text-xs px-2.5 py-1 rounded-full bg-paper/15 text-paper">
                    {ing}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-paper/70">
                Estimation totale ·{" "}
                <span className="font-semibold text-paper">{coutTotal} FCFA</span>
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white border border-dashed border-ink/20 rounded-xl p-8 text-center">
          <CalendarDays className="mx-auto text-ink/30" size={28} />
          <p className="mt-3 text-sm text-ink/50">
            Choisis une durée et des repas ci-dessus pour générer ton menu.
          </p>
        </div>
      )}
    </div>
  );
}