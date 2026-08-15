import type { Metadata } from "next";
import { Newsreader, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
});

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
});

export const metadata: Metadata = {
  title: "Trace Studio",
  description: "A shared drafting table for diagrams and sketches.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${newsreader.variable} ${schibsted.variable} antialiased`}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#f4efe4",
              color: "#1c1917",
              border: "1px solid #d6cfc0",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
