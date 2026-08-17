"use client";

import { uploadPhotoAction } from "@/actions/profile";
import { Button } from "@/components/ui";
import { useState } from "react";

export function PhotoUpload() {
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="space-y-3"
      action={async (formData) => {
        const result = await uploadPhotoAction(formData);
        setError(result.error ?? null);
      }}
    >
      <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required />
      <Button type="submit" variant="secondary">
        Upload photo
      </Button>
      <p className="text-xs text-forest/70">
        Optional. Up to 3 photos. Hidden from others until a mutual match.
      </p>
      {error ? <p className="text-sm text-rose-800">{error}</p> : null}
    </form>
  );
}
