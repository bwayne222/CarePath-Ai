import type { Provider, ProviderDetails, ProviderReview, SearchResult } from "./types";

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

function keys() {
  const lovable = process.env["LOVABLE_API_KEY"];
  const maps = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lovable || !maps) {
    throw new Error(
      "Healthcare provider data is not configured. The Google Maps connector credentials are missing.",
    );
  }
  return { lovable, maps };
}

function authHeaders() {
  const { lovable, maps } = keys();
  return {
    Authorization: `Bearer ${lovable}`,
    "X-Connection-Api-Key": maps,
    "Content-Type": "application/json",
  };
}

async function handleFailure(response: Response): Promise<never> {
  const body = await response.text();
  console.error(`Google Maps gateway failed [${response.status}]: ${body}`);
  if (response.status === 403) {
    let reason: string | undefined;
    try {
      reason = JSON.parse(body)?.error?.details?.find((d: { reason?: string }) => d.reason)?.reason;
    } catch {
      reason = undefined;
    }
    if (reason === "API_KEY_HTTP_REFERRER_BLOCKED") {
      throw new Error(
        'The Google Maps server key is referrer-restricted. Set its application restrictions to "None" or "IP addresses".',
      );
    }
    if (reason === "API_KEY_SERVICE_BLOCKED") {
      throw new Error(
        "The Google Maps server key does not allow this API. Add it to the key's allowed-APIs list.",
      );
    }
    throw new Error("Google Maps denied this request (403). Check the server key restrictions.");
  }
  if (response.status === 429) {
    throw new Error("Provider search is rate limited right now. Please try again in a moment.");
  }
  throw new Error(`Healthcare provider data is temporarily unavailable (${response.status}).`);
}

const PLACE_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "rating",
  "userRatingCount",
  "internationalPhoneNumber",
  "nationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "currentOpeningHours",
  "regularOpeningHours",
  "photos",
  "primaryTypeDisplayName",
  "types",
  "businessStatus",
];

type RawPlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  currentOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  regularOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  photos?: { name?: string }[];
  primaryTypeDisplayName?: { text?: string };
  types?: string[];
  reviews?: {
    authorAttribution?: { displayName?: string };
    rating?: number;
    text?: { text?: string };
    originalText?: { text?: string };
    relativePublishTimeDescription?: string;
    publishTime?: string;
  }[];
  editorialSummary?: { text?: string };
};

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

function relevance(place: RawPlace, specialty: string, emergency: boolean): number {
  const haystack = [
    place.displayName?.text ?? "",
    place.primaryTypeDisplayName?.text ?? "",
    (place.types ?? []).join(" "),
  ]
    .join(" ")
    .toLowerCase();
  const words = specialty
    .toLowerCase()
    .replace(/specialist|physician|doctor/g, "")
    .split(/[^a-z]+/)
    .filter((w) => w.length > 3);
  let score = 0.35;
  for (const w of words) {
    const stem = w.replace(/(ist|ology|ologist|y)$/, "");
    if (stem.length > 3 && haystack.includes(stem)) score += 0.35;
  }
  if (emergency && /emergency|hospital/.test(haystack)) score += 0.4;
  if (/hospital|clinic|medical|doctor|health/.test(haystack)) score += 0.15;
  return Math.min(1, Math.round(score * 100) / 100);
}

function toProvider(
  place: RawPlace,
  center: { lat: number; lng: number } | null,
  specialty: string,
  emergency: boolean,
): Provider | null {
  if (!place.id || !place.displayName?.text) return null;
  const hours = place.currentOpeningHours ?? place.regularOpeningHours;
  const lat = place.location?.latitude ?? null;
  const lng = place.location?.longitude ?? null;
  return {
    place_id: place.id,
    name: place.displayName.text,
    type: place.primaryTypeDisplayName?.text ?? (place.types?.[0]?.replace(/_/g, " ") ?? "Healthcare provider"),
    address: place.formattedAddress ?? null,
    latitude: lat,
    longitude: lng,
    phone: place.internationalPhoneNumber ?? place.nationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    rating: place.rating ?? null,
    review_count: place.userRatingCount ?? null,
    open_now: hours?.openNow ?? null,
    opening_hours: hours?.weekdayDescriptions ?? null,
    maps_url: place.googleMapsUri ?? null,
    photo_names: (place.photos ?? []).map((p) => p.name).filter((n): n is string => Boolean(n)),
    distance_km: center && lat !== null && lng !== null ? distanceKm(center, { lat, lng }) : null,
    specialty_relevance: relevance(place, specialty, emergency),
    source: "google_places",
    last_updated: new Date().toISOString(),
  };
}

export async function geocodeLocation(
  query: string,
): Promise<{ lat: number; lng: number; label: string } | null> {
  const res = await fetch(
    `${GATEWAY}/maps/api/geocode/json?address=${encodeURIComponent(query)}`,
    { headers: authHeaders() },
  );
  if (!res.ok) await handleFailure(res);
  const json = (await res.json()) as {
    status?: string;
    results?: {
      geometry?: { location?: { lat: number; lng: number } };
      formatted_address?: string;
    }[];
  };
  const first = json.results?.[0];
  if (json.status !== "OK" || !first?.geometry?.location) return null;
  return {
    lat: first.geometry.location.lat,
    lng: first.geometry.location.lng,
    label: first.formatted_address ?? query,
  };
}

