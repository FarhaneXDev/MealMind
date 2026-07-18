"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getAvatar } from "../lib/avatars";
import {
  Sparkles,
  History,
  CalendarDays,
  ShoppingBasket,
  Heart,
  ChevronDown,
  LogOut,
  UserRound,
} from "lucide-react";
import { UserProvider } from "../context/UserContext";

const TABS = [
  { href: "/dashboard", label: "Accueil", icon: Sparkles },
  { href: "/dashboard/historique", label: "Historique", icon: History },
  { href: "/dashboard/calendrier", label: "Calendrier", icon: CalendarDays },
  {
    href: "/dashboard/garde-manger",
    label: "Garde-manger",
    icon: ShoppingBasket,
  },
  { href: "/dashboard/favoris", label: "Favoris", icon: Heart },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/moi/`,
          {
            credentials: "include",
          },
        );
        if (!res.ok) throw new Error("non authentifié");
        setUser(await res.json());
      } catch {
        router.replace("/connexion");
      } finally {
        setChecking(false);
      }
    };
    checkSession();
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
        <p className="text-sm text-ink/40">Chargement...</p>
      </div>
    );
  }

  if (!user) return null;

  const initiale = user.username?.charAt(0).toUpperCase() || "?";

  return (
    <UserProvider user={user} setUser={setUser}>
      <div className="min-h-screen bg-paper text-ink">
        <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-ink/10">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="font-extrabold text-lg tracking-tight"
            >
              MealMind
            </Link>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-ink/10 bg-white hover:border-ink/25 transition-colors"
              >
                {(() => {
                  const { icon: Icon, bg } = getAvatar(user.avatar);
                  return (
                    <span
                      className={`w-7 h-7 rounded-full ${bg} text-paper flex items-center justify-center`}
                    >
                      <Icon size={14} />
                    </span>
                  );
                })()}
                <ChevronDown
                  size={15}
                  className={`text-ink/50 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-ink/10 rounded-xl shadow-lg py-1.5 z-40">
                  <Link
                    href="/dashboard/profil"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink/80 hover:bg-paper"
                  >
                    <UserRound size={16} />
                    Mon profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-piment-dark hover:bg-paper"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>

          <nav className="max-w-5xl mx-auto px-5 sm:px-8 flex gap-1 overflow-x-auto no-scrollbar pb-px">
            {TABS.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    active
                      ? "border-piment text-ink"
                      : "border-transparent text-ink/50 hover:text-ink"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="max-w-5xl mx-auto px-5 sm:px-8 py-8">{children}</main>
      </div>
    </UserProvider>
  );
}
