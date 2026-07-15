"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import AuthShell from "@/components/AuthShell";

export default function ReinitialiserMotDePasse({ params }) {
  const { uid, token } = use(params);
  const router = useRouter();

  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [succes, setSucces] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (motDePasse.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (motDePasse !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reinitialiser-mot-de-passe/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid, token, nouveau_mot_de_passe: motDePasse }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data.non_field_errors?.[0] || data.detail || "Ce lien a expiré ou est invalide."
        );
        return;
      }

      setSucces(true);
      setTimeout(() => router.push("/connexion"), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Nouveau mot de passe" subtitle="Choisis un mot de passe sécurisé.">
      {succes ? (
        <p className="text-sm text-palm font-medium">
          Mot de passe mis à jour ! Redirection vers la connexion...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Nouveau mot de passe
            </label>
            <div className="relative mt-1.5">
              <input
                type={showPwd ? "text" : "password"}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="8 caractères minimum"
                className="w-full px-4 py-3 pr-11 rounded-xl border border-ink/15 bg-white text-sm focus:outline-none focus:border-palm"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
              >
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Confirmer
            </label>
            <input
              type={showPwd ? "text" : "password"}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-ink/15 bg-white text-sm focus:outline-none focus:border-palm"
            />
          </div>

          {error && <p className="text-sm text-piment-dark">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-piment text-white font-semibold px-6 py-3.5 rounded-full hover:bg-piment-dark transition-colors disabled:opacity-60"
          >
            {loading ? "Enregistrement..." : "Réinitialiser"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      )}
    </AuthShell>
  );
}