export function buildQueries(specialty: string, emergency: boolean): string[] {
  const s = specialty.trim() || "General Physician";
  if (emergency) return ["emergency hospital", "emergency room", `${s} hospital`];
  const base = s.toLowerCase();
  if (/general|family/.test(base)) return ["general physician", "medical clinic", "hospital"];
  return [s, `${s} clinic`, `hospital with ${s.toLowerCase()} department`];
}

async function textSearch(
  query: string,
  center: { lat: number; lng: number } | null,
  radiusMeters: number,
): Promise<RawPlace[]> {
  const body: Record<string, unknown> = { textQuery: query, maxResultCount: 20 };
  if (center) {
    body["locationBias"] = {
      circle: {
        center: { latitude: center.lat, longitude: center.lng },
        radius: Math.min(50000, Math.max(1000, radiusMeters)),
      },
    };
  }
  const res = await fetch(`${GATEWAY}/places/v1/places:searchText`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "X-Goog-FieldMask": PLACE_FIELDS.map((f) => `places.${f}`).join(","),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) await handleFailure(res);
  const json = (await res.json()) as { places?: RawPlace[] };
  return json.places ?? [];
}

export async function searchProviders(input: {
  specialty: string;
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  radiusKm?: number | null;
  emergency?: boolean | null;
}): Promise<SearchResult> {
  const emergency = Boolean(input.emergency);
  const radius = (input.radiusKm ?? 15) * 1000;
  let center: { lat: number; lng: number } | null = null;
  let label: string | null = null;

  if (typeof input.latitude === "number" && typeof input.longitude === "number") {
    center = { lat: input.latitude, lng: input.longitude };
    label = "Your current location";
  } else if (input.city?.trim()) {
    const geo = await geocodeLocation(input.city.trim());
    if (!geo) {
      return {
        providers: [],
        center: null,
        resolved_location: null,
        query_used: input.city,
        demo: false,
      };
    }
    center = { lat: geo.lat, lng: geo.lng };
    label = geo.label;
  }

  const queries = buildQueries(input.specialty, emergency);
  const locationSuffix = center ? "" : ` in ${input.city ?? ""}`;
  const results = await Promise.all(
    queries.map((q) => textSearch(`${q}${locationSuffix}`, center, radius)),
  );

  const seen = new Map<string, Provider>();
  for (const place of results.flat()) {
    const provider = toProvider(place, center, input.specialty, emergency);
    if (!provider) continue;
    const existing = seen.get(provider.place_id);
    if (!existing || provider.specialty_relevance > existing.specialty_relevance) {
      seen.set(provider.place_id, provider);
    }
  }

  const providers = [...seen.values()]
    .sort((a, b) => {
      const rel = b.specialty_relevance - a.specialty_relevance;
      if (Math.abs(rel) > 0.15) return rel;
      const da = a.distance_km ?? 999;
      const db = b.distance_km ?? 999;
      if (Math.abs(da - db) > 0.4) return da - db;
      return (b.rating ?? 0) - (a.rating ?? 0);
    })
    .slice(0, 24);

  return {
    providers,
    center,
    resolved_location: label,
    query_used: queries[0] ?? input.specialty,
    demo: false,
  };
}

export async function getProviderDetails(
  placeId: string,
  center: { lat: number; lng: number } | null,
  specialty: string,
): Promise<ProviderDetails> {
  const fields = [...PLACE_FIELDS, "reviews", "editorialSummary"].join(",");
  const res = await fetch(`${GATEWAY}/places/v1/places/${encodeURIComponent(placeId)}`, {
    headers: { ...authHeaders(), "X-Goog-FieldMask": fields },
  });
  if (!res.ok) await handleFailure(res);
  const place = (await res.json()) as RawPlace;
  const provider = toProvider(place, center, specialty, false);
  if (!provider) throw new Error("This provider could not be found.");
  const reviews: ProviderReview[] = (place.reviews ?? []).map((r) => ({
    author: r.authorAttribution?.displayName ?? null,
    rating: r.rating ?? null,
    text: r.text?.text ?? r.originalText?.text ?? null,
    relative_time: r.relativePublishTimeDescription ?? null,
    publish_time: r.publishTime ?? null,
  }));
  return { provider, reviews, editorial_summary: place.editorialSummary?.text ?? null };
}

export async function fetchPlacePhoto(photoName: string, maxWidth: number): Promise<Response> {
  const res = await fetch(
    `${GATEWAY}/places/v1/${photoName}/media?maxWidthPx=${maxWidth}&skipHttpRedirect=true`,
    { headers: authHeaders() },
  );
  if (!res.ok) await handleFailure(res);
  const json = (await res.json()) as { photoUri?: string };
  if (!json.photoUri) throw new Error("Photo unavailable");
  const image = await fetch(json.photoUri);
  return new Response(image.body, {
    status: image.status,
    headers: {
      "Content-Type": image.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}