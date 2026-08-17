"use client";

import { useState } from "react";
import { sendPhoneOtpAction, verifyPhoneOtpAction, type PhoneState } from "@/actions/phone";
import { Button, Field, Input } from "@/components/ui";

export function PhoneVerifyForm() {
  const [sendState, setSendState] = useState<PhoneState>({});
  const [verifyError, setVerifyError] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <form
        className="space-y-4"
        action={async (formData) => {
          const result = await sendPhoneOtpAction({}, formData);
          setSendState(result);
        }}
      >
        <Field label="Australian mobile" hint="Used for login recovery and match-release SMS.">
          <Input name="phone" required placeholder="04xxxxxxxx" inputMode="tel" />
        </Field>
        <Button type="submit" className="w-full">
          Send code
        </Button>
        {sendState.error ? <p className="text-sm text-rose-800">{sendState.error}</p> : null}
        {sendState.sent ? <p className="text-sm text-forest">Code sent. Check your SMS.</p> : null}
        {sendState.devCode ? (
          <p className="rounded-2xl bg-gold/15 px-4 py-3 text-sm text-forest">
            Dev mode code: <strong>{sendState.devCode}</strong>
          </p>
        ) : null}
      </form>
      <form
        className="space-y-4"
        action={async (formData) => {
          const result = await verifyPhoneOtpAction({}, formData);
          if (result.error) setVerifyError(result.error);
        }}
      >
        <Field label="6-digit code">
          <Input name="code" required inputMode="numeric" maxLength={6} />
        </Field>
        {verifyError ? <p className="text-sm text-rose-800">{verifyError}</p> : null}
        <Button type="submit" className="w-full" variant="secondary">
          Verify phone
        </Button>
      </form>
    </div>
  );
}
