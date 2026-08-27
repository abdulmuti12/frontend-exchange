import Link from "next/link";
import { ReactNode } from "react";
import { Repeat } from "lucide-react";

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
  maxWidth = "max-w-md",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className={`w-full ${maxWidth}`}>
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <Repeat className="size-6 text-teak" />
          <span className="font-display text-xl font-baskerville text-ink">Tukar</span>
        </Link>
        <div className="rounded-md border border-line bg-surface px-7 py-8 shadow-sm">
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-teak">{eyebrow}</p>
          <h1 className="font-display text-2xl font-baskerville text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-soft">{description}</p>
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-5 text-center text-sm text-ink-soft">{footer}</div>}
      </div>
    </main>
  );
}
