import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Clock,
  Globe,
  MapPin,
  Navigation,
  Phone,
  Star,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { ReviewInsightsPanel } from "@/components/review-insights";
import { providerDetails, reviewInsights } from "@/lib/carepath.functions";
import { getLocation, getSaved, toggleSaved } from "@/lib/care-session";
import { carePathMatch, directionsUrl, photoUrl } from "@/lib/provider-utils";
import type { ReviewInsights } from "@/lib/types";

type ProviderSearch = { specialty?: string | undefined };

export const Route = createFileRoute("/provider/$placeId")({
  validateSearch: (search: Record<string, unknown>): ProviderSearch => ({
    specialty: typeof search["specialty"] === "string" ? search["specialty"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Provider details — CarePath AI" },
      {
        name: "description",
        content:
          "Real details for this healthcare provider: address, hours, contact, ratings and AI-summarised patient review insights.",
      },
      { property: "og:title", content: "Provider details — CarePath AI" },
      {
        property: "og:description",
        content: "Address, hours, contact, ratings and patient review insights for this provider.",
      },
    ],
  }),
  component: ProviderPage,
});

function ProviderPage() {
  const { placeId } = Route.useParams();
  const { specialty } = Route.useSearch();
  const fetchDetails = useServerFn(providerDetails);
  const fetchInsights = useServerFn(reviewInsights);
  const [saved, setSaved] = useState(false);
  const [insights, setInsights] = useState<ReviewInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const coords = useMemo(() => {
    const loc = getLocation();
    return loc && loc.lat !== null && loc.lng !== null ? { lat: loc.lat, lng: loc.lng } : null;
  }, []);

  const query = useQuery({
    queryKey: ["provider", placeId],
    queryFn: () =>
      fetchDetails({
        data: {
          placeId,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          specialty: specialty ?? null,
        },
      }),
  });

  const data = query.data;

  useEffect(() => {
    setSaved(getSaved().some((p) => p.place_id === placeId));
  }, [placeId]);

  useEffect(() => {
    if (!data || data.reviews.length === 0) return;
    let cancelled = false;
    setInsightsLoading(true);
    fetchInsights({ data: { providerName: data.provider.name, reviews: data.reviews } })
      .then((r) => !cancelled && setInsights(r))
      .catch(() => {
        if (!cancelled)
          setInsights({
            enough_data: false,
            message: "Review insights are temporarily unavailable. The reviews below are unchanged.",
            liked: [],
            criticised: [],
            themes: [],
            sentiment: "unknown",
            reviews_analyzed: 0,
          });
      })
      .finally(() => !cancelled && setInsightsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [data, fetchInsights]);

  if (query.isPending) {
    return (
      <div className="min-h-screen pb-24 md:pb-0">
        <SiteNav />
        <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 sm:px-6">
          <div className="h-52 animate-pulse rounded-2xl bg-surface" />
          <div className="h-40 animate-pulse rounded-2xl bg-surface" />
          <div className="h-64 animate-pulse rounded-2xl bg-surface" />
        </main>
      </div>
    );
  }

  if (query.isError || !data) {
    return (
      <div className="min-h-screen pb-24 md:pb-0">
        <SiteNav />
        <main className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-xl font-semibold">We couldn't load this provider</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The place data service didn't respond. No provider information is shown rather than
            guessed.
          </p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="focus-ring mt-4 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-teal-foreground"
          >
            Try again
          </button>
        </main>
      </div>
    );
  }

  const p = data.provider;
  const match = carePathMatch(p);

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 sm:px-6">
        <Link
          to="/find-care"
          search={{ specialty: specialty ?? undefined, emergency: false, city: undefined }}
          className="focus-ring inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back to results
        </Link>

        <section className="card-soft overflow-hidden">
          {p.photo_names.length > 0 ? (
            <div className="flex gap-1 overflow-x-auto">
              {p.photo_names.slice(0, 5).map((name) => (
                <img
                  key={name}
                  src={photoUrl(name, 800)}
                  alt={`Photo of ${p.name} published on Google Places`}
                  loading="lazy"
                  className="h-48 w-72 shrink-0 object-cover"
                />
              ))}
            </div>
          ) : null}
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">{p.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{p.type}</p>
              </div>
              <button
                type="button"
                onClick={() => setSaved(toggleSaved(p, specialty ?? "General Physician"))}
                aria-pressed={saved}
                className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary"
              >
                <Bookmark className={`size-3.5 ${saved ? "fill-current text-teal" : ""}`} aria-hidden />
                {saved ? "Saved" : "Save provider"}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              {p.rating !== null ? (
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Star className="size-4 fill-current text-amber" aria-hidden />
                  {p.rating.toFixed(1)}
                  <span className="font-normal text-muted-foreground">
                    ({p.review_count ?? 0} Google reviews)
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">Rating not available</span>
              )}
              {p.distance_km !== null ? (
                <span className="text-muted-foreground">{p.distance_km} km away</span>
              ) : null}
              {p.open_now !== null ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    p.open_now ? "bg-success-soft text-success" : "bg-surface text-muted-foreground"
                  }`}
                >
                  {p.open_now ? "Open now" : "Closed now"}
                </span>
              ) : null}
              <span className="rounded-full bg-info-soft px-2 py-0.5 text-xs font-semibold text-info">
                CarePath Match {match.total}/100
              </span>
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              {p.address ? (
                <li className="flex gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span>{p.address}</span>
                </li>
              ) : null}
              {p.phone ? (
                <li className="flex gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <a className="focus-ring underline" href={`tel:${p.phone}`}>
                    {p.phone}
                  </a>
                </li>
              ) : null}
              {p.website ? (
                <li className="flex gap-2">
                  <Globe className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <a
                    className="focus-ring break-all underline"
                    href={p.website}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {p.website}
                  </a>
                </li>
              ) : null}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={directionsUrl(p)}
                target="_blank"
                rel="noreferrer noopener"
                className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-teal-foreground"
              >
                <Navigation className="size-4" aria-hidden /> Get directions
              </a>
              {p.phone ? (
                <a
                  href={`tel:${p.phone}`}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary"
                >
                  <Phone className="size-4" aria-hidden /> Call
                </a>
              ) : null}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Source: Google Places · last refreshed {new Date(p.last_updated).toLocaleString()}
            </p>
          </div>
        </section>

        {data.editorial_summary ? (
          <section className="card-soft p-5">
            <h2 className="text-lg font-semibold">About this place</h2>
            <p className="mt-2 text-sm text-muted-foreground">{data.editorial_summary}</p>
          </section>
        ) : null}

        {p.opening_hours && p.opening_hours.length > 0 ? (
          <section className="card-soft p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="size-4 text-teal" aria-hidden /> Opening hours
            </h2>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {p.opening_hours.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <ReviewInsightsPanel insights={insights} loading={insightsLoading} />

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">Patient reviews</h2>
          {data.reviews.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No reviews are published for this provider yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {data.reviews.map((r, i) => (
                <li key={`${r.author ?? "anon"}-${i}`} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{r.author ?? "Google user"}</span>
                    {r.rating !== null ? (
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3 fill-current text-amber" aria-hidden />
                        {r.rating}
                      </span>
                    ) : null}
                    {r.relative_time ? <span>· {r.relative_time}</span> : null}
                  </div>
                  {r.text ? <p className="mt-2 text-sm">{r.text}</p> : null}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[11px] text-muted-foreground">
            Reviews are published by Google users and shown unedited. CarePath AI does not create,
            edit or filter review content.
          </p>
        </section>
      </main>
    </div>
  );
}