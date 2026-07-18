"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  ChefHat,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Wheat,
} from "lucide-react";

const TABS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/recettes", label: "Recettes", icon: BookOpen },
  { href: "/admin/ingredients", label: "Ingrédients", icon: Wheat },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/moi/`,
          {
            credentials: "include",
          },
        );
        if (!res.ok) throw new Error("non authentifié");
        const user = await res.json();
        if (!user.is_staff) throw new Error("non autorisé");
        setAuthorized(true);
      } catch {
        router.replace("/");
      } finally {
        setChecking(false);
      }
    };
    checkAccess();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(
      async () => {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/rafraichir/`, {
            method: "POST",
            credentials: "include",
          });
        } catch {}
      },
      20 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/deconnexion/`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-sm text-ink/40">Vérification...</p>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 bg-ink text-paper">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-extrabold text-lg"
          >
            <ChefHat size={20} />
            MealMind · Backstage
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-paper/70 hover:text-paper"
          >
            <LogOut size={15} />
            Déconnexion
          </button>
        </div>
        <nav className="max-w-3xl mx-auto px-5 sm:px-8 flex gap-1">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? "border-mais text-paper"
                    : "border-transparent text-paper/50 hover:text-paper"
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-8">{children}</main>
    </div>
  );
}
