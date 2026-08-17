import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-display text-3xl text-forest">Not found</h1>
      <p className="mt-3 text-forest/80">That page or profile is not available.</p>
      <Link href="/" className="mt-6 inline-block text-forest underline">
        Back home
      </Link>
    </div>
  );
}
