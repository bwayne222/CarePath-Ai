import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, MapPin, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CarePath AI — Understand your symptoms, find real care nearby" },
      {
        name: "description",
        content:
          "CarePath AI guides you from symptoms to the right medical specialty and real nearby hospitals, clinics and doctors using live place data. Not a diagnosis.",
      },
      { property: "og:title", content: "CarePath AI — From symptoms to the right care" },
      {
        property: "og:description",
        content:
          "AI symptom guidance plus real healthcare provider discovery with ratings, hours and directions.",
      },
    ],
  }),
  component: Index,
});

const STEPS = [
  {
    icon: Stethoscope,
    title: "Describe your symptoms",
    body: "A guided conversation asks about duration, severity and related symptoms — no forms to guess at.",
  },
  {
    icon: Activity,
    title: "Understand possible concerns",
    body: "Get a structured summary of possible health concerns, the recommended specialty and an urgency level.",
  },
  {
    icon: MapPin,
    title: "Find real providers nearby",
    body: "Discover actual hospitals, clinics and specialists with real ratings, hours, contacts and directions.",
  },
];

function Index() {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <SiteNav />
      <main>
        <section className="mx-auto w-full max-w-6xl px-4 pt-12 pb-10 sm:px-6 sm:pt-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1.5 text-xs font-semibold text-teal-foreground">
            <Sparkles className="size-3.5" aria-hidden /> AI guidance · real provider data
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl leading-tight font-bold tracking-tight sm:text-6xl">
            Understand your symptoms. Find the <span className="text-teal">right care</span> near
            you.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            CarePath AI helps you understand what type of medical care may be appropriate, then
            connects you with real hospitals, clinics and specialists around you — with genuine
            ratings, reviews and directions. It does not diagnose, and it never invents providers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/symptom-check"
              className="focus-ring rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-teal-foreground"
            >
              Start symptom check
            </Link>
            <Link
              to="/find-care"
              search={{ specialty: undefined, emergency: false, city: undefined }}
              className="focus-ring rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-secondary"
            >
              Find care near me
            </Link>
          </div>
          <p className="mt-5 max-w-2xl rounded-xl bg-warning-soft p-3 text-xs">
            CarePath AI provides general health information only. It is not a medical diagnosis and
            does not replace a qualified healthcare professional. In an emergency, contact local
            emergency services immediately.
          </p>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6" aria-label="How it works">
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }) => (
              <article key={title} className="card-soft p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-primary">
                  <Icon className="size-5 text-teal" aria-hidden />
                </span>
                <h2 className="mt-4 text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>

          <div className="card-soft mt-4 flex flex-wrap items-center gap-3 p-5">
            <ShieldCheck className="size-5 text-teal" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Provider names, addresses, ratings and reviews come from live Google Places data.
              Symptom details stay in your browser session and are never stored on a server.
            </p>
            <Link
              to="/about"
              className="focus-ring ml-auto rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              How CarePath AI works
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
