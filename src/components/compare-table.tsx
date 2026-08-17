import { X } from "lucide-react";
import type { Provider } from "@/lib/types";
import { carePathMatch } from "@/lib/provider-utils";

export function CompareTable({
  providers,
  onRemove,
}: {
  providers: Provider[];
  onRemove: (placeId: string) => void;
}) {
  const rows: { label: string; render: (p: Provider) => string }[] = [
    { label: "Type", render: (p) => p.type },
    { label: "Rating", render: (p) => (p.rating !== null ? p.rating.toFixed(1) : "Not available") },
    {
      label: "Review count",
      render: (p) => (p.review_count !== null ? String(p.review_count) : "Not available"),
    },
    {
      label: "Distance",
      render: (p) => (p.distance_km !== null ? `${p.distance_km} km` : "Not available"),
    },
    {
      label: "Open now",
      render: (p) => (p.open_now === null ? "Not available" : p.open_now ? "Open" : "Closed"),
    },
    { label: "Phone", render: (p) => p.phone ?? "Not available" },
    { label: "Website", render: (p) => (p.website ? "Available" : "Not available") },
    {
      label: "Specialty relevance",
      render: (p) => `${Math.round(p.specialty_relevance * 100)}%`,
    },
    { label: "CarePath Match", render: (p) => `${carePathMatch(p).total}/100` },
  ];

  return (
    <section className="card-soft overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
        <h2 className="text-sm font-semibold">Comparing {providers.length} of 3 providers</h2>
        <span className="rounded-full bg-info-soft px-2 py-0.5 text-[11px] font-medium text-info">
          CarePath Match is an app-generated ranking (specialty 40 / distance 20 / rating 20 /
          review volume 10 / availability 10) — not a medical quality certification.
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr>
              <th scope="col" className="p-3 text-left text-xs text-muted-foreground">
                Provider
              </th>
              {providers.map((p) => (
                <th key={p.place_id} scope="col" className="p-3 text-left align-top">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold">{p.name}</span>
                    <button
                      type="button"
                      onClick={() => onRemove(p.place_id)}
                      aria-label={`Remove ${p.name} from comparison`}
                      className="focus-ring rounded p-1 text-muted-foreground hover:bg-secondary"
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <th scope="row" className="p-3 text-left text-xs font-medium text-muted-foreground">
                  {row.label}
                </th>
                {providers.map((p) => (
                  <td key={p.place_id} className="p-3">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}