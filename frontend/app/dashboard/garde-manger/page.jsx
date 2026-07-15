"use client";

import { useState, useEffect } from "react";
import { Plus, X, Check, ShoppingBasket } from "lucide-react";

const LABELS = {
  cereales: "Céréales & féculents",
  proteines: "Protéines",
  legumes: "Légumes",
  basiques: "Basiques & sauces",
  autre: "Autre",
};

export default function GardeManger() {
  const [ingredientCategories, setIngredientCategories] = useState([]);
  const [stock, setStock] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [ingRes, stockRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/ingredients/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/cuisine/garde-manger/`, {
          credentials: "include",
        }),
      ]);

      if (ingRes.ok) {
        const data = await ingRes.json();
        const groupes = {};
        data.forEach((ing) => {
          if (!groupes[ing.categorie]) groupes[ing.categorie] = [];
          groupes[ing.categorie].push(ing.nom);
        });
        setIngredientCategories(
          Object.entries(groupes).map(([key, items]) => ({
            name: LABELS[key] || key,
            items,
          })),
        );
      }

      if (stockRes.ok) {
        const data = await stockRes.json();
        setStock(data.ingredients);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const toggleItem = async (item) => {
    setStock((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/cuisine/garde-manger/`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredient: item }),
      },
    );

    if (!res.ok) {
      // échec : on annule le changement optimiste
      setStock((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
      );
    }
  };

  const addCustom = () => {
    const value = customInput.trim();
    if (!value || stock.includes(value)) return;
    setStock((prev) => [...prev, value]);
    setCustomInput("");
  };

  const customStockItems = stock.filter(
    (i) => !ingredientCategories.some((c) => c.items.includes(i)),
  );

  if (loading) {
    return <p className="text-sm text-ink/40">Chargement...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Garde-manger
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            Ce que tu as, pour des suggestions sur mesure.
          </p>
        </div>
        <span className="shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-palm/10 text-palm px-3 py-1.5 rounded-full">
          <ShoppingBasket size={14} />
          {stock.length}
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {ingredientCategories.map((cat) => (
          <div key={cat.name}>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-2.5">
              {cat.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {cat.items.map((item) => {
                const active = stock.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleItem(item)}
                    className={`flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-full border transition-colors ${
                      active
                        ? "bg-palm text-paper border-palm"
                        : "bg-white text-ink/70 border-ink/15 hover:border-ink/30"
                    }`}
                  >
                    {active && <Check size={13} />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-2.5">
            Autre chose ?
          </p>
          <div className="flex gap-2">
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              placeholder="Ex : wagasi, akassa..."
              className="flex-1 px-4 py-2.5 rounded-full border border-ink/15 bg-white text-sm focus:outline-none focus:border-palm"
            />
            <button
              onClick={addCustom}
              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-ink/5 hover:bg-ink/10 text-ink"
              aria-label="Ajouter"
            >
              <Plus size={18} />
            </button>
          </div>
          {customStockItems.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {customStockItems.map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-full bg-palm text-paper"
                >
                  {item}
                  <button
                    onClick={() => toggleItem(item)}
                    aria-label={`Retirer ${item}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
