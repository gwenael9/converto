import type { Metadata } from "next";
import { GraphQLProvider } from "./components/GraphQLProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Convertisseur de fichiers",
  description: "Convertissez vos fichiers PDF et DOCX facilement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <GraphQLProvider>{children}</GraphQLProvider>
      </body>
    </html>
  );
}
