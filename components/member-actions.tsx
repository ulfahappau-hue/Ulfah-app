"use client";

import { expressInterestAction, withdrawInterestAction } from "@/actions/interest";
import { reportUserAction } from "@/actions/report";
import { REPORT_REASONS } from "@/lib/constants";
import { reportLabels } from "@/lib/labels";
import { Button, Select, Textarea } from "@/components/ui";
import { useState } from "react";

export function InterestButtons({
  userId,
  sent,
  matched,
}: {
  userId: string;
  sent: boolean;
  matched: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  if (matched) {
    return <p className="text-sm text-forest">Mutual match — waiting for admin, or see Matches.</p>;
  }
  return (
    <div className="space-y-2">
      {sent ? (
        <form
          action={async () => {
            const result = await withdrawInterestAction(userId);
            setMessage(result.error ?? "Interest withdrawn.");
          }}
        >
          <Button type="submit" variant="secondary" className="w-full">
            Withdraw interest
          </Button>
        </form>
      ) : (
        <form
          action={async () => {
            const result = await expressInterestAction(userId);
            setMessage(result.error ?? (result.matched ? "It is mutual. Admin will review." : "Interest sent. They will not see this until they like you back."));
          }}
        >
          <Button type="submit" className="w-full">
            Express interest
          </Button>
        </form>
      )}
      {message ? <p className="text-sm text-forest/80">{message}</p> : null}
    </div>
  );
}

export function ReportForm({ userId }: { userId: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (done) return <p className="text-sm text-forest">Report received. Admin will review.</p>;
  return (
    <form
      className="space-y-3"
      action={async (formData) => {
        const result = await reportUserAction(userId, formData);
        if (result.error) setError(result.error);
        else setDone(true);
      }}
    >
      <Select name="reason" required defaultValue="">
        <option value="" disabled>
          Reason
        </option>
        {REPORT_REASONS.map((reason) => (
          <option key={reason} value={reason}>
            {reportLabels[reason]}
          </option>
        ))}
      </Select>
      <Textarea name="details" placeholder="Optional details" />
      {error ? <p className="text-sm text-rose-800">{error}</p> : null}
      <Button type="submit" variant="ghost">
        Report this profile
      </Button>
    </form>
  );
}
