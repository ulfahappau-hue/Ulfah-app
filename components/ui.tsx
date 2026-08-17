import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium tracking-wide transition disabled:opacity-50",
        variant === "primary" && "bg-forest text-cream hover:bg-forest-deep",
        variant === "secondary" && "border border-gold/40 bg-cream text-forest hover:bg-white",
        variant === "ghost" && "text-forest hover:bg-forest/5",
        variant === "danger" && "bg-rose-900 text-white hover:bg-rose-800",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-forest/70">{hint}</span> : null}
    </label>
  );
}

const control =
  "w-full rounded-2xl border border-gold/30 bg-white px-4 py-3 text-base text-ink outline-none ring-forest/20 placeholder:text-forest/40 focus:ring-2";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-28", className)} {...props} />;
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-3xl border border-gold/25 bg-paper p-5 shadow-sm", className)}>
      {children}
    </div>
  );
}
