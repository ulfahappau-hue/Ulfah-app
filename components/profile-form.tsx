"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { saveProfileAction } from "@/actions/profile";
import { AU_CITIES } from "@/lib/au-locations";
import { AU_STATES, EDUCATION, JOB_TYPES, MARITAL_STATUSES, PRACTICING_LEVELS } from "@/lib/constants";
import {
  educationLabels,
  jobTypeLabels,
  maritalLabels,
  practicingLabels,
} from "@/lib/labels";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import {
  ABOUT_ME_MAX_CHARS,
  ABOUT_ME_MIN_CHARS,
  SEEKING_TEXT_MAX_CHARS,
  SEEKING_TEXT_MIN_CHARS,
  readProfileDraft,
  type ProfileDraft,
} from "@/lib/validators";

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

function draftFromSaved(values?: ProfileValues): ProfileDraft {
  const state = values?.state ?? "NSW";
  const cities = AU_CITIES[state] ?? AU_CITIES.NSW;
  return {
    dateOfBirth: values?.dateOfBirth ?? "",
    state,
    city: values?.city && cities.includes(values.city) ? values.city : (cities[0] ?? ""),
    education: values?.education ?? EDUCATION[0],
    jobTitle: values?.jobTitle ?? "",
    jobType: values?.jobType ?? JOB_TYPES[0],
    practicingLevel: values?.practicingLevel ?? PRACTICING_LEVELS[0],
    maritalStatus: values?.maritalStatus ?? MARITAL_STATUSES[0],
    hasChildren: values?.hasChildren ? "yes" : "no",
    childrenCount: String(values?.childrenCount ?? 0),
    willingToRelocate: values?.willingToRelocate ?? "maybe",
    ethnicity: values?.ethnicity ?? "",
    aboutMe: values?.aboutMe ?? "",
    seekingText: values?.seekingText ?? "",
    waliName: values?.waliName ?? "",
    waliPhone: values?.waliPhone ?? "",
    waliEmail: values?.waliEmail ?? "",
  };
}

function setDraftField<K extends keyof ProfileDraft>(
  setter: Dispatch<SetStateAction<ProfileDraft>>,
  key: K,
) {
  return (event: { target: { value: string } }) => {
    setter((current) => ({ ...current, [key]: event.target.value }));
  };
}

