import { Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import type { ReviewInsights } from "@/lib/types";

export function ReviewInsightsPanel({
  insights,
  loading,
}: {
  insights: ReviewInsights | null;
  loading: boolean;
}) {
  return (
    <section className="card-soft p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-teal" aria-hidden />
        <h2 className="text-lg font-semibold">Patient Review Insights</h2>
        <span className="ml-auto rounded-full bg-info-soft px-2 py-0.5 text-[11px] font-semibold text-info">
          AI-generated interpretation
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Generated only from the patient reviews returned by Google Places for this provider.
      </p>

      {loading ? (
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-surface" />
          ))}
        </div>
      ) : !insights ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Review insights could not be generated right now.
        </p>
      ) : !insights.enough_data ? (
        <p className="mt-4 rounded-xl bg-surface p-3 text-sm text-muted-foreground">
          {insights.message}
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-teal-foreground">
                <ThumbsUp className="size-4 text-teal" aria-hidden /> Commonly liked
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {insights.liked.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <ThumbsDown className="size-4 text-warning" aria-hidden /> Commonly mentioned
                negatively
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {insights.criticised.length ? (
                  insights.criticised.map((item) => <li key={item}>• {item}</li>)
                ) : (
                  <li>No recurring negative themes in the available reviews.</li>
                )}
              </ul>
            </div>
          </div>
          {insights.themes.length ? (
            <div className="flex flex-wrap gap-2">
              {insights.themes.map((t) => (
                <span key={t} className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
          <p className="text-sm">
            <span className="font-semibold">Overall sentiment: </span>
            {insights.sentiment}
          </p>
          <p className="text-xs text-muted-foreground">
            Based on {insights.reviews_analyzed} available review
            {insights.reviews_analyzed === 1 ? "" : "s"}. {insights.message}
          </p>
        </div>
      )}
    </section>
  );
}