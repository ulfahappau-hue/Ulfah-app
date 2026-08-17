import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";
import { Card } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";

export default async function LoginPage() {
  const { t } = await getDictionary();
  return (
    <Card className="mx-auto max-w-md">
      <h1 className="font-display text-3xl text-forest">{t.auth.loginTitle}</h1>
      <p className="mt-2 mb-6 text-sm text-forest/70">{t.tagline}</p>
      <LoginForm t={t} />
      <p className="mt-6 text-sm text-forest/80">
        {t.auth.needAccount}{" "}
        <Link href="/register" className="underline">
          {t.nav.register}
        </Link>
      </p>
    </Card>
  );
}
