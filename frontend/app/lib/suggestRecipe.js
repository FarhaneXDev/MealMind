import { recipes } from "./recipes";

const TEMPS_LIMITES = {
  "<10 min": 10,
  "10-20 min": 20,
  "20-30 min": 30,
  "Peu importe": Infinity,
};

function scoreIngredientMatch(recipe, selectedIngredients) {
  if (selectedIngredients.length === 0) return 0;
  const possedes = recipe.ingredients.filter((ing) =>
    selectedIngredients.includes(ing.nom)
  );
  const essentielsPossedes = possedes.filter((i) => i.essentiel).length;
  // les ingrédients essentiels comptent double dans le score
  return essentielsPossedes * 2 + possedes.length;
}

export function suggestRecipe({
  repas,
  temps,
  envie,
  selectedIngredients = [],
  scenario, // 'avec' | 'complete' | 'courses' | 'vide'
  budget, // 'petit' | 'moyen' | 'peu_importe' | null
  excludedIds = [],
}) {
  const tempsMax = TEMPS_LIMITES[temps] ?? Infinity;

  // 1. Filtre obligatoire : repas + pas déjà proposée
  let pool = recipes.filter(
    (r) => r.repas.includes(repas) && !excludedIds.includes(r.id)
  );

  // 2. Filtre temps, avec repli si ça vide le pool
  const avecTemps = pool.filter((r) => r.dureeMin <= tempsMax);
  if (avecTemps.length > 0) pool = avecTemps;

  // 3. Filtre envie, avec repli
  if (envie) {
    const avecEnvie = pool.filter((r) => r.envie.includes(envie));
    if (avecEnvie.length > 0) pool = avecEnvie;
  }

  // 4. Filtre budget, seulement si on est dans le scénario "courses"
  if (scenario === "courses" && budget === "petit") {
    const avecBudget = pool.filter((r) => r.budgetFCFA <= 1000);
    if (avecBudget.length > 0) pool = avecBudget;
  }

  if (pool.length === 0) pool = recipes.filter((r) => !excludedIds.includes(r.id));
  if (pool.length === 0) pool = recipes;

  // 5. On classe par nombre d'ingrédients déjà possédés
  const scored = pool
    .map((r) => ({ ...r, _score: scoreIngredientMatch(r, selectedIngredients) }))
    .sort((a, b) => b._score - a._score);

  // 6. Un peu d'aléatoire parmi les meilleurs scores, pour ne pas être trop prévisible
  const topScore = scored[0]._score;
  const top = scored.filter((r) => r._score === topScore);
  return top[Math.floor(Math.random() * top.length)];
}