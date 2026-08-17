import { Link } from "@tanstack/react-router";
import { Activity, Bookmark, Home, Info, MapPinned, Stethoscope } from "lucide-react";
import { useDemoMode, useSavedProviders } from "@/lib/care-session";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/symptom-check", label: "Symptom Check", icon: Stethoscope },
  { to: "/find-care", label: "Find Care", icon: MapPinned },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/about", label: "About", icon: Info },
] as const;

export function SiteNav() {
  const saved = useSavedProviders();
  const demo = useDemoMode();

  return (
    <>
      {demo ? (
        <div className="bg-warning/90 px-4 py-1.5 text-center text-xs font-semibold tracking-wide text-primary uppercase">
          Demo mode — provider records shown are clearly labelled demo data, not real providers
        </div>
      ) : null}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <nav
          aria-label="Main"
          className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
        >
          <Link to="/" className="focus-ring flex items-center gap-2.5 rounded-lg">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Activity className="size-5 text-teal" aria-hidden />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[15px] font-bold tracking-tight">CarePath AI</span>
              <span className="text-[11px] text-muted-foreground">Find the right care</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  activeOptions={{ exact: to === "/" }}
                  activeProps={{ className: "bg-secondary text-foreground" }}
                  className="focus-ring rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {label}
                  {to === "/saved" && saved.length > 0 ? (
                    <span className="ml-1.5 rounded-full bg-teal px-1.5 py-0.5 text-[10px] font-bold text-teal-foreground">
                      {saved.length}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to="/symptom-check"
            className="focus-ring hidden rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-teal-foreground shadow-soft transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            Check My Symptoms
          </Link>
        </nav>
      </header>

      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {links.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                activeProps={{ className: "text-teal" }}
                className="focus-ring flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium text-muted-foreground"
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}