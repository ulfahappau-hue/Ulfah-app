"use client";

import { useRouter } from "next/navigation";
import { AU_STATES, EDUCATION, JOB_TYPES, MARITAL_STATUSES, PRACTICING_LEVELS } from "@/lib/constants";
import {
  educationLabels,
  jobTypeLabels,
  maritalLabels,
  practicingLabels,
} from "@/lib/labels";
import { Button, Input, Select } from "@/components/ui";

export function BrowseFilters({
  values,
}: {
  values: Record<string, string | undefined>;
}) {
  const router = useRouter();
  return (
    <form
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const params = new URLSearchParams();
        for (const [key, value] of data.entries()) {
          if (String(value)) params.set(key, String(value));
        }
        router.push(`/browse?${params.toString()}`);
      }}
    >
      <Input name="q" placeholder="Search name or city" defaultValue={values.q} />
      <Select name="state" defaultValue={values.state ?? ""}>
        <option value="">Any state</option>
        {AU_STATES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
      <Input name="minAge" type="number" min={18} placeholder="Min age" defaultValue={values.minAge} />
      <Input name="maxAge" type="number" min={18} placeholder="Max age" defaultValue={values.maxAge} />
      <Select name="maritalStatus" defaultValue={values.maritalStatus ?? ""}>
        <option value="">Any marital status</option>
        {MARITAL_STATUSES.map((item) => (
          <option key={item} value={item}>
            {maritalLabels[item]}
          </option>
        ))}
      </Select>
      <Select name="practicingLevel" defaultValue={values.practicingLevel ?? ""}>
        <option value="">Any practicing level</option>
        {PRACTICING_LEVELS.map((item) => (
          <option key={item} value={item}>
            {practicingLabels[item]}
          </option>
        ))}
      </Select>
      <Select name="education" defaultValue={values.education ?? ""}>
        <option value="">Any education</option>
        {EDUCATION.map((item) => (
          <option key={item} value={item}>
            {educationLabels[item]}
          </option>
        ))}
      </Select>
      <Select name="jobType" defaultValue={values.jobType ?? ""}>
        <option value="">Any job type</option>
        {JOB_TYPES.map((item) => (
          <option key={item} value={item}>
            {jobTypeLabels[item]}
          </option>
        ))}
      </Select>
      <Select name="hasChildren" defaultValue={values.hasChildren ?? ""}>
        <option value="">Children: any</option>
        <option value="no">No children</option>
        <option value="yes">Has children</option>
      </Select>
      <Button type="submit" className="sm:col-span-2 lg:col-span-1">
        Filter
      </Button>
    </form>
  );
}
