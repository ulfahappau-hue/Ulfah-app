"use client";

import { useMemo, useState } from "react";
import { saveProfileAction, type ProfileState } from "@/actions/profile";
import { AU_CITIES } from "@/lib/au-locations";
import { AU_STATES, EDUCATION, JOB_TYPES, MARITAL_STATUSES, PRACTICING_LEVELS } from "@/lib/constants";
import {
  educationLabels,
  jobTypeLabels,
  maritalLabels,
  practicingLabels,
} from "@/lib/labels";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";

type ProfileValues = {
  dateOfBirth?: string;
  state?: string;
  city?: string;
  education?: string;
  jobTitle?: string;
  jobType?: string;
  practicingLevel?: string;
  maritalStatus?: string;
  hasChildren?: boolean;
  childrenCount?: number;
  willingToRelocate?: string;
  ethnicity?: string | null;
  aboutMe?: string;
  seekingText?: string;
  waliName?: string | null;
  waliPhone?: string | null;
  waliEmail?: string | null;
};

export function ProfileForm({
  gender,
  values,
  submitLabel,
}: {
  gender: string | null;
  values?: ProfileValues;
  submitLabel: string;
}) {
  const [state, setState] = useState(values?.state ?? "NSW");
  const [error, setError] = useState<string | null>(null);
  const cities = useMemo(() => AU_CITIES[state] ?? AU_CITIES.NSW, [state]);
  const needsWali = gender === "female";

  return (
    <form
      className="space-y-4"
      action={async (formData) => {
        setError(null);
        formData.set("submitForReview", "1");
        const result: ProfileState = await saveProfileAction({}, formData);
        if (result.error) setError(result.error);
      }}
    >
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</p> : null}
      <Field label="Date of birth">
        <Input name="dateOfBirth" type="date" required defaultValue={values?.dateOfBirth} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="State">
          <Select name="state" value={state} onChange={(e) => setState(e.target.value)} required>
            {AU_STATES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="City">
          <Select name="city" defaultValue={values?.city} required>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Education">
        <Select name="education" defaultValue={values?.education} required>
          {EDUCATION.map((item) => (
            <option key={item} value={item}>
              {educationLabels[item]}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Job title">
          <Input name="jobTitle" required defaultValue={values?.jobTitle} />
        </Field>
        <Field label="Job type">
          <Select name="jobType" defaultValue={values?.jobType} required>
            {JOB_TYPES.map((item) => (
              <option key={item} value={item}>
                {jobTypeLabels[item]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Practicing level">
        <Select name="practicingLevel" defaultValue={values?.practicingLevel} required>
          {PRACTICING_LEVELS.map((item) => (
            <option key={item} value={item}>
              {practicingLabels[item]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Marital status">
        <Select name="maritalStatus" defaultValue={values?.maritalStatus} required>
          {MARITAL_STATUSES.map((item) => (
            <option key={item} value={item}>
              {maritalLabels[item]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Children">
        <Select name="hasChildren" defaultValue={values?.hasChildren ? "yes" : "no"} required>
          <option value="no">No children</option>
          <option value="yes">Has children</option>
        </Select>
      </Field>
      <Field label="Number of children" hint="Use 0 if none.">
        <Input
          name="childrenCount"
          type="number"
          min={0}
          defaultValue={values?.childrenCount ?? 0}
        />
      </Field>
      <Field label="Willing to relocate?">
        <Select name="willingToRelocate" defaultValue={values?.willingToRelocate ?? "maybe"} required>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="maybe">Maybe</option>
        </Select>
      </Field>
      <Field label="Ethnicity / ancestry (optional)">
        <Input name="ethnicity" defaultValue={values?.ethnicity ?? ""} />
      </Field>
      <Field label="About me" hint="At least a few sentences. Keep it modest and sincere.">
        <Textarea name="aboutMe" required defaultValue={values?.aboutMe} />
      </Field>
      <Field label="What I am seeking">
        <Textarea name="seekingText" required defaultValue={values?.seekingText} />
      </Field>
      {needsWali ? (
        <div className="space-y-4 rounded-3xl border border-gold/30 bg-cream p-4">
          <p className="font-display text-lg text-forest">Wali details</p>
          <p className="text-sm text-forest/80">
            Required for sisters. These stay hidden until a matchmaker releases a match.
          </p>
          <Field label="Wali name">
            <Input name="waliName" required defaultValue={values?.waliName ?? ""} />
          </Field>
          <Field label="Wali mobile">
            <Input name="waliPhone" required defaultValue={values?.waliPhone ?? ""} placeholder="04xxxxxxxx" />
          </Field>
          <Field label="Wali email">
            <Input name="waliEmail" type="email" required defaultValue={values?.waliEmail ?? ""} />
          </Field>
        </div>
      ) : (
        <div className="space-y-4 rounded-3xl border border-gold/20 p-4">
          <p className="text-sm text-forest/80">Wali details are optional for brothers.</p>
          <Field label="Wali name (optional)">
            <Input name="waliName" defaultValue={values?.waliName ?? ""} />
          </Field>
          <Field label="Wali mobile (optional)">
            <Input name="waliPhone" defaultValue={values?.waliPhone ?? ""} />
          </Field>
          <Field label="Wali email (optional)">
            <Input name="waliEmail" type="email" defaultValue={values?.waliEmail ?? ""} />
          </Field>
        </div>
      )}
      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
