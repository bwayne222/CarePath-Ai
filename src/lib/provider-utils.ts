import type { Provider } from "./types";

export function photoUrl(photoName: string, width: number) {
  return `/api/photo?name=${encodeURIComponent(photoName)}&w=${width}`;
}

export function directionsUrl(provider: Provider) {
  if (provider.latitude !== null && provider.longitude !== null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${provider.latitude},${provider.longitude}&destination_place_id=${provider.place_id}`;
  }
  return provider.maps_url ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.name)}`;
}

export const URGENCY_STYLES: Record<string, { label: string; className: string }> = {
  emergency: { label: "Emergency", className: "bg-destructive text-destructive-foreground" },
  urgent: { label: "Urgent", className: "bg-warning text-primary" },
  routine: { label: "Routine", className: "bg-teal-soft text-teal-foreground" },
};

/**
 * Transparent, application-generated ranking. Every input comes from real
 * Places data; components with no data contribute 0 and are shown as such.
 */
export function carePathMatch(provider: Provider) {
  const relevance = provider.specialty_relevance * 40;
  const distance =
    provider.distance_km === null ? 0 : Math.max(0, 20 - Math.min(20, provider.distance_km * 1.5));
  const rating = provider.rating === null ? 0 : (provider.rating / 5) * 20;
  const volume =
    provider.review_count === null
      ? 0
      : Math.min(10, (Math.log10(provider.review_count + 1) / 3) * 10);
  const availability = provider.open_now === true ? 10 : provider.open_now === false ? 4 : 0;
  return {
    total: Math.round(relevance + distance + rating + volume + availability),
    parts: [
      { label: "Specialty relevance (40)", value: Math.round(relevance) },
      { label: "Distance (20)", value: Math.round(distance) },
      { label: "Rating (20)", value: Math.round(rating) },
      { label: "Review volume (10)", value: Math.round(volume) },
      { label: "Availability (10)", value: Math.round(availability) },
    ],
  };
}