import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MemberTabs } from "@/components/chrome";
import { Button, Card } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";
import { requireSession } from "@/lib/session";
import { deleteAccountAction } from "@/actions/profile";

export default async function SettingsPage() {
  const session = await requireSession();
  const { t } = await getDictionary();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-forest">{t.nav.settings}</h1>
      <Card>
        <p className="text-sm text-forest/80">Signed in as {session.user.email}</p>
        <p className="mt-2 text-sm">Status: {session.user.memberStatus}</p>
      </Card>
      <Card>
        <h2 className="font-display text-xl text-forest">Delete account</h2>
        <p className="mt-2 text-sm text-forest/80">
          This removes your profile from matching and wipes identifying contact details.
        </p>
        <form
          className="mt-4"
          action={async () => {
            "use server";
            await deleteAccountAction();
            await auth.api.signOut({ headers: await headers() });
            redirect("/");
          }}
        >
          <Button type="submit" variant="danger">
            Delete my account
          </Button>
        </form>
      </Card>
      <MemberTabs t={t} role={session.user.role} />
    </div>
  );
}
