import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, RotateCcw, Send, Stethoscope } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { EmergencyPanel } from "@/components/emergency-panel";
import { triageTurn } from "@/lib/carepath.functions";
import { setAssessment } from "@/lib/care-session";
import { URGENCY_STYLES } from "@/lib/provider-utils";
import type { Assessment, ChatTurn } from "@/lib/types";

export const Route = createFileRoute("/symptom-check")({
  head: () => ({
    meta: [
      { title: "Symptom Check — CarePath AI guided health assessment" },
      {
        name: "description",
        content:
          "Describe your symptoms and get structured, safety-aware guidance on possible health concerns, the right medical specialty and how urgent it may be.",
      },
      { property: "og:title", content: "Symptom Check — CarePath AI" },
      {
        property: "og:description",
        content:
          "Conversational symptom guidance with specialty and urgency recommendations. Not a diagnosis.",
      },
    ],
  }),
  component: SymptomCheckPage,
});

const OPENING =
  "Hi, I'm CarePath AI. Tell me what you're experiencing, and I'll help you understand what type of medical care may be appropriate.";

const STARTERS = [
  "I've had a persistent skin rash on my arm for two weeks. It is itchy and getting worse.",
  "I've had a sore throat and fever since yesterday.",
  "I get headaches most afternoons this month.",
];

function SymptomCheckPage() {
  const navigate = useNavigate();
  const call = useServerFn(triageTurn);
  const [messages, setMessages] = useState<ChatTurn[]>([{ role: "assistant", content: OPENING }]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [assessment, setLocalAssessment] = useState<Assessment | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const mutation = useMutation({
    mutationFn: (next: ChatTurn[]) => call({ data: { messages: next } }),
    onSuccess: (turn) => {
      setMessages((prev) => [...prev, { role: "assistant", content: turn.reply }]);
      setQuickReplies(turn.quick_replies ?? []);
      if (turn.phase === "assessment" && turn.assessment) {
        setLocalAssessment(turn.assessment);
        setAssessment(turn.assessment);
      }
    },
    onError: (e: Error) =>
      setError(
        e.message.includes("402")
          ? "AI guidance is temporarily unavailable (AI credits exhausted for this workspace)."
          : "We couldn't reach the guidance service. Please try again.",
      ),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, assessment, mutation.isPending]);

  function send(text: string) {
    const value = text.trim();
    if (!value || mutation.isPending) return;
    setError(null);
    setQuickReplies([]);
    setInput("");
    const next: ChatTurn[] = [...messages, { role: "user", content: value }];
    setMessages(next);
    mutation.mutate(next.filter((m, i) => !(i === 0 && m.role === "assistant")));
  }

  function restart() {
    setMessages([{ role: "assistant", content: OPENING }]);
    setQuickReplies([]);
    setLocalAssessment(null);
    setAssessment(null);
    setError(null);
  }

  function editLast() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const idx = messages.findIndex((m) => m === lastUser);
    if (idx < 0) return;
    setInput(lastUser?.content ?? "");
    setMessages(messages.slice(0, idx));
    setLocalAssessment(null);
    setQuickReplies([]);
  }

  const answered = messages.filter((m) => m.role === "user").length;
  const progress = assessment ? 100 : Math.min(90, answered * 22);

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Symptom Check</h1>
            <p className="text-sm text-muted-foreground">
              Guided questions, then a structured summary. Not a diagnosis.
            </p>
          </div>
          <button
            type="button"
            onClick={restart}
            className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary"
          >
            <RotateCcw className="size-3.5" aria-hidden /> Start over
          </button>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface" aria-hidden>
          <div
            className="h-full rounded-full bg-teal transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <section className="mt-5 space-y-3" aria-live="polite">
          {messages.map((m, i) => (
            <div
              key={`${i}-${m.content.slice(0, 12)}`}
              className={m.role === "user" ? "flex justify-end" : "flex gap-2.5"}
            >
              {m.role === "assistant" ? (
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Stethoscope className="size-4 text-teal" aria-hidden />
                </span>
              ) : null}
              <p
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground"
                    : "max-w-[85%] rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-sm shadow-soft"
                }
              >
                {m.content}
              </p>
            </div>
          ))}

          {mutation.isPending ? (
            <div className="flex gap-2.5">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Stethoscope className="size-4 text-teal" aria-hidden />
              </span>
              <div className="min-w-[12rem] rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin text-teal" aria-hidden />
                  <span>CarePath AI is thinking…</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-40 animate-pulse rounded bg-surface" />
                  <div className="h-3 w-28 animate-pulse rounded bg-surface" />
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl border border-destructive/40 bg-danger-soft p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {messages.length === 1 && !mutation.isPending ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="focus-ring rounded-full border border-border bg-card px-3 py-2 text-left text-xs font-medium hover:bg-secondary"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          {quickReplies.length > 0 && !mutation.isPending ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="focus-ring rounded-full border border-teal/40 bg-teal-soft px-3 py-2 text-xs font-semibold text-teal-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          ) : null}
          <div ref={endRef} />
        </section>

        {!assessment ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="sticky bottom-16 mt-5 flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-lift md:bottom-4"
          >
            <label htmlFor="symptom-input" className="sr-only">
              Describe your symptoms
            </label>
            <textarea
              id="symptom-input"
              rows={1}
              value={input}
              disabled={mutation.isPending}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={
                mutation.isPending ? "CarePath AI is thinking…" : "Describe what you're experiencing…"
              }
              className="focus-ring max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            {messages.some((m) => m.role === "user") ? (
              <button
                type="button"
                onClick={editLast}
                disabled={mutation.isPending}
                className="focus-ring rounded-xl border border-border px-3 py-2.5 text-xs font-semibold hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Edit answer
              </button>
            ) : null}
            <button
              type="submit"
              disabled={mutation.isPending || !input.trim()}
              className="focus-ring grid size-11 place-items-center rounded-xl bg-teal text-teal-foreground disabled:opacity-40"
              aria-label={mutation.isPending ? "AI is thinking" : "Send message"}
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Send className="size-4" aria-hidden />
              )}
            </button>
          </form>
        ) : (
          <AssessmentView
            assessment={assessment}
            onContinue={() =>
              navigate({
                to: "/find-care",
                search: {
                  specialty: assessment.recommended_specialty,
                  emergency: assessment.urgency === "emergency",
                },
              })
            }
            onRestart={restart}
          />
        )}
      </main>
    </div>
  );
}

