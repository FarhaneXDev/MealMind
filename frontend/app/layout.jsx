import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "MealMind",
  description: "MealMind is a web application that helps you plan and organize your meals efficiently. It provides personalized meal recommendations, nutritional information, and grocery lists to make meal planning easier and healthier.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body className={`${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}