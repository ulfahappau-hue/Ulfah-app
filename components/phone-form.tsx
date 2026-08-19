"use client";

import { useActionState } from "react";
import { sendPhoneOtpAction, verifyPhoneOtpAction, type PhoneState } from "@/actions/phone";
import { Button, Field, Input } from "@/components/ui";

const initial: PhoneState = {};

export function PhoneVerifyForm() {
  const [sendState, sendAction, sending] = useActionState(sendPhoneOtpAction, initial);
  const [verifyState, verifyAction, verifying] = useActionState(verifyPhoneOtpAction, initial);

  return (
    <div className="space-y-8">
      <form className="space-y-4" action={sendAction}>
        <Field label="Australian mobile" hint="Used for login recovery and match-release SMS.">
          <Input name="phone" required placeholder="04xxxxxxxx" inputMode="tel" id="phone" />
        </Field>
        <Button type="submit" className="w-full" disabled={sending}>
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
      <form className="space-y-4" action={verifyAction}>
        <Field label="Australian mobile">
          <Input name="phone" required placeholder="04xxxxxxxx" inputMode="tel" />
        </Field>
        <Field label="6-digit code">
          <Input name="code" required inputMode="numeric" maxLength={6} />
        </Field>
        {verifyState.error ? <p className="text-sm text-rose-800">{verifyState.error}</p> : null}
        <Button type="submit" className="w-full" variant="secondary" disabled={verifying}>
          Verify phone
        </Button>
      </form>
    </div>
  );
}