function AssessmentView({
  assessment,
  onContinue,
  onRestart,
}: {
  assessment: Assessment;
  onContinue: () => void;
  onRestart: () => void;
}) {
  const urgency = URGENCY_STYLES[assessment.urgency] ?? URGENCY_STYLES["routine"]!;
  return (
    <div className="mt-6 space-y-4">
      {assessment.urgency === "emergency" ? (
        <EmergencyPanel redFlags={assessment.red_flags} reason={assessment.urgency_reason} />
      ) : null}

      <section className="card-soft p-5">
        <h2 className="text-lg font-semibold">Symptom summary</h2>
        <p className="mt-2 text-sm text-muted-foreground">{assessment.summary}</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["Symptoms", assessment.collected.symptoms],
            ["Duration", assessment.collected.duration],
            ["Severity", assessment.collected.severity],
            ["Related symptoms", assessment.collected.related_symptoms],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-surface p-3">
              <dt className="text-xs font-semibold text-muted-foreground uppercase">{label}</dt>
              <dd className="mt-0.5 text-sm">{value || "Not provided"}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card-soft p-5">
        <h2 className="text-lg font-semibold">Possible health concerns</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Based on the symptoms you described, these are possible conditions or health concerns
          that may be relevant. A qualified healthcare professional should evaluate you for an
          actual diagnosis.
        </p>
        <ul className="mt-4 space-y-3">
          {assessment.possible_conditions.map((c) => (
            <li key={c.name} className="rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.explanation}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Why it may relate: </span>
                {c.why_relevant}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-soft p-5">
        <h2 className="text-lg font-semibold">Recommended care</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
            {assessment.recommended_specialty}
          </span>
          <span className={`rounded-xl px-3 py-2 text-sm font-semibold ${urgency.className}`}>
            {urgency.label}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{assessment.urgency_reason}</p>
        <p className="mt-3 rounded-xl bg-surface p-3 text-xs text-muted-foreground">
          {assessment.safety_message}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onContinue}
            className="focus-ring rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-teal-foreground"
          >
            Find {assessment.recommended_specialty} near me
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary"
          >
            <ArrowLeft className="size-4" aria-hidden /> Start over
          </button>
          <Link
            to="/about"
            className="focus-ring rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary"
          >
            How this works
          </Link>
        </div>
      </section>
    </div>
  );
}