import { ChefHat, Soup, UtensilsCrossed, Fish, Salad, Coffee, Flame, Sparkles } from "lucide-react";

export const AVATAR_OPTIONS = [
  { id: "chef-palm", icon: ChefHat, bg: "bg-palm" },
  { id: "soup-piment", icon: Soup, bg: "bg-piment" },
  { id: "utensils-mais", icon: UtensilsCrossed, bg: "bg-mais" },
  { id: "fish-palm", icon: Fish, bg: "bg-palm" },
  { id: "salad-piment", icon: Salad, bg: "bg-piment" },
  { id: "coffee-mais", icon: Coffee, bg: "bg-mais" },
  { id: "flame-palm", icon: Flame, bg: "bg-palm" },
  { id: "sparkles-piment", icon: Sparkles, bg: "bg-piment" },
];

export function getAvatar(id) {
  return AVATAR_OPTIONS.find((a) => a.id === id) || AVATAR_OPTIONS[0];
}