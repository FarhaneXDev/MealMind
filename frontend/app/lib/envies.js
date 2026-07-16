import { BatteryLow, Coins, Zap, UtensilsCrossed, Dices, ChefHat } from "lucide-react";

export const ENVIE_OPTIONS = [
  { value: "simple", label: "Un truc simple et rapide", icon: BatteryLow },
  { value: "economique", label: "Je fais attention à mon budget", icon: Coins },
  { value: "energetique", label: "J'ai besoin d'énergie", icon: Zap },
  { value: "plaisir", label: "Je me fais plaisir aujourd'hui", icon: UtensilsCrossed },
  { value: "surprise", label: "Surprends-moi", icon: Dices },
  { value: "gourmand", label: "Un plat riche et copieux", icon: ChefHat },
];