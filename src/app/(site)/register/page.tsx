import { getTurnstileConfig } from "@/lib/turnstile";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage() {
  const turnstile = await getTurnstileConfig();
  return <RegisterForm turnstileSiteKey={turnstile.enabled ? turnstile.siteKey : ""} />;
}
