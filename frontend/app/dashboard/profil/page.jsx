"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { useUser } from "../../context/UserContext";

export default function Profil() {
  const router = useRouter();
  const user = useUser();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);
  const [infoError, setInfoError] = useState("");

  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmMdp, setConfirmMdp] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (user) {
      setNom(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    setInfoSaved(false);
    setInfoError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/moi/`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: nom, email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setInfoError(Object.values(data)?.[0]?.[0] || "Impossible d'enregistrer.");
        return;
      }
      setInfoSaved(true);
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    setPwdError("");
    setPwdSaved(false);

    if (!ancienMdp || !nouveauMdp || !confirmMdp) {
      setPwdError("Tous les champs sont requis.");
      return;
    }
    if (nouveauMdp.length < 8) {
      setPwdError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (nouveauMdp !== confirmMdp) {
      setPwdError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSavingPwd(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/changer-mot-de-passe/`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ancien_mot_de_passe: ancienMdp,
            nouveau_mot_de_passe: nouveauMdp,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPwdError(data.ancien_mot_de_passe?.[0] || data.detail || "Une erreur est survenue.");
        return;
      }
      setPwdSaved(true);
      setAncienMdp("");
      setNouveauMdp("");
      setConfirmMdp("");
    } finally {
      setSavingPwd(false);
    }
  };

  const handleDelete = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/supprimer-compte/`, {
      method: "DELETE",
      credentials: "include",
    });
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Mon profil</h1>
        <p className="text-sm text-ink/60 mt-1">Gère tes informations et ton compte.</p>
      </div>

      <form
        onSubmit={handleSaveInfo}
        className="bg-white border border-ink/10 rounded-xl p-5 flex flex-col gap-4"
      >
        <p className="flex items-center gap-2 text-sm font-bold">
          <User size={16} className="text-palm" />
          Informations personnelles
        </p>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
            Nom
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => {
              setNom(e.target.value);
              setInfoSaved(false);
            }}
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-white text-sm focus:outline-none focus:border-palm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
            Email
          </label>
          <div className="relative mt-1.5">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setInfoSaved(false);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink/15 bg-white text-sm focus:outline-none focus:border-palm"
            />
          </div>
        </div>

        {infoError && <p className="text-sm text-piment-dark">{infoError}</p>}

        <div className="flex items-center gap-3 mt-1">
          <button
            type="submit"
            disabled={savingInfo}
            className="flex items-center justify-center gap-2 bg-palm text-paper font-semibold px-5 py-2.5 rounded-full hover:bg-palm-dark transition-colors disabled:opacity-60 text-sm"
          >
            <Save size={15} />
            {savingInfo ? "Enregistrement..." : "Enregistrer"}
          </button>
          {infoSaved && (
            <span className="text-xs text-palm font-medium">Modifications enregistrées</span>
          )}
        </div>
      </form>

      <form
        onSubmit={handleChangePwd}
        className="bg-white border border-ink/10 rounded-xl p-5 flex flex-col gap-4"
      >
        <p className="flex items-center gap-2 text-sm font-bold">
          <Lock size={16} className="text-palm" />
          Changer le mot de passe
        </p>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
            Mot de passe actuel
          </label>
          <input
            type={showPwd ? "text" : "password"}
            value={ancienMdp}
            onChange={(e) => setAncienMdp(e.target.value)}
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-white text-sm focus:outline-none focus:border-palm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
            Nouveau mot de passe
          </label>
          <div className="relative mt-1.5">
            <input
              type={showPwd ? "text" : "password"}
              value={nouveauMdp}
              onChange={(e) => setNouveauMdp(e.target.value)}
              placeholder="8 caractères minimum"
              className="w-full px-4 py-2.5 pr-11 rounded-xl border border-ink/15 bg-white text-sm focus:outline-none focus:border-palm"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
              aria-label="Afficher le mot de passe"
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink/40">
            Confirmer le nouveau mot de passe
          </label>
          <input
            type={showPwd ? "text" : "password"}
            value={confirmMdp}
            onChange={(e) => setConfirmMdp(e.target.value)}
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-white text-sm focus:outline-none focus:border-palm"
          />
        </div>

        {pwdError && <p className="text-sm text-piment-dark">{pwdError}</p>}

        <div className="flex items-center gap-3 mt-1">
          <button
            type="submit"
            disabled={savingPwd}
            className="flex items-center justify-center gap-2 bg-palm text-paper font-semibold px-5 py-2.5 rounded-full hover:bg-palm-dark transition-colors disabled:opacity-60 text-sm"
          >
            <Save size={15} />
            {savingPwd ? "Enregistrement..." : "Changer le mot de passe"}
          </button>
          {pwdSaved && (
            <span className="text-xs text-palm font-medium">Mot de passe mis à jour</span>
          )}
        </div>
      </form>

      <div className="bg-white border border-piment/30 rounded-xl p-5 flex flex-col gap-3">
        <p className="flex items-center gap-2 text-sm font-bold text-piment-dark">
          <Trash2 size={16} />
          Supprimer mon compte
        </p>
        <p className="text-xs text-ink/50">
          Cette action est définitive. Ton historique, tes favoris et ton garde-manger
          seront supprimés.
        </p>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="self-start text-sm font-semibold text-piment hover:underline"
          >
            Supprimer mon compte
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className="text-sm font-semibold bg-piment text-white px-4 py-2 rounded-full hover:bg-piment-dark transition-colors"
            >
              Confirmer la suppression
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-sm text-ink/50 hover:text-ink"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
}