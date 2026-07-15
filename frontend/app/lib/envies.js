import { BatteryLow, Coins, Zap, UtensilsCrossed, Dices } from "lucide-react";

export const ENVIE_OPTIONS = [
  { value: "fatigue", label: "Je suis fatigué(e), un truc simple", icon: BatteryLow },
  { value: "economique", label: "Je fais attention à mon budget", icon: Coins },
  { value: "energetique", label: "J'ai besoin d'énergie", icon: Zap },
  { value: "plaisir", label: "Je me fais plaisir aujourd'hui", icon: UtensilsCrossed },
  { value: "surprise", label: "Surprends-moi", icon: Dices },
];