"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";

const CATEGORIES = [
  { value: "cereales", label: "Céréales & féculents" },
  { value: "proteines", label: "Protéines" },
  { value: "legumes", label: "Légumes" },
  { value: "basiques", label: "Basiques & sauces" },
  { value: "autre", label: "Autre" },
];

export default function AdminIngredients() {
  const [ingredients, setIngredients] = useState([]);
  const [nom, setNom] = useState("");
  const [categorie, setCategorie] = useState("autre");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const fetchIngredients = async () => {
    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/backstage/ingredients/`,
      {
        credentials: "include",
      },
    );
    if (res.ok) setIngredients(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!nom.trim()) return;
    setSaving(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/backstage/ingredients/`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nom.trim(), categorie }),
      },
    );
    if (res.ok) {
      setNom("");
      fetchIngredients();
    }
    setSaving(false);
  };

  const askDelete = (ingredient) => setToDelete(ingredient);

  const confirmDelete = async () => {
  if (!toDelete) return;
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/backstage/ingredients/${toDelete.id}/`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  setIngredients((prev) => prev.filter((i) => i.id !== toDelete.id));
  setToDelete(null);
};

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Ingrédients</h1>
        <p className="text-sm text-ink/60 mt-1">
          {ingredients.length} ingrédient(s) en base
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="bg-white border border-ink/10 rounded-xl p-4 flex gap-2"
      >
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom de l'ingrédient"
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-ink/15 text-sm focus:outline-none focus:border-palm"
        />
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-ink/15 text-sm bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={saving}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-palm text-paper hover:bg-palm-dark disabled:opacity-60"
        >
          <Plus size={18} />
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-ink/40">Chargement...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {CATEGORIES.map((cat) => {
            const items = ingredients.filter((i) => i.categorie === cat.value);
            if (items.length === 0) return null;
            return (
              <div key={cat.value}>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-2">
                  {cat.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((i) => (
                    <span
                      key={i.id}
                      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-white border border-ink/10"
                    >
                      {i.nom}
                      <button
                        onClick={() => askDelete(i)}
                        aria-label={`Supprimer ${i.nom}`}
                      >
                        <Trash2
                          size={12}
                          className="text-ink/30 hover:text-piment"
                        />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer cet ingrédient ?"
        message={
          toDelete
            ? `"${toDelete.nom}" sera retiré définitivement du catalogue.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
