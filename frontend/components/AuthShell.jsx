import Link from "next/link";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <div className="px-5 sm:px-8 py-6">
        <Link href="/" className="font-extrabold text-lg tracking-tight">
          MealMind
        </Link>
      </div>

      <div className="flex-1 flex items-start sm:items-center justify-center px-5 pb-10">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-ink/10 rounded-2xl shadow-sm px-6 py-8 sm:px-8">
            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-ink/60">{subtitle}</p>
            )}
            <div className="mt-7">{children}</div>
          </div>
          {footer && <div className="mt-5 text-center text-sm">{footer}</div>}
        </div>
      </div>
    </div>
  );
}