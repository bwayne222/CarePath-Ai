import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  BookmarkCheck,
  Clock,
  Globe,
  MapPin,
  Navigation,
  Phone,
  Star,
} from "lucide-react";
import type { Provider } from "@/lib/types";
import { toggleSaved, useSavedProviders } from "@/lib/care-session";
import { photoUrl, directionsUrl } from "@/lib/provider-utils";
import { cn } from "@/lib/utils";

type Props = {
  provider: Provider;
  index: number;
  specialty: string;
  selected?: boolean;
  compared?: boolean;
  onSelect?: (placeId: string) => void;
  onCompare?: (provider: Provider) => void;
  demo?: boolean;
};

export function ProviderCard({
  provider,
  index,
  specialty,
  selected,
  compared,
  onSelect,
  onCompare,
  demo,
}: Props) {
  const saved = useSavedProviders().some((p) => p.place_id === provider.place_id);
  const photo = provider.photo_names[0] ? photoUrl(provider.photo_names[0], 320) : null;

  return (
    <article
      onClick={() => onSelect?.(provider.place_id)}
      className={cn(
        "card-soft focus-ring group p-4 transition-all",
        onSelect && "cursor-pointer hover:shadow-lift",
        selected && "ring-2 ring-teal",
      )}
    >
      <div className="flex gap-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-surface sm:size-24">
          {photo ? (
            <img
              src={photo}
              alt={`Photo of ${provider.name}`}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <span className="grid size-full place-items-center text-muted-foreground">
              <MapPin className="size-6" aria-hidden />
            </span>
          )}
          <span className="absolute top-1 left-1 grid size-5 place-items-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
            {index + 1}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-semibold">{provider.name}</h3>
              <p className="truncate text-xs text-muted-foreground capitalize">{provider.type}</p>
            </div>
            <button
              type="button"
              aria-label={saved ? "Remove from saved providers" : "Save provider"}
              onClick={(e) => {
                e.stopPropagation();
                toggleSaved(provider, specialty);
              }}
              className="focus-ring rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {saved ? (
                <BookmarkCheck className="size-4 text-teal" aria-hidden />
              ) : (
                <Bookmark className="size-4" aria-hidden />
              )}
            </button>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {provider.rating !== null ? (
              <span className="inline-flex items-center gap-1 font-medium">
                <Star className="size-3.5 fill-warning text-warning" aria-hidden />
                {provider.rating.toFixed(1)}
                {provider.review_count !== null ? (
                  <span className="text-muted-foreground">({provider.review_count})</span>
                ) : null}
              </span>
            ) : (
              <span className="text-muted-foreground">Rating not available</span>
            )}
            {provider.distance_km !== null ? (
              <span className="text-muted-foreground">{provider.distance_km} km</span>
            ) : null}
            {provider.open_now !== null ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium",
                  provider.open_now ? "text-teal" : "text-muted-foreground",
                )}
              >
                <Clock className="size-3.5" aria-hidden />
                {provider.open_now ? "Open now" : "Closed"}
              </span>
            ) : null}
            <span className="rounded-full bg-info-soft px-2 py-0.5 font-medium text-info">
              {Math.round(provider.specialty_relevance * 100)}% specialty match
            </span>
            {demo ? (
              <span className="rounded-full bg-warning-soft px-2 py-0.5 font-bold text-warning uppercase">
                Demo data
              </span>
            ) : null}
          </div>

          {provider.address ? (
            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{provider.address}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
        <Link
          to="/provider/$placeId"
          params={{ placeId: provider.place_id }}
          className="focus-ring rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          View details
        </Link>
        {provider.latitude !== null && provider.longitude !== null ? (
          <a
            href={directionsUrl(provider)}
            target="_blank"
            rel="noreferrer noopener"
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary"
          >
            <Navigation className="size-3.5" aria-hidden /> Directions
          </a>
        ) : null}
        {provider.phone ? (
          <a
            href={`tel:${provider.phone.replace(/\s/g, "")}`}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary"
          >
            <Phone className="size-3.5" aria-hidden /> Call
          </a>
        ) : null}
        {provider.website ? (
          <a
            href={provider.website}
            target="_blank"
            rel="noreferrer noopener"
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary"
          >
            <Globe className="size-3.5" aria-hidden /> Website
          </a>
        ) : null}
        {onCompare ? (
          <button
            type="button"
            onClick={() => onCompare(provider)}
            className={cn(
              "focus-ring ml-auto rounded-lg border px-3 py-2 text-xs font-semibold",
              compared
                ? "border-teal bg-teal-soft text-teal-foreground"
                : "border-border hover:bg-secondary",
            )}
          >
            {compared ? "In comparison" : "Compare"}
          </button>
        ) : null}
      </div>
    </article>
  );
}