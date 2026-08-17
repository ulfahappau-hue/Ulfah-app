export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="18" fill="#1B3D32" />
      <path
        d="M18 40c8-14 20-14 28 0"
        fill="none"
        stroke="#C6A36B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="24" r="6" fill="#F4EFE4" />
    </svg>
  );
}
