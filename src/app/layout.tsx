import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "4ª Copa NTP | Não Tem Passe", template: "%s | Copa NTP" },
  description: "Site oficial da 4ª Copa NTP de vôlei: jogos, resultados, classificação, equipes e regulamento.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#071120", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
