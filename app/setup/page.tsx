import { redirect } from "next/navigation";
import { SetupForm } from "@/components/auth-forms";
import { Card } from "@/components/ui";
import { countOwners } from "@/lib/me";
import { APP_NAME } from "@/lib/constants";

export default async function SetupPage() {
  if (((await countOwners()) ?? 0) > 0) redirect("/login");
  return (
    <Card className="mx-auto max-w-md">
      <h1 className="font-display text-3xl text-forest">Set up {APP_NAME}</h1>
      <p className="mt-2 mb-6 text-sm text-forest/70">
        This first account is the owner. You can later promote matchmakers from the admin desk.
      </p>
      <SetupForm />
    </Card>
  );
}
