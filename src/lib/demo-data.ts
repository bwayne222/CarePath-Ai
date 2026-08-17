import type { Provider, ProviderReview } from "./types";

/**
 * CLEARLY LABELLED DEMO DATA — not real providers.
 * Only used when the app is explicitly switched into Demo Mode. Every name is
 * prefixed with "DEMO" so it can never be mistaken for real provider data.
 */
export const DEMO_PROVIDERS: Provider[] = [
  {
    place_id: "demo-1",
    name: "DEMO — Example Skin & Dermatology Centre",
    type: "Dermatology clinic (demo record)",
    address: "Demo address, sample city",
    latitude: 33.6007,
    longitude: 73.0679,
    phone: null,
    website: null,
    rating: 4.5,
    review_count: 128,
    open_now: true,
    opening_hours: ["Demo hours: Mon–Sat 09:00–18:00"],
    maps_url: null,
    photo_names: [],
    distance_km: 2.4,
    specialty_relevance: 0.95,
    source: "google_places",
    last_updated: new Date().toISOString(),
  },
  {
    place_id: "demo-2",
    name: "DEMO — Sample General Hospital",
    type: "Hospital (demo record)",
    address: "Demo address, sample city",
    latitude: 33.6142,
    longitude: 73.0451,
    phone: null,
    website: null,
    rating: 4.1,
    review_count: 640,
    open_now: true,
    opening_hours: ["Demo hours: Open 24 hours"],
    maps_url: null,
    photo_names: [],
    distance_km: 4.1,
    specialty_relevance: 0.6,
    source: "google_places",
    last_updated: new Date().toISOString(),
  },
  {
    place_id: "demo-3",
    name: "DEMO — Placeholder Family Clinic",
    type: "Medical clinic (demo record)",
    address: "Demo address, sample city",
    latitude: 33.5789,
    longitude: 73.0895,
    phone: null,
    website: null,
    rating: 3.9,
    review_count: 42,
    open_now: false,
    opening_hours: ["Demo hours: Mon–Fri 10:00–17:00"],
    maps_url: null,
    photo_names: [],
    distance_km: 5.8,
    specialty_relevance: 0.5,
    source: "google_places",
    last_updated: new Date().toISOString(),
  },
];

export const DEMO_REVIEWS: ProviderReview[] = [
  {
    author: "Demo reviewer",
    rating: 5,
    text: "DEMO REVIEW — sample text used only for interface demonstration.",
    relative_time: "demo",
    publish_time: null,
  },
];