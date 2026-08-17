import { Card } from "@/components/ui";

export default function BannedPage() {
  return (
    <Card className="mx-auto max-w-md">
      <h1 className="font-display text-3xl text-forest">Account unavailable</h1>
      <p className="mt-3 text-forest/80">
        This account cannot use Mawadda right now. If you believe this is a mistake, contact a
        matchmaker.
      </p>
    </Card>
  );
}
