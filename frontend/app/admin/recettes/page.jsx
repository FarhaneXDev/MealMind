"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil, Clock3 } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";

export default function AdminRecettes() {
  const [recettes, setRecettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const [recherche, setRecherche] = useState("");

  const fetchRecettes = async () => {
    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/backstage/recettes/`,
      {
        credentials: "include",
      },
    );
    if (res.ok) setRecettes(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchRecettes();
  }, []);

  const askDelete = (recette) => setToDelete(recette);

  const confirmDelete = async () => {
    if (!toDelete) return;
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/backstage/recettes/${toDelete.id}/`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    setRecettes((prev) => prev.filter((r) => r.id !== toDelete.id));
    setToDelete(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Recettes</h1>
          <p className="text-sm text-ink/60 mt-1">
            {recettes.length} recette(s) en base
          </p>
        </div>
        <Link
          href="/admin/recettes/nouvelle"
          className="flex items-center gap-2 bg-piment text-white font-semibold px-4 py-2.5 rounded-full hover:bg-piment-dark transition-colors text-sm"
        >
          <Plus size={16} />
          Nouvelle recette
        </Link>
      </div>

      <input
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        placeholder="Rechercher une recette..."
        className="w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-white text-sm focus:outline-none focus:border-palm"
      />

      {loading ? (
        <p className="text-sm text-ink/40">Chargement...</p>
      ) : recettes.length === 0 ? (
        <div className="bg-white border border-dashed border-ink/20 rounded-xl p-8 text-center">
          <p className="text-sm text-ink/50">
            Aucune recette pour l&apos;instant.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {recettes
            .filter((r) =>
              r.titre.toLowerCase().includes(recherche.toLowerCase()),
            )
            .map((r) => (
              <li
                key={r.id}
                className="bg-white border border-ink/10 rounded-xl px-4 py-3.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate">{r.titre}</p>
                  <p className="flex items-center gap-1.5 text-xs text-ink/50 mt-0.5">
                    <Clock3 size={12} />
                    {r.duree_min} min · {r.difficulte} · {r.budget_fcfa} FCFA
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/admin/recettes/${r.id}`}
                    className="p-2 rounded-full hover:bg-paper text-ink/60"
                    aria-label="Modifier"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => askDelete(r)}
                    className="p-2 rounded-full hover:bg-paper text-piment"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
        </ul>
      )}
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer cette recette ?"
        message={
          toDelete
            ? `"${toDelete.titre}" sera retirée définitivement de la base.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
