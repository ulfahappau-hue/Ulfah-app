import { resendVerificationAction } from "@/actions/auth";
import { Button, Card } from "@/components/ui";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const session = await getSession();
  if (session?.user.emailVerified) redirect("/verify-phone");
  const { email } = await searchParams;
  const shown = session?.user.email ?? email;

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="font-display text-3xl text-forest">Verify your email</h1>
      <p className="mt-3 text-forest/80">
        We sent a link{shown ? <> to <strong>{shown}</strong></> : ""}. Open it on this phone to
        continue. In local development the link is printed in the server log.
      </p>
      <form action={resendVerificationAction} className="mt-6">
        <input type="hidden" name="email" value={shown ?? ""} />
        <Button type="submit" variant="secondary" className="w-full">
          Resend email
        </Button>
      </form>
    </Card>
  );
}