export function ProfileForm({
  gender,
  values,
  submitLabel,
}: {
  gender: string | null;
  values?: ProfileValues;
  submitLabel: string;
}) {
  const [draft, setDraft] = useState(() => draftFromSaved(values));
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const cities = useMemo(() => AU_CITIES[draft.state] ?? AU_CITIES.NSW, [draft.state]);
  const needsWali = gender === "female";

  return (
    <form
      className="space-y-4"
      noValidate
      action={async (formData) => {
        formData.set("submitForReview", "1");
        const submitted = readProfileDraft(formData);
        setDraft(submitted);
        setError(null);
        setFieldErrors({});
        const result = await saveProfileAction({}, formData);
        if (result.values) setDraft(result.values);
        setFieldErrors(result.fieldErrors ?? {});
        setError(result.fieldErrors && Object.keys(result.fieldErrors).length > 0 ? null : result.error ?? null);
      }}
    >
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</p> : null}
      <Field label="Date of birth" error={fieldErrors.dateOfBirth}>
        <Input
          name="dateOfBirth"
          type="date"
          required
          value={draft.dateOfBirth}
          onChange={setDraftField(setDraft, "dateOfBirth")}
          aria-invalid={Boolean(fieldErrors.dateOfBirth)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="State" error={fieldErrors.state}>
          <Select
            name="state"
            value={draft.state}
            onChange={(event) => {
              const nextState = event.target.value;
              setDraft((current) => {
                const nextCities = AU_CITIES[nextState] ?? AU_CITIES.NSW;
                const city = nextCities.includes(current.city) ? current.city : (nextCities[0] ?? "");
                return { ...current, state: nextState, city };
              });
            }}
            required
            aria-invalid={Boolean(fieldErrors.state)}
          >
            {AU_STATES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="City" error={fieldErrors.city}>
          <Select
            name="city"
            value={draft.city}
            onChange={setDraftField(setDraft, "city")}
            required
            aria-invalid={Boolean(fieldErrors.city)}
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Education" error={fieldErrors.education}>
        <Select
          name="education"
          value={draft.education}
          onChange={setDraftField(setDraft, "education")}
          required
          aria-invalid={Boolean(fieldErrors.education)}
        >
          {EDUCATION.map((item) => (
            <option key={item} value={item}>
              {educationLabels[item]}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Job title" error={fieldErrors.jobTitle}>
          <Input
            name="jobTitle"
            required
            value={draft.jobTitle}
            onChange={setDraftField(setDraft, "jobTitle")}
            aria-invalid={Boolean(fieldErrors.jobTitle)}
          />
        </Field>
        <Field label="Job type" error={fieldErrors.jobType}>
          <Select
            name="jobType"
            value={draft.jobType}
            onChange={setDraftField(setDraft, "jobType")}
            required
            aria-invalid={Boolean(fieldErrors.jobType)}
          >
            {JOB_TYPES.map((item) => (
              <option key={item} value={item}>
                {jobTypeLabels[item]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Practicing level" error={fieldErrors.practicingLevel}>
        <Select
          name="practicingLevel"
          value={draft.practicingLevel}
          onChange={setDraftField(setDraft, "practicingLevel")}
          required
          aria-invalid={Boolean(fieldErrors.practicingLevel)}
        >
          {PRACTICING_LEVELS.map((item) => (
            <option key={item} value={item}>
              {practicingLabels[item]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Marital status" error={fieldErrors.maritalStatus}>
        <Select
          name="maritalStatus"
          value={draft.maritalStatus}
          onChange={setDraftField(setDraft, "maritalStatus")}
          required
          aria-invalid={Boolean(fieldErrors.maritalStatus)}
        >
          {MARITAL_STATUSES.map((item) => (
            <option key={item} value={item}>
              {maritalLabels[item]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Children" error={fieldErrors.hasChildren}>
        <Select
          name="hasChildren"
          value={draft.hasChildren}
          onChange={setDraftField(setDraft, "hasChildren")}
          required
          aria-invalid={Boolean(fieldErrors.hasChildren)}
        >
          <option value="no">No children</option>
          <option value="yes">Has children</option>
        </Select>
      </Field>
      <Field label="Number of children" hint="Use 0 if none." error={fieldErrors.childrenCount}>
        <Input
          name="childrenCount"
          type="number"
          min={0}
          value={draft.childrenCount}
          onChange={setDraftField(setDraft, "childrenCount")}
          aria-invalid={Boolean(fieldErrors.childrenCount)}
        />
      </Field>
      <Field label="Willing to relocate?" error={fieldErrors.willingToRelocate}>
        <Select
          name="willingToRelocate"
          value={draft.willingToRelocate}
          onChange={setDraftField(setDraft, "willingToRelocate")}
          required
          aria-invalid={Boolean(fieldErrors.willingToRelocate)}
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="maybe">Maybe</option>
        </Select>
      </Field>
      <Field label="Ethnicity / ancestry (optional)" error={fieldErrors.ethnicity}>
        <Input
          name="ethnicity"
          value={draft.ethnicity}
          onChange={setDraftField(setDraft, "ethnicity")}
          aria-invalid={Boolean(fieldErrors.ethnicity)}
        />
      </Field>
      <Field
        label="About me"
        hint={`At least ${ABOUT_ME_MIN_CHARS} characters (about 1–2 sentences). Keep it modest and sincere.`}
        error={fieldErrors.aboutMe}
      >
        <CountedTextarea
          name="aboutMe"
          required
          value={draft.aboutMe}
          onChange={setDraftField(setDraft, "aboutMe")}
          minChars={ABOUT_ME_MIN_CHARS}
          maxChars={ABOUT_ME_MAX_CHARS}
          invalid={Boolean(fieldErrors.aboutMe)}
        />
      </Field>
      <Field
        label="What I am seeking"
        hint={`At least ${SEEKING_TEXT_MIN_CHARS} characters. Say what you hope for in a spouse.`}
        error={fieldErrors.seekingText}
      >
        <CountedTextarea
          name="seekingText"
          required
          value={draft.seekingText}
          onChange={setDraftField(setDraft, "seekingText")}
          minChars={SEEKING_TEXT_MIN_CHARS}
          maxChars={SEEKING_TEXT_MAX_CHARS}
          invalid={Boolean(fieldErrors.seekingText)}
        />
      </Field>
      {needsWali ? (
        <div className="space-y-4 rounded-3xl border border-gold/30 bg-cream p-4">
          <p className="font-display text-lg text-forest">Wali details</p>
          <p className="text-sm text-forest/80">
            Required for sisters. These stay hidden until a matchmaker releases a match.
          </p>
          <WaliFields draft={draft} setDraft={setDraft} fieldErrors={fieldErrors} required />
        </div>
      ) : (
        <div className="space-y-4 rounded-3xl border border-gold/20 p-4">
          <p className="text-sm text-forest/80">Wali details are optional for brothers.</p>
          <WaliFields draft={draft} setDraft={setDraft} fieldErrors={fieldErrors} />
        </div>
      )}
      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}

function WaliFields({
  draft,
  setDraft,
  fieldErrors,
  required,
}: {
  draft: ProfileDraft;
  setDraft: Dispatch<SetStateAction<ProfileDraft>>;
  fieldErrors: Record<string, string>;
  required?: boolean;
}) {
  const optional = required ? "" : " (optional)";
  return (
    <>
      <Field label={`Wali name${optional}`} error={fieldErrors.waliName}>
        <Input
          name="waliName"
          required={required}
          value={draft.waliName}
          onChange={setDraftField(setDraft, "waliName")}
          aria-invalid={Boolean(fieldErrors.waliName)}
        />
      </Field>
      <Field label={`Wali mobile${optional}`} error={fieldErrors.waliPhone}>
        <Input
          name="waliPhone"
          required={required}
          value={draft.waliPhone}
          onChange={setDraftField(setDraft, "waliPhone")}
          placeholder="04xxxxxxxx"
          aria-invalid={Boolean(fieldErrors.waliPhone)}
        />
      </Field>
      <Field label={`Wali email${optional}`} error={fieldErrors.waliEmail}>
        <Input
          name="waliEmail"
          type="email"
          required={required}
          value={draft.waliEmail}
          onChange={setDraftField(setDraft, "waliEmail")}
          aria-invalid={Boolean(fieldErrors.waliEmail)}
        />
      </Field>
    </>
  );
}

function CountedTextarea({
  name,
  value,
  onChange,
  minChars,
  maxChars,
  required,
  invalid,
}: {
  name: string;
  value: string;
  onChange: (event: { target: { value: string } }) => void;
  minChars: number;
  maxChars: number;
  required?: boolean;
  invalid?: boolean;
}) {
  const trimmed = value.trim().length;
  const remaining = minChars - trimmed;

  return (
    <>
      <Textarea
        name={name}
        required={required}
        maxLength={maxChars}
        value={value}
        onChange={onChange}
        aria-invalid={invalid}
      />
      <span className="block text-xs text-forest/70">
        {remaining > 0
          ? `${remaining} more character${remaining === 1 ? "" : "s"} needed (minimum ${minChars}).`
          : `${trimmed} / ${maxChars} characters.`}
      </span>
    </>
  );
}
