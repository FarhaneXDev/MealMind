"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Flame,
  Heart,
  ShoppingBasket,
  CalendarDays,
} from "lucide-react";
import { useUser } from "../context/UserContext";

export default function DashboardHome() {
  const user = useUser();

  const [stats, setStats] = useState({
    recettesCuisinees: 0,
    favorisCount: 0,
    ingredientsEnStock: 0,
  });
  const [prochainMenu, setProchainMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, favRes, gmRes, menuRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/cuisine/historique/`, {
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/cuisine/favoris/`, {
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/cuisine/garde-manger/`, {
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/cuisine/menu/`, {
            credentials: "include",
          }),
        ]);

        let recettesCuisinees = 0;
        if (histRes.ok) {
          const historique = await histRes.json();
          const maintenant = new Date();
          recettesCuisinees = historique.filter((h) => {
            const date = new Date(h.cuisine_le);
            return (
              date.getMonth() === maintenant.getMonth() &&
              date.getFullYear() === maintenant.getFullYear()
            );
          }).length;
        }

        let favorisCount = 0;
        if (favRes.ok) {
          const favoris = await favRes.json();
          favorisCount = favoris.length;
        }

        let ingredientsEnStock = 0;
        if (gmRes.ok) {
          const gm = await gmRes.json();
          ingredientsEnStock = gm.ingredients?.length || 0;
        }

        let menuApercu = [];
        if (menuRes.ok) {
          const menu = await menuRes.json();
          menuApercu = (menu?.jours || []).filter((j) => j.recette).slice(0, 3);
        }

        setStats({ recettesCuisinees, favorisCount, ingredientsEnStock });
        setProchainMenu(menuApercu);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Bonjour, {user?.username} 👋
        </h1>
        <p className="text-sm text-ink/60 mt-1">
          Prêt(e) à décider quoi cuisiner aujourd&apos;hui ?
        </p>
      </div>

      <div className="bg-palm text-paper rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-paper/60">
            Suggestion rapide
          </p>
          <p className="mt-1 text-lg font-bold">
            Envie de cuisiner maintenant ?
          </p>
        </div>
        <Link
          href="/decouvrir"
          className="inline-flex items-center justify-center gap-2 bg-piment text-white font-semibold px-6 py-3 rounded-full hover:bg-piment-dark transition-colors shrink-0"
        >
          Trouver une recette
          <ArrowRight size={17} />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-ink/10 rounded-xl p-4 text-center">
          <Flame className="mx-auto text-piment" size={18} />
          <p className="mt-2 text-xl font-extrabold">
            {loading ? "—" : stats.recettesCuisinees}
          </p>
          <p className="text-[11px] text-ink/50 mt-0.5">recettes ce mois</p>
        </div>
        <div className="bg-white border border-ink/10 rounded-xl p-4 text-center">
          <Heart className="mx-auto text-piment" size={18} />
          <p className="mt-2 text-xl font-extrabold">
            {loading ? "—" : stats.favorisCount}
          </p>
          <p className="text-[11px] text-ink/50 mt-0.5">favoris</p>
        </div>
        <div className="bg-white border border-ink/10 rounded-xl p-4 text-center">
          <ShoppingBasket className="mx-auto text-piment" size={18} />
          <p className="mt-2 text-xl font-extrabold">
            {loading ? "—" : stats.ingredientsEnStock}
          </p>
          <p className="text-[11px] text-ink/50 mt-0.5">au garde-manger</p>
        </div>
      </div>

      <div className="bg-white border border-ink/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="flex items-center gap-2 text-sm font-bold">
            <CalendarDays size={16} className="text-palm" />
            Ton menu
          </p>
          <Link
            href="/dashboard/calendrier"
            className="text-xs font-semibold text-palm hover:underline"
          >
            Voir tout
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-ink/40">Chargement...</p>
        ) : prochainMenu.length === 0 ? (
          <p className="text-sm text-ink/40">
            Aucun menu généré pour l&apos;instant.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {prochainMenu.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-ink/50">
                  {m.jour_nom} · {m.repas_nom}
                </span>
                <span className="font-medium truncate ml-3">
                  {m.recette_titre}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
