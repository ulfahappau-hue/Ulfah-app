"use client";

import { useActionState } from "react";
import {
  loginAction,
  registerAction,
  requestPasswordResetAction,
  resetPasswordAction,
  setupOwnerAction,
  type AuthState,
} from "@/actions/auth";
import { Button, Field, Input, Select } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const initial: AuthState = {};

export function LoginForm({ t }: { t: Dictionary }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="space-y-4">
      {state.error ? <p className="text-sm text-rose-800">{state.error}</p> : null}
      <Field label={t.auth.email}>
        <Input name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label={t.auth.password}>
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        {t.auth.submitLogin}
      </Button>
    </form>
  );
}

export function ForgotPasswordForm({ t }: { t: Dictionary }) {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initial);
  return (
    <form action={action} className="space-y-4">
      {state.error ? <p className="text-sm text-rose-800">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-forest">{state.message}</p> : null}
      <Field label={t.auth.email}>
        <Input name="email" type="email" autoComplete="email" required />
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        {t.auth.forgotSubmit}
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ t, token }: { t: Dictionary; token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  return (
    <form action={action} className="space-y-4">
      {state.error ? <p className="text-sm text-rose-800">{state.error}</p> : null}
      <input type="hidden" name="token" value={token} />
      <Field label={t.auth.password} hint="At least 10 characters, with a letter and a number.">
        <Input name="password" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        {t.auth.resetSubmit}
      </Button>
    </form>
  );
}

export function RegisterForm({ t, invite }: { t: Dictionary; invite?: string }) {
  const [state, action, pending] = useActionState(registerAction, initial);
  return (
    <form action={action} className="space-y-4">
      {state.error ? <p className="text-sm text-rose-800">{state.error}</p> : null}
      <Field label={t.auth.invite}>
        <Input name="inviteCode" required defaultValue={invite} className="uppercase" />
      </Field>
      <Field label={t.auth.firstName}>
        <Input name="firstName" required autoComplete="given-name" />
      </Field>
      <Field label={t.auth.email}>
        <Input name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label={t.auth.password} hint="At least 10 characters, with a letter and a number.">
        <Input name="password" type="password" required autoComplete="new-password" />
      </Field>
      <Field label={t.auth.gender}>
        <Select name="gender" required defaultValue="">
          <option value="" disabled>
            Select
          </option>
          <option value="male">{t.auth.male}</option>
          <option value="female">{t.auth.female}</option>
        </Select>
      </Field>
      <label className="flex items-start gap-2 text-sm text-ink">
        <input name="liveInAu" type="checkbox" required className="mt-1" />
        {t.auth.liveAu}
      </label>
      <label className="flex items-start gap-2 text-sm text-ink">
        <input name="intention" type="checkbox" required className="mt-1" />
        {t.auth.intention}
      </label>
      <label className="flex items-start gap-2 text-sm text-ink">
        <input name="ageConfirm" type="checkbox" required className="mt-1" />
        {t.auth.ageConfirm}
      </label>
      <Button type="submit" className="w-full" disabled={pending}>
        {t.auth.submitRegister}
      </Button>
    </form>
  );
}

export function SetupForm() {
  const [state, action, pending] = useActionState(setupOwnerAction, initial);
  return (
    <form action={action} className="space-y-4">
      {state.error ? <p className="text-sm text-rose-800">{state.error}</p> : null}
      <Field label="Your first name">
        <Input name="firstName" required />
      </Field>
      <Field label="Owner email">
        <Input name="email" type="email" required />
      </Field>
      <Field label="Password" hint="This account can invite matchmakers and release contacts.">
        <Input name="password" type="password" required />
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        Create owner account
      </Button>
    </form>
  );
}
