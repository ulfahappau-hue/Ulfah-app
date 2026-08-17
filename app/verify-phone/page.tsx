import { PhoneVerifyForm } from "@/components/phone-form";
import { Card } from "@/components/ui";
import { requireSession } from "@/lib/session";

export default async function VerifyPhonePage() {
  await requireSession();
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
