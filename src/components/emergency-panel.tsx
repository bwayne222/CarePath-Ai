import { Link } from "@tanstack/react-router";
import { AlertTriangle, PhoneCall } from "lucide-react";

export function EmergencyPanel({
  redFlags,
  reason,
}: {
  redFlags: string[];
  reason?: string | undefined;
}) {
  return (
    <section
      role="alert"
      className="rounded-2xl border-2 border-destructive bg-danger-soft p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-destructive text-destructive-foreground">
          <AlertTriangle className="size-5" aria-hidden />
        </span>
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-destructive sm:text-2xl">
            Your symptoms may require immediate medical attention.
          </h2>
          <p className="text-sm font-medium text-foreground">
            Please seek emergency medical care now or contact your local emergency service.
          </p>
          {reason ? <p className="text-sm text-foreground/80">{reason}</p> : null}
          {redFlags.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
              {redFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              to="/find-care"
              search={{ specialty: "Emergency Department", emergency: true }}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground"
            >
              <PhoneCall className="size-4" aria-hidden />
              Find nearby hospitals
            </Link>
          </div>
          <p className="text-xs text-foreground/70">
            CarePath AI cannot call emergency services for you. Use your local emergency number
            (for example 1122 in Pakistan, 911 in the US, 112 in the EU).
          </p>
        </div>
      </div>
    </section>
  );
}