export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="18" fill="#1B3D32" />
      <path
        d="M22 16c10 8 10 24 0 32"
        fill="none"
        stroke="#C6A36B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M42 16c-10 8-10 24 0 32"
        fill="none"
        stroke="#C6A36B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="5" fill="#F4EFE4" />
    </svg>
  );
}
