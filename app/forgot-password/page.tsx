import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth-forms";
import { Card } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";

export default async function ForgotPasswordPage() {
  const { t } = await getDictionary();
  return (
    <Card className="mx-auto max-w-md">
      <h1 className="font-display text-3xl text-forest">{t.auth.forgotTitle}</h1>
      <p className="mt-2 mb-6 text-sm text-forest/70">{t.tagline}</p>
      <ForgotPasswordForm t={t} />
      <p className="mt-6 text-sm text-forest/80">
        <Link href="/login" className="underline">
          {t.auth.backToLogin}
        </Link>
      </p>
    </Card>
  );
}
