"use client";

import Link from "next/link";
import { REPAS_OPTIONS } from "../lib/repas";
import { ENVIE_OPTIONS } from "../lib/envies";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES_INGREDIENTS } from "../lib/categoriesIngredients";
import {
  ArrowLeft,
  ArrowRight,
  ChefHat,
  Clock3,
  Sparkles,
  Plus,
  X,
  Heart,
  ShoppingBasket,
  RotateCcw,
  Check,
} from "lucide-react";

/* ---------- Données (mock — remplacées par l'API plus tard) ---------- */

const TEMPS_OPTIONS = ["<10 min", "10-20 min", "20-30 min", "Peu importe"];

const BUDGET_OPTIONS = [
  { value: "petit", label: "Petit", hint: "< 1000 FCFA" },
  { value: "moyen", label: "Moyen", hint: "1000 – 2000 FCFA" },
  { value: "peu_importe", label: "Peu importe", hint: "" },
];

const STEP_LABELS = ["Repas", "Temps", "Envie", "Ingrédients"];

/* ---------- Composant ---------- */

export default function Decouvrir() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [repas, setRepas] = useState(null);
  const [temps, setTemps] = useState(null);
  const [envie, setEnvie] = useState(null);

  const [selected, setSelected] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [openToComplete, setOpenToComplete] = useState(false);
  const [readyToShop, setReadyToShop] = useState(null); // 'oui' | 'non' | null
  const [budget, setBudget] = useState(null);

  const [showResult, setShowResult] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [excluded, setExcluded] = useState([]);
  const [favoriActif, setFavoriActif] = useState(false);
  const [cuisineConfirme, setCuisineConfirme] = useState(false);
  const [ingredientCategories, setIngredientCategories] = useState([]);

  useEffect(() => {
    const preloadGardeManger = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cuisine/garde-manger/`,
        {
          credentials: "include",
        },
      );
      if (res.ok) {
        const data = await res.json();
        setSelected(data.ingredients);
      }
      // si 401 (visiteur non connecté), on ne fait rien — la liste reste vide, comme avant
    };
    preloadGardeManger();
  }, []);

  const toggleIngredient = (item) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const addCustomIngredient = () => {
    const value = customInput.trim();
    if (!value) return;
    if (!selected.includes(value)) setSelected((prev) => [...prev, value]);
    setCustomInput("");
  };

  const hasIngredients = selected.length > 0;

  const canContinueStep4 = hasIngredients
    ? true
    : readyToShop === "non" || (readyToShop === "oui" && budget);

  const scenario = useMemo(() => {
    if (hasIngredients && openToComplete) return "complete";
    if (hasIngredients && !openToComplete) return "avec";
    if (!hasIngredients && readyToShop === "oui") return "courses";
    return "vide";
  }, [hasIngredients, openToComplete, readyToShop]);

  const buildQuery = (excludedIds) => {
    const params = new URLSearchParams();
    params.set("repas", repas);
    if (temps) params.set("temps", temps);
    if (envie) params.set("envie", envie);
    if (scenario) params.set("scenario", scenario);
    if (budget) params.set("budget", budget);
    if (selected.length) params.set("ingredients", selected.join(","));
    if (excludedIds.length) params.set("exclude", excludedIds.join(","));
    return params.toString();
  };

  const goToResult = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/suggestion/?${buildQuery([])}`,
    );
    if (!res.ok) return;
    const r = await res.json();
    setRecipe(r);
    setExcluded([r.id]);
    setFavoriActif(false);
    setCuisineConfirme(false);
    setShowResult(true);
  };

  const anotherIdea = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/suggestion/?${buildQuery(excluded)}`,
    );
    if (!res.ok) return;
    const r = await res.json();
    setRecipe(r);
    setExcluded((prev) => [...prev, r.id]);
    setFavoriActif(false);
    setCuisineConfirme(false);
  };

  const toggleFavori = async (recetteId) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/cuisine/favoris/`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recette: recetteId }),
      },
    );
    if (res.ok) {
      const data = await res.json();
      setFavoriActif(data.present);
    }
  };

  const marquerCuisine = async (recetteId) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/cuisine/historique/marquer/`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recette: recetteId, repas }),
      },
    );
    if (res.ok) {
      setCuisineConfirme(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  };

  const restart = () => {
    setStep(1);
    setRepas(null);
    setTemps(null);
    setEnvie(null);
    setSelected([]);
    setOpenToComplete(false);
    setReadyToShop(null);
    setBudget(null);
    setShowResult(false);
    setRecipe(null);
    setExcluded([]);
  };

  useEffect(() => {
    const fetchIngredients = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ingredients/`,
      );
      if (!res.ok) return;
      const data = await res.json();
      const groupes = {};
      data.forEach((ing) => {
        if (!groupes[ing.categorie]) groupes[ing.categorie] = [];
        groupes[ing.categorie].push(ing.nom);
      });
      const LABELS = Object.fromEntries(
        CATEGORIES_INGREDIENTS.map((c) => [c.value, c.label]),
      );
      setIngredientCategories(
        Object.entries(groupes).map(([key, items]) => ({
          name: LABELS[key] || key,
          items,
        })),
      );
    };
    fetchIngredients();
  }, []);

  const missingForRecipe = recipe
    ? recipe.ingredients
        .map((i) => i.nom)
        .filter((nom) => !selected.includes(nom))
    : [];

  /* ---------- Écran résultat ---------- */

  if (showResult && recipe) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col">
        <div className="max-w-md w-full mx-auto px-5 py-8 flex-1 flex flex-col">
          <button
            onClick={restart}
            className="self-start flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink mb-8"
          >
            <RotateCcw size={15} />
            Recommencer
          </button>

          <div className="relative bg-white border border-ink/10 rounded-lg shadow-md px-6 pt-8 pb-6 overflow-hidden">
            <div
              className="absolute -top-[6px] left-0 right-0 h-3"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 6px 6px, var(--color-paper) 6px, transparent 6.5px)",
                backgroundSize: "16px 13px",
                backgroundRepeat: "repeat-x",
              }}
            />
            <span className="absolute top-4 right-4 -rotate-6 border-2 border-piment text-piment text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              Prêt en {recipe.duree_min} min
            </span>

            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/40">
              Ta recette · {repas}
            </p>
            <p className="mt-1 text-2xl font-extrabold leading-tight">
              {recipe.titre}
            </p>
            <p className="mt-1 text-sm text-ink/60">
              {recipe.difficulte} ·{" "}
              {ENVIE_OPTIONS.find((o) => o.value === envie)?.label}
            </p>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {recipe.ingredients
                .map((i) => i.nom)
                .map((ing) => (
                  <span
                    key={ing}
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      selected.includes(ing)
                        ? "bg-palm/10 border-palm/30 text-palm"
                        : "bg-paper border-ink/15 text-ink/50"
                    }`}
                  >
                    {ing}
                  </span>
                ))}
            </div>
          </div>

          {(scenario === "courses" || scenario === "complete") && (
            <div className="mt-4 bg-white border border-dashed border-ink/20 rounded-lg p-5">
              <p className="flex items-center gap-2 text-sm font-bold">
                <ShoppingBasket size={16} className="text-piment" />
                {scenario === "courses" ? "Liste de courses" : "À compléter"}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-ink/70">
                {missingForRecipe.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-mais" />
                    {item}
                  </li>
                ))}
              </ul>
              {scenario === "courses" && (
                <p className="mt-4 text-xs text-ink/50">
                  Estimation ·{" "}
                  <span className="font-semibold text-ink/70">
                    ~{recipe.budgetFCFA} FCFA
                  </span>{" "}
                  (
                  {BUDGET_OPTIONS.find(
                    (b) => b.value === budget,
                  )?.label.toLowerCase()}
                  )
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => marquerCuisine(recipe.id)}
                disabled={cuisineConfirme}
                className="flex-1 flex items-center justify-center gap-2 bg-palm text-paper font-semibold px-6 py-3.5 rounded-full hover:bg-palm-dark transition-colors disabled:opacity-60"
              >
                {cuisineConfirme ? "C'est noté !" : "Je cuisine ça"}
              </button>
              <button
                onClick={() => toggleFavori(recipe.id)}
                className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full border border-ink/15 hover:bg-white transition-colors"
                aria-label="Ajouter aux favoris"
              >
                <Heart
                  size={19}
                  className={
                    favoriActif ? "fill-piment text-piment" : "text-ink/40"
                  }
                />
              </button>
            </div>
            <button
              onClick={anotherIdea}
              className="w-full flex items-center justify-center gap-2 border border-ink/15 text-ink font-semibold px-6 py-3.5 rounded-full hover:bg-white transition-colors"
            >
              Une autre idée
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Écran questionnaire ---------- */

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <div className="max-w-md w-full mx-auto px-5 py-8 flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="p-2 -ml-2 text-ink/60 hover:text-ink"
              aria-label="Étape précédente"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <Link href="/" className="p-2 -ml-2 text-ink/60 hover:text-ink">
              <ArrowLeft size={20} />
            </Link>
          )}
          <span className="text-xs font-semibold text-ink/40">
            Étape {step} sur 4
          </span>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-10">
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              className={`h-1.5 flex-1 rounded-full ${
                i < step ? "bg-palm" : "bg-ink/10"
              }`}
            />
          ))}
        </div>

        {/* Étape 1 : Repas */}
        {step === 1 && (
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-extrabold mb-8">
              Que veux-tu préparer ?
            </h1>
            <div className="flex flex-col gap-3">
              {REPAS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setRepas(opt.value);
                    setStep(2);
                  }}
                  className={`flex items-center gap-3 text-left px-5 py-4 rounded-xl border transition-colors ${
                    repas === opt.value
                      ? "border-palm bg-palm/5"
                      : "border-ink/10 bg-white hover:border-ink/25"
                  }`}
                >
                  <opt.icon size={22} className="text-palm shrink-0" />
                  <span className="font-semibold">{opt.value}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Étape 2 : Temps */}
        {step === 2 && (
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-extrabold mb-8">
              Combien de temps as-tu ?
            </h1>
            <div className="grid grid-cols-2 gap-3">
              {TEMPS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setTemps(opt);
                    setStep(3);
                  }}
                  className={`flex items-center justify-center gap-2 px-4 py-6 rounded-xl border font-semibold transition-colors ${
                    temps === opt
                      ? "border-palm bg-palm/5"
                      : "border-ink/10 bg-white hover:border-ink/25"
                  }`}
                >
                  <Clock3 size={16} className="text-palm" />
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Étape 3 : Envie */}
        {step === 3 && (
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-extrabold mb-8">
              Quelle est ton envie ?
            </h1>
            <div className="flex flex-col gap-3">
              {ENVIE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setEnvie(opt.value);
                    setStep(4);
                  }}
                  className={`flex items-center gap-3 text-left px-5 py-4 rounded-xl border transition-colors ${
                    envie === opt.value
                      ? "border-palm bg-palm/5"
                      : "border-ink/10 bg-white hover:border-ink/25"
                  }`}
                >
                  <opt.icon size={22} className="text-palm shrink-0" />
                  <span className="font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Étape 4 : Ingrédients */}
        {step === 4 && (
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-extrabold mb-1">
              Qu&apos;as-tu en cuisine ?
            </h1>
            <p className="text-sm text-ink/50 mb-6">
              Coche ce que tu as déjà. Rien d&apos;obligatoire.
            </p>

            <div className="flex flex-col gap-6">
              {ingredientCategories.map((cat) => (
                <div key={cat.name}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-2.5">
                    {cat.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((item) => {
                      const active = selected.includes(item);
                      return (
                        <button
                          key={item}
                          onClick={() => toggleIngredient(item)}
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

              {/* Ajout personnalisé */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-2.5">
                  Autre chose ?
                </p>
                <div className="flex gap-2">
                  <input
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && addCustomIngredient()
                    }
                    placeholder="Ex : akassa..."
                    className="flex-1 px-4 py-2.5 rounded-full border border-ink/15 bg-white text-sm focus:outline-none focus:border-palm"
                  />
                  <button
                    onClick={addCustomIngredient}
                    className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-ink/5 hover:bg-ink/10 text-ink"
                    aria-label="Ajouter"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {selected.filter(
                  (i) => !ingredientCategories.some((c) => c.items.includes(i)),
                ).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selected
                      .filter(
                        (i) =>
                          !ingredientCategories.some((c) =>
                            c.items.includes(i),
                          ),
                      )
                      .map((item) => (
                        <span
                          key={item}
                          className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-full bg-palm text-paper"
                        >
                          {item}
                          <button onClick={() => toggleIngredient(item)}>
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bloc conditionnel bas de page */}
            <div className="mt-8 pt-6 border-t border-ink/10">
              {hasIngredients ? (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={openToComplete}
                    onChange={(e) => setOpenToComplete(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-palm"
                  />
                  <span className="text-sm text-ink/70">
                    Je suis aussi prêt(e) à faire quelques courses pour
                    compléter
                  </span>
                </label>
              ) : (
                <div>
                  <p className="text-sm font-semibold mb-3">
                    Rien coché — prêt(e) à faire quelques courses ?
                  </p>
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => setReadyToShop("oui")}
                      className={`flex-1 px-4 py-2.5 rounded-full border font-medium text-sm ${
                        readyToShop === "oui"
                          ? "border-palm bg-palm/5"
                          : "border-ink/15 bg-white"
                      }`}
                    >
                      Oui
                    </button>
                    <button
                      onClick={() => {
                        setReadyToShop("non");
                        setBudget(null);
                      }}
                      className={`flex-1 px-4 py-2.5 rounded-full border font-medium text-sm ${
                        readyToShop === "non"
                          ? "border-palm bg-palm/5"
                          : "border-ink/15 bg-white"
                      }`}
                    >
                      Non
                    </button>
                  </div>

                  {readyToShop === "oui" && (
                    <div className="flex flex-col gap-2">
                      {BUDGET_OPTIONS.map((b) => (
                        <button
                          key={b.value}
                          onClick={() => setBudget(b.value)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium ${
                            budget === b.value
                              ? "border-palm bg-palm/5"
                              : "border-ink/15 bg-white"
                          }`}
                        >
                          {b.label}
                          {b.hint && (
                            <span className="text-xs text-ink/40">
                              {b.hint}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {readyToShop === "non" && (
                    <p className="text-xs text-ink/50">
                      Pas de souci — coche au moins un ingrédient pour une
                      recette réalisable maintenant.
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              disabled={!canContinueStep4}
              onClick={goToResult}
              className="mt-8 w-full flex items-center justify-center gap-2 bg-piment text-white font-semibold px-6 py-3.5 rounded-full hover:bg-piment-dark transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              Voir ma recette
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
