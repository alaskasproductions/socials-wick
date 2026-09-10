import { getTurnstileConfig } from "@/lib/turnstile";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default async function ForgotPasswordPage() {
  const turnstile = await getTurnstileConfig();
  return <ForgotPasswordForm turnstileSiteKey={turnstile.enabled ? turnstile.siteKey : ""} />;
}
