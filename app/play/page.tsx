// app/play/page.tsx
import NextDynamic from "next/dynamic";

// Dynamically import client-only PlayClient
const PlayClient = NextDynamic(() => import("./PlayClient"), { ssr: false });

// Force runtime rendering
export const dynamic = "force-dynamic";

export default function PlayPage() {
  return <PlayClient />;
}
