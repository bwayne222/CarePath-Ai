import { Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-surface/60 pb-20 md:pb-0">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 text-sm sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">CarePath AI</p>
          <p className="text-xs text-muted-foreground">
            Built for the UnivaBio student health-tech competition. Informational guidance only —
            not a medical diagnosis.
          </p>
        </div>
        <div className="md:text-right">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Credits
          </p>
          <p className="mt-1 text-sm">
            Created and maintained by <span className="font-semibold">Sannan Ali Malik</span>
          </p>
          <a
            href="mailto:maliksannanali12345@gmail.com"
            className="focus-ring mt-1 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-teal hover:underline"
          >
            <Mail className="size-4" aria-hidden />
            maliksannanali12345@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
