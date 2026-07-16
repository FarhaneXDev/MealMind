"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Save } from "lucide-react";

const DIFFICULTES = ["Facile", "Moyen", "Difficile"];

export default function RecetteForm({ recetteExistante }) {
  const router = useRouter();
  const isEdition = Boolean(recetteExistante);

  const [repasOptions, setRepasOptions] = useState([]);
  const [envieOptions, setEnvieOptions] = useState([]);
  const [ingredientOptions, setIngredientOptions] = useState([]);

  const [titre, setTitre] = useState(recetteExistante?.titre || "");
  const [difficulte, setDifficulte] = useState(
    recetteExistante?.difficulte || "Facile",
  );
  const [dureeMin, setDureeMin] = useState(recetteExistante?.duree_min || 15);
  const [budgetFCFA, setBudgetFCFA] = useState(
    recetteExistante?.budget_fcfa || 500,
  );
  const [repasSelect, setRepasSelect] = useState(recetteExistante?.repas || []);
  const [envieSelect, setEnvieSelect] = useState(
    recetteExistante?.envies || [],
  );

  const [ingredientsListe, setIngredientsListe] = useState(
    recetteExistante?.ingredients_liste?.map((i) => ({
      ingredient: i.ingredient,
      essentiel: i.essentiel,
    })) || [{ ingredient: "", essentiel: true }],
  );

  const [etapes, setEtapes] = useState(
    recetteExistante?.etapes?.map((e) => e.description) || [""],
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOptions = async () => {
      const [repasRes, envieRes, ingRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/backstage/repas/`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/backstage/envies/`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/backstage/ingredients/`, {
          credentials: "include",
        }),
      ]);
      if (repasRes.ok) setRepasOptions(await repasRes.json());
      if (envieRes.ok) setEnvieOptions(await envieRes.json());
      if (ingRes.ok) setIngredientOptions(await ingRes.json());
    };
    fetchOptions();
  }, []);

  const toggleRepas = (id) => {
    setRepasSelect((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const toggleEnvie = (id) => {
    setEnvieSelect((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  const updateIngredientLigne = (index, key, value) => {
    setIngredientsListe((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [key]: value } : ing)),
    );
  };

  const addIngredientLigne = () => {
    setIngredientsListe((prev) => [
      ...prev,
      { ingredient: "", essentiel: true },
    ]);
  };

  const removeIngredientLigne = (index) => {
    setIngredientsListe((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEtape = (index, value) => {
    setEtapes((prev) => prev.map((e, i) => (i === index ? value : e)));
  };

  const addEtape = () => {
    setEtapes((prev) => [...prev, ""]);
  };

  const removeEtape = (index) => {
    setEtapes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!titre.trim()) {
      setError("Le titre est requis.");
      return;
    }
    if (repasSelect.length === 0) {
      setError("Sélectionne au moins un repas.");
      return;
    }

    const payload = {
      titre: titre.trim(),
      difficulte,
      duree_min: Number(dureeMin),
      budget_fcfa: Number(budgetFCFA),
      repas: repasSelect,
      envies: envieSelect,
      ingredients_liste: ingredientsListe
        .filter((i) => i.ingredient)
        .map((i) => ({
          ingredient: Number(i.ingredient),
          essentiel: i.essentiel,
        })),
      etapes: etapes
        .map((desc, i) => ({ ordre: i + 1, description: desc.trim() }))
        .filter((e) => e.description),
    };

    setSaving(true);
    try {
      const url = isEdition
        ? `${process.env.NEXT_PUBLIC_API_URL}/backstage/recettes/${recetteExistante.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/backstage/recettes/`;

      const res = await fetch(url, {
        method: isEdition ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(JSON.stringify(data));
        return;
      }

      router.push("/admin/recettes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Infos de base */}
      <div className="bg-white border border-ink/10 rounded-xl p-5 flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
            Titre
          </label>
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-ink/15 text-sm focus:outline-none focus:border-palm"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Difficulté
            </label>
            <select
              value={difficulte}
              onChange={(e) => setDifficulte(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-ink/15 text-sm bg-white"
            >
              {DIFFICULTES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Durée (min)
            </label>
            <input
              type="number"
              min="1"
              value={dureeMin}
              onChange={(e) => setDureeMin(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-ink/15 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Budget (FCFA)
            </label>
            <input
              type="number"
              min="0"
              value={budgetFCFA}
              onChange={(e) => setBudgetFCFA(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-ink/15 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Repas & envies */}
      <div className="bg-white border border-ink/10 rounded-xl p-5 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-2">
            Repas
          </p>
          <div className="flex flex-wrap gap-2">
            {repasOptions.map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => toggleRepas(r.id)}
                className={`text-sm px-3.5 py-2 rounded-full border transition-colors ${
                  repasSelect.includes(r.id)
                    ? "bg-palm text-paper border-palm"
                    : "bg-white text-ink/70 border-ink/15"
                }`}
              >
                {r.nom}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-2">
            Envies
          </p>
          <div className="flex flex-wrap gap-2">
            {envieOptions.map((e) => (
              <button
                type="button"
                key={e.id}
                onClick={() => toggleEnvie(e.id)}
                className={`text-sm px-3.5 py-2 rounded-full border transition-colors ${
                  envieSelect.includes(e.id)
                    ? "bg-mais/20 border-mais text-ink"
                    : "bg-white text-ink/70 border-ink/15"
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ingrédients */}
      <div className="bg-white border border-ink/10 rounded-xl p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-3">
          Ingrédients
        </p>
        <div className="flex flex-col gap-2.5">
          {ingredientsListe.map((ing, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                value={ing.ingredient}
                onChange={(e) =>
                  updateIngredientLigne(index, "ingredient", e.target.value)
                }
                className="flex-1 px-3 py-2 rounded-lg border border-ink/15 text-sm bg-white"
              >
                <option value="">— Choisir —</option>
                {ingredientOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.nom}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 text-xs text-ink/60 shrink-0">
                <input
                  type="checkbox"
                  checked={ing.essentiel}
                  onChange={(e) =>
                    updateIngredientLigne(index, "essentiel", e.target.checked)
                  }
                  className="accent-palm"
                />
                essentiel
              </label>
              <button
                type="button"
                onClick={() => removeIngredientLigne(index)}
                className="shrink-0 p-1.5 text-ink/30 hover:text-piment"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredientLigne}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium text-palm hover:underline"
        >
          <Plus size={14} />
          Ajouter un ingrédient
        </button>
      </div>

      {/* Étapes */}
      <div className="bg-white border border-ink/10 rounded-xl p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-3">
          Étapes de préparation
        </p>
        <div className="flex flex-col gap-2.5">
          {etapes.map((etape, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="shrink-0 w-6 h-6 mt-1 rounded-full bg-ink/10 text-ink/60 text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <textarea
                value={etape}
                onChange={(e) => updateEtape(index, e.target.value)}
                rows={2}
                className="flex-1 px-3 py-2 rounded-lg border border-ink/15 text-sm resize-none"
              />
              <button
                type="button"
                onClick={() => removeEtape(index)}
                className="shrink-0 p-1.5 mt-1 text-ink/30 hover:text-piment"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addEtape}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium text-palm hover:underline"
        >
          <Plus size={14} />
          Ajouter une étape
        </button>
      </div>

      {error && (
        <p className="text-sm text-piment-dark bg-piment/5 border border-piment/20 rounded-lg p-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-2 bg-piment text-white font-semibold px-6 py-3.5 rounded-full hover:bg-piment-dark transition-colors disabled:opacity-60"
      >
        <Save size={18} />
        {saving
          ? "Enregistrement..."
          : isEdition
            ? "Mettre à jour"
            : "Créer la recette"}
      </button>
    </form>
  );
}
