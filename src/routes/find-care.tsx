import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Map as MapIcon, MapPin, Navigation, Search, X } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { EmergencyPanel } from "@/components/emergency-panel";
import { ProviderCard } from "@/components/provider-card";
import { ProviderMap } from "@/components/provider-map";
import { CompareTable } from "@/components/compare-table";
import { findProviders } from "@/lib/carepath.functions";
import {
  getLocation,
  requestBrowserLocation,
  setLocation as persistLocation,
  useCareSession,
  useDemoMode,
} from "@/lib/care-session";
import { DEMO_PROVIDERS } from "@/lib/demo-data";
import type { Provider, SearchResult } from "@/lib/types";

type SearchParams = { specialty?: string; emergency?: boolean; city?: string };

export const Route = createFileRoute("/find-care")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    specialty: typeof search["specialty"] === "string" ? search["specialty"] : undefined,
    emergency: search["emergency"] === true || search["emergency"] === "true",
    city: typeof search["city"] === "string" ? search["city"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Find Care — Real hospitals, clinics and doctors near you" },
      {
        name: "description",
        content:
          "Discover real nearby hospitals, clinics and specialists using live Google Places data, with ratings, hours, directions and review insights.",
      },
      { property: "og:title", content: "Find Care — CarePath AI" },
      {
        property: "og:description",
        content: "Search real healthcare providers near you by specialty, with map and comparison.",
      },
    ],
  }),
  component: FindCarePage,
});

const CITIES = ["Rawalpindi", "Islamabad", "Lahore", "Karachi", "Peshawar"];
const SPECIALTIES = [
  "General Physician",
  "Dermatologist",
  "Cardiologist",
  "Neurologist",
  "ENT Specialist",
  "Gastroenterologist",
  "Orthopedic Specialist",
  "Gynecologist",
  "Urologist",
  "Ophthalmologist",
  "Psychiatrist",
  "Emergency Department",
];

function FindCarePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const demo = useDemoMode();
  const { assessment } = useCareSession();
  const call = useServerFn(findProviders);

  const [specialty, setSpecialty] = useState(search.specialty ?? "General Physician");
  const [city, setCity] = useState(search.city ?? "");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [compare, setCompare] = useState<Provider[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const emergency = Boolean(search.emergency) || assessment?.urgency === "emergency";

  const mutation = useMutation({
    mutationFn: (vars: {
      specialty: string;
      latitude: number | null;
      longitude: number | null;
      city: string | null;
    }) => call({ data: { ...vars, radiusKm: 15, emergency } }),
    onSuccess: (data) => {
      setResult(data);
      setSelected(data.providers[0]?.place_id ?? null);
    },
  });

  const runSearch = useCallback(
    (coords: { lat: number; lng: number } | null, cityValue: string | null) => {
      if (demo) {
        setResult({
          providers: DEMO_PROVIDERS,
          center: { lat: 33.6007, lng: 73.0679 },
          resolved_location: "DEMO location",
          query_used: specialty,
          demo: true,
        });
        setSelected(DEMO_PROVIDERS[0]!.place_id);
        return;
      }
      mutation.mutate({
        specialty,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        city: cityValue,
      });
    },
    [demo, specialty, mutation],
  );

  useEffect(() => {
    const stored = getLocation();
    if (stored && !result && !mutation.isPending) {
      runSearch(
        stored.lat !== null && stored.lng !== null ? { lat: stored.lat, lng: stored.lng } : null,
        stored.mode === "manual" ? stored.label : null,
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function useMyLocation() {
    setLocError(null);
    try {
      const loc = await requestBrowserLocation();
      persistLocation(loc);
      runSearch({ lat: loc.lat!, lng: loc.lng! }, null);
    } catch (e) {
      setLocError((e as Error).message);
    }
  }

  function searchCity(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setLocError(null);
    persistLocation({ lat: null, lng: null, label: trimmed, mode: "manual" });
    navigate({ to: "/find-care", search: { specialty, emergency, city: trimmed } });
    runSearch(null, trimmed);
  }

  function toggleCompare(provider: Provider) {
    setCompare((prev) => {
      const exists = prev.some((p) => p.place_id === provider.place_id);
      if (exists) return prev.filter((p) => p.place_id !== provider.place_id);
      if (prev.length >= 3) return prev;
      return [...prev, provider];
    });
  }

  const providers = result?.providers ?? [];
  const errorMessage = mutation.error ? (mutation.error as Error).message : null;

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <SiteNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {emergency ? (
          <div className="mb-5">
            <EmergencyPanel
              redFlags={assessment?.red_flags ?? []}
              reason={assessment?.urgency_reason ?? undefined}
            />
          </div>
        ) : null}

        <h1 className="text-2xl font-bold sm:text-3xl">Find care near you</h1>
        <p className="text-sm text-muted-foreground">
          Real hospitals, clinics and providers from Google Places — never invented by AI.
        </p>

        <section className="card-soft mt-4 p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <div>
              <label htmlFor="specialty" className="text-xs font-semibold text-muted-foreground">
                Specialty
              </label>
              <select
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="focus-ring mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
              >
                {[...new Set([specialty, ...SPECIALTIES])].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="text-xs font-semibold text-muted-foreground">
                City or area
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchCity(city)}
                  placeholder="e.g. Rawalpindi"
                  className="focus-ring h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={() => searchCity(city)}
                  className="focus-ring grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"
                  aria-label="Search by city"
                >
                  <Search className="size-4" aria-hidden />
                </button>
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={useMyLocation}
                className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-teal-foreground md:w-auto"
              >
                <Navigation className="size-4" aria-hidden /> Use my current location
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCity(c);
                  searchCity(c);
                }}
                className="focus-ring rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
              >
                {c}
              </button>
            ))}
          </div>
          {locError ? (
            <p className="mt-3 rounded-xl bg-warning-soft p-3 text-sm">
              {locError} You can enter a city above instead.
            </p>
          ) : null}
          {result?.resolved_location ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden /> Showing results near{" "}
              {result.resolved_location}
            </p>
          ) : null}
        </section>

        {compare.length > 0 ? (
          <div className="mt-4">
            <CompareTable
              providers={compare}
              onRemove={(id) => setCompare((p) => p.filter((x) => x.place_id !== id))}
            />
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section aria-label="Provider results" className="space-y-3">
            <div className="flex items-center justify-between lg:hidden">
              <p className="text-sm font-semibold">{providers.length} providers</p>
              <button
                type="button"
                onClick={() => setShowMap((v) => !v)}
                className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold"
              >
                {showMap ? <X className="size-3.5" /> : <MapIcon className="size-3.5" />}
                {showMap ? "Hide map" : "Show map"}
              </button>
            </div>

            {showMap ? (
              <div className="h-72 lg:hidden">
                <ProviderMap
                  providers={providers}
                  center={result?.center ?? null}
                  selectedId={selected}
                  onSelect={setSelected}
                />
              </div>
            ) : null}

            {mutation.isPending ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="card-soft h-36 animate-pulse bg-surface" />
                ))}
              </div>
            ) : errorMessage ? (
              <div className="card-soft p-6 text-sm">
                <p className="font-semibold text-destructive">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => runSearch(null, city || null)}
                  className="focus-ring mt-3 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary"
                >
                  Try again
                </button>
              </div>
            ) : !result ? (
              <div className="card-soft grid place-items-center p-10 text-center">
                <Loader2 className="mb-3 size-6 text-muted-foreground" aria-hidden />
                <p className="text-sm font-medium">Choose a location to start</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Use your current location or search by city to discover real providers.
                </p>
              </div>
            ) : providers.length === 0 ? (
              <div className="card-soft p-6 text-sm">
                <p className="font-semibold">
                  No healthcare providers matching this specialty were found nearby.
                </p>
                <p className="mt-1 text-muted-foreground">
                  Try expanding your search area, or search a nearby city.
                </p>
              </div>
            ) : (
              providers.map((p, i) => (
                <ProviderCard
                  key={p.place_id}
                  provider={p}
                  index={i}
                  specialty={specialty}
                  selected={selected === p.place_id}
                  compared={compare.some((c) => c.place_id === p.place_id)}
                  onSelect={setSelected}
                  onCompare={toggleCompare}
                  demo={result.demo}
                />
              ))
            )}
          </section>

          <div className="sticky top-20 hidden h-[calc(100vh-7rem)] lg:block">
            <ProviderMap
              providers={providers}
              center={result?.center ?? null}
              selectedId={selected}
              onSelect={setSelected}
              onSearchArea={(c) => runSearch(c, null)}
              onRecenter={useMyLocation}
            />
          </div>
        </div>
      </main>
    </div>
  );
}