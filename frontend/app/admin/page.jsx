"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Wheat, Users, AlertTriangle, Flame, Heart, Clock3, Plus,
} from "lucide-react";

const ENVIE_LABELS = {
  fatigue: "Fatigué(e)",
  economique: "Économique",
  energetique: "Énergétique",
  plaisir: "Plaisir",
  surprise: "Surprise",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/backstage/stats/`, {
        credentials: "include",
      });
      if (res.ok) setStats(await res.json());
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <p className="text-sm text-ink/40">Chargement...</p>;
  if (!stats) return <p className="text-sm text-ink/50">Impossible de charger les statistiques.</p>;

  const maxRepas = Math.max(...stats.recettes_par_repas.map((r) => r.count), 1);
  const maxEnvie = Math.max(...stats.recettes_par_envie.map((e) => e.count), 1);

  const alertes = [
    stats.qualite.recettes_sans_envie > 0 &&
      `${stats.qualite.recettes_sans_envie} recette(s) sans aucune envie associée`,
    stats.qualite.recettes_sans_ingredient > 0 &&
      `${stats.qualite.recettes_sans_ingredient} recette(s) sans aucun ingrédient`,
    stats.qualite.recettes_sans_etape > 0 &&
      `${stats.qualite.recettes_sans_etape} recette(s) sans étapes de préparation`,
    stats.qualite.ingredients_orphelins.length > 0 &&
      `${stats.qualite.ingredients_orphelins.length} ingrédient(s) non utilisé(s) dans une recette`,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-ink/60 mt-1">Vue d&apos;ensemble de MealMind.</p>
        </div>
        <Link
          href="/admin/recettes/nouvelle"
          className="flex items-center gap-2 bg-piment text-white font-semibold px-4 py-2.5 rounded-full hover:bg-piment-dark transition-colors text-sm"
        >
          <Plus size={16} />
          Nouvelle recette
        </Link>
      </div>

      {/* Totaux */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-ink/10 rounded-xl p-4 text-center">
          <BookOpen className="mx-auto text-palm" size={20} />
          <p className="mt-2 text-2xl font-extrabold">{stats.totaux.recettes}</p>
          <p className="text-[11px] text-ink/50 mt-0.5">recettes</p>
        </div>
        <div className="bg-white border border-ink/10 rounded-xl p-4 text-center">
          <Wheat className="mx-auto text-palm" size={20} />
          <p className="mt-2 text-2xl font-extrabold">{stats.totaux.ingredients}</p>
          <p className="text-[11px] text-ink/50 mt-0.5">ingrédients</p>
        </div>
        <div className="bg-white border border-ink/10 rounded-xl p-4 text-center">
          <Users className="mx-auto text-palm" size={20} />
          <p className="mt-2 text-2xl font-extrabold">{stats.totaux.utilisateurs}</p>
          <p className="text-[11px] text-ink/50 mt-0.5">utilisateurs</p>
        </div>
      </div>

      {/* Alertes qualité */}
      {alertes.length > 0 && (
        <div className="bg-piment/5 border border-piment/20 rounded-xl p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-piment-dark mb-3">
            <AlertTriangle size={16} />
            À vérifier
          </p>
          <ul className="flex flex-col gap-1.5">
            {alertes.map((a, i) => (
              <li key={i} className="text-sm text-ink/70">• {a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Répartition par repas */}
      <div className="bg-white border border-ink/10 rounded-xl p-5">
        <p className="text-sm font-bold mb-4">Recettes par repas</p>
        <div className="flex flex-col gap-3">
          {stats.recettes_par_repas.map((r) => (
            <div key={r.nom} className="flex items-center gap-3">
              <span className="text-xs text-ink/60 w-28 shrink-0">{r.nom}</span>
              <div className="flex-1 h-2 rounded-full bg-paper overflow-hidden">
                <div
                  className="h-full bg-palm rounded-full"
                  style={{ width: `${(r.count / maxRepas) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold w-6 text-right">{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Répartition par envie */}
      <div className="bg-white border border-ink/10 rounded-xl p-5">
        <p className="text-sm font-bold mb-4">Recettes par envie</p>
        <div className="flex flex-col gap-3">
          {stats.recettes_par_envie.map((e) => (
            <div key={e.code} className="flex items-center gap-3">
              <span className="text-xs text-ink/60 w-28 shrink-0">
                {ENVIE_LABELS[e.code] || e.code}
              </span>
              <div className="flex-1 h-2 rounded-full bg-paper overflow-hidden">
                <div
                  className="h-full bg-mais rounded-full"
                  style={{ width: `${(e.count / maxEnvie) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold w-6 text-right">{e.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Recettes populaires */}
        <div className="bg-white border border-ink/10 rounded-xl p-5">
          <p className="flex items-center gap-2 text-sm font-bold mb-3">
            <Flame size={15} className="text-piment" />
            Les plus cuisinées
          </p>
          {stats.recettes_populaires.length === 0 ? (
            <p className="text-xs text-ink/40">Pas encore de données.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.recettes_populaires.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <Link href={`/admin/recettes/${r.id}`} className="truncate hover:underline">
                    {r.titre}
                  </Link>
                  <span className="text-xs text-ink/50 shrink-0">{r.nb_cuisine}×</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Favoris */}
        <div className="bg-white border border-ink/10 rounded-xl p-5">
          <p className="flex items-center gap-2 text-sm font-bold mb-3">
            <Heart size={15} className="text-piment" />
            Les plus ajoutées en favoris
          </p>
          {stats.recettes_favorites.length === 0 ? (
            <p className="text-xs text-ink/40">Pas encore de données.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.recettes_favorites.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <Link href={`/admin/recettes/${r.id}`} className="truncate hover:underline">
                    {r.titre}
                  </Link>
                  <span className="text-xs text-ink/50 shrink-0">{r.nb_favoris}×</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white border border-ink/10 rounded-xl p-5">
        <p className="flex items-center gap-2 text-sm font-bold mb-3">
          <Clock3 size={15} className="text-palm" />
          Activité récente
        </p>
        {stats.activite_recente.length === 0 ? (
          <p className="text-xs text-ink/40">Aucune activité pour l&apos;instant.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.activite_recente.map((a) => (
              <li key={a.id} className="text-sm text-ink/70">
                <span className="font-semibold text-ink">{a.utilisateur__username}</span> a
                cuisiné <span className="font-medium">{a.recette__titre}</span>
                {a.repas__nom && ` (${a.repas__nom})`} ·{" "}
                <span className="text-xs text-ink/40">
                  {new Date(a.cuisine_le).toLocaleDateString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Nouveaux utilisateurs */}
      <div className="bg-white border border-ink/10 rounded-xl p-5">
        <p className="flex items-center gap-2 text-sm font-bold mb-3">
          <Users size={15} className="text-palm" />
          Derniers inscrits
        </p>
        {stats.utilisateurs_recents.length === 0 ? (
          <p className="text-xs text-ink/40">Aucun utilisateur pour l&apos;instant.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.utilisateurs_recents.map((u) => (
              <li key={u.id} className="flex items-center justify-between text-sm">
                <span>{u.username}</span>
                <span className="text-xs text-ink/40">
                  {new Date(u.date_joined).toLocaleDateString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}