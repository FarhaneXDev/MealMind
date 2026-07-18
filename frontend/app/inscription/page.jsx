"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ArrowRight,
  History,
  CalendarDays,
  ShoppingBasket,
} from "lucide-react";
import AuthShell from "@/components/AuthShell";

const AVANTAGES = [
  { icon: History, label: "Historique de tes recettes" },
  { icon: CalendarDays, label: "Calendrier et menu de la semaine" },
  { icon: ShoppingBasket, label: "Garde-manger personnalisé" },
];

export default function Inscription() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nom || !email || !password || !confirm) {
      setError("Tous les champs sont requis.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/inscription/`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: nom,
            email,
            password,
            password2: confirm,
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const premierMessage = Object.values(data)?.[0];
        setError(
          Array.isArray(premierMessage)
            ? premierMessage[0]
            : "Une erreur est survenue.",
        );
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Impossible de contacter le serveur. Réessaie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Crée ton compte"
      subtitle="Gratuit. Deux minutes suffisent."
      footer={
        <span className="text-ink/60">
          Déjà un compte ?{" "}
          <Link
            href="/connexion"
            className="font-semibold text-palm hover:underline"
          >
            Se connecter
          </Link>
        </span>
      }
    >
      <ul className="flex flex-col gap-2 mb-6 pb-6 border-b border-ink/10">
        {AVANTAGES.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2.5 text-sm text-ink/70"
          >
            <Icon size={16} className="text-palm shrink-0" />
            {label}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
            Nom d&apos;utilisateur
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom d'utilisateur"
            className="mt-1.5 w-full px-4 py-3 rounded-xl border border-ink/15 bg-white text-sm focus:outline-none focus:border-palm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mail@exemple.com"
            className="mt-1.5 w-full px-4 py-3 rounded-xl border border-ink/15 bg-white text-sm focus:outline-none focus:border-palm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
            Mot de passe
          </label>
          <div className="relative mt-1.5">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 caractères minimum"
              className="w-full px-4 py-3 pr-11 rounded-xl border border-ink/15 bg-white text-sm focus:outline-none focus:border-palm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
              aria-label="Afficher le mot de passe"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
            Confirmer le mot de passe
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="mt-1.5 w-full px-4 py-3 rounded-xl border border-ink/15 bg-white text-sm focus:outline-none focus:border-palm"
          />
        </div>

        {error && <p className="text-sm text-piment-dark">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-piment text-white font-semibold px-6 py-3.5 rounded-full hover:bg-piment-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Création..." : "Créer mon compte"}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>
    </AuthShell>
  );
}
