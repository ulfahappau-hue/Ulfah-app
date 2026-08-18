import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth-forms";
import { Card } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { t } = await getDictionary();
  const { token, error } = await searchParams;
  return (
    <Card className="mx-auto max-w-md">
      <h1 className="font-display text-3xl text-forest">{t.auth.resetTitle}</h1>
      <p className="mt-2 mb-6 text-sm text-forest/70">{t.tagline}</p>
      {error || !token ? (
        <p className="text-sm text-rose-800">
          This reset link is invalid or expired. Request a new one from the sign-in page.
        </p>
      ) : (
        <ResetPasswordForm t={t} token={token} />
      )}
      <p className="mt-6 text-sm text-forest/80">
        <Link href="/login" className="underline">
          {t.auth.backToLogin}
        </Link>
      </p>
    </Card>
  );
}
