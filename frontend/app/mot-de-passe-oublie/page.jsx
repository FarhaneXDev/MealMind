"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AuthShell from "@/components/AuthShell";

export default function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/mot-de-passe-oublie/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setEnvoye(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="On t'envoie un lien pour en choisir un nouveau."
      footer={
        <Link href="/connexion" className="text-ink/60 hover:text-ink">
          Retour à la connexion
        </Link>
      }
    >
      {envoye ? (
        <p className="text-sm text-ink/70">
          Si un compte existe avec cet email, un lien de réinitialisation vient d&apos;être
          envoyé. Vérifie ta boîte de réception (et tes spams).
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@exemple.com"
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-ink/15 bg-white text-sm focus:outline-none focus:border-palm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-piment text-white font-semibold px-6 py-3.5 rounded-full hover:bg-piment-dark transition-colors disabled:opacity-60"
          >
            {loading ? "Envoi..." : "Envoyer le lien"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      )}
    </AuthShell>
  );
}