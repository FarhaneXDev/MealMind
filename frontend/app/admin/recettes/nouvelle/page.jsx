import RecetteForm from "../../components/RecetteForm";

export default function NouvelleRecette() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Nouvelle recette</h1>
        <p className="text-sm text-ink/60 mt-1">Ajoute une recette à la base.</p>
      </div>
      <RecetteForm />
    </div>
  );
}