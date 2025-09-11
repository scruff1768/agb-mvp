// app/layout.tsx
import type { Metadata } from "next";
import { SupabaseProvider } from "@/lib/supabase-browser";

export const metadata: Metadata = {
  title: "Amica Guardian Battles",
  description: "Build decks, duel, and climb the Pathways of Amica.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0b0f16",
          color: "white",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
