import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Trash2 } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { ProviderCard } from "@/components/provider-card";
import { clearSaved, useSavedProviders } from "@/lib/care-session";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Providers — CarePath AI" },
      {
        name: "description",
        content:
          "Your shortlist of saved hospitals, clinics and specialists, stored privately on this device.",
      },
      { property: "og:title", content: "Saved Providers — CarePath AI" },
      {
        property: "og:description",
        content: "Revisit the healthcare providers you shortlisted, with directions and contacts.",
      },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const saved = useSavedProviders();

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Saved providers</h1>
            <p className="text-sm text-muted-foreground">
              Stored only on this device. Nothing is uploaded to a server.
            </p>
          </div>
          {saved.length > 0 ? (
            <button
              type="button"
              onClick={clearSaved}
              className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary"
            >
              <Trash2 className="size-3.5" aria-hidden /> Clear all
            </button>
          ) : null}
        </div>

        {saved.length === 0 ? (
          <div className="card-soft mt-6 grid place-items-center p-10 text-center">
            <Bookmark className="mb-3 size-6 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">You haven't saved any providers yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Save a hospital or specialist from the results page to build your shortlist.
            </p>
            <Link
              to="/find-care"
              className="focus-ring mt-4 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-teal-foreground"
            >
              Find care near me
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {saved.map((p, i) => (
              <ProviderCard
                key={p.place_id}
                provider={p}
                index={i}
                specialty={p.specialty_context}
                selected={false}
                compared={false}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}