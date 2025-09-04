import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/header";

export const metadata: Metadata = {
  title: "OCR Serur",
  description: "Extraia textos de PDFs e imagens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
