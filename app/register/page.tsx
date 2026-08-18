import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";
import { Card } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { t } = await getDictionary();
  const { invite } = await searchParams;
  return (
    <Card className="mx-auto max-w-md">
      <h1 className="font-display text-3xl text-forest">{t.auth.registerTitle}</h1>
      <p className="mt-2 mb-6 text-sm text-forest/70">
        Ulfah is invite-only. Ask a matchmaker for a code.
      </p>
      <RegisterForm t={t} invite={invite} />
      <p className="mt-6 text-sm text-forest/80">
        {t.auth.haveAccount}{" "}
        <Link href="/login" className="underline">
          {t.nav.login}
        </Link>
      </p>
    </Card>
  );
}
