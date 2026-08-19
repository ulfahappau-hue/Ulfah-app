import { PhoneVerifyForm } from "@/components/phone-form";
import { Card } from "@/components/ui";
import { getMe, nextPathForUser } from "@/lib/me";
import { redirect } from "next/navigation";

export default async function VerifyPhonePage() {
  const me = await getMe();
  if (!me) redirect("/login");
  if (me.phoneVerified) {
    redirect(
      nextPathForUser({
        role: me.role,
        emailVerified: Boolean(me.emailVerified),
        phoneVerified: true,
        memberStatus: me.memberStatus,
      }),
    );
  }

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="font-display text-3xl text-forest">Verify your mobile</h1>
      <p className="mt-3 mb-6 text-forest/80">
        Australian mobiles only. We use SMS for the one-time code and later for match release.
      </p>
      <PhoneVerifyForm />
    </Card>
  );
}
