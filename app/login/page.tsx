// app/login/page.tsx
import { redirect } from "next/navigation";

export default function LoginPage() {
  // During the public playtest, skip login entirely
  redirect("/hub");
}
