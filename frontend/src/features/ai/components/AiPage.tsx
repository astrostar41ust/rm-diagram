"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api";
import { useGeneratePrompt, useWeekSummary } from "../hooks";

const MAX_CHARS = 4000;

type Suggestion =
  | { label: string; emoji: string; kind: "week-summary" }
  | { label: string; emoji: string; kind: "prompt"; prompt: string };

const SUGGESTIONS: Suggestion[] = [
  {
    label: "Weekly summary",
    emoji: "📊",
    kind: "week-summary",
  },
  {
    label: "Suggest a habit",
    emoji: "💪",
    kind: "prompt",
    prompt:
      "Based on my current habits, suggest one new habit I could add this month and explain why it would help.",
  },
  {
    label: "Budget tips",
    emoji: "💰",
    kind: "prompt",
    prompt:
      "Look at my spending this week and pick one category where I could realistically cut back. Be specific.",
  },
  {
    label: "Reflect on goals",
    emoji: "🎯",
    kind: "prompt",
    prompt:
      "Help me reflect on my active goals — where am I making real progress, and where am I drifting?",
  },
];

type Action =
  | { type: "week-summary" }
  | { type: "prompt"; prompt: string };

export function AiPage() {
  const [input, setInput] = useState("");
  const [lastAction, setLastAction] = useState<Action | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const summary = useWeekSummary();
  const ask = useGeneratePrompt();
  const isPending = summary.isPending || ask.isPending;
  const error = summary.error ?? ask.error;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 240)}px`;
  }, [input]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function runWeekSummary() {
    if (isPending) return;
    setLastAction({ type: "week-summary" });
    setResponse(null);
    summary.mutate(undefined, {
      onSuccess: (data) => setResponse(data.response),
    });
  }

  function runPrompt(prompt: string) {
    if (isPending) return;
    setLastAction({ type: "prompt", prompt });
    setResponse(null);
    ask.mutate(
      { prompt },
      {
        onSuccess: (data) => setResponse(data.response),
      },
    );
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isPending) return;
    runPrompt(trimmed);
    setInput("");
  }

  function handleSuggestion(s: Suggestion) {
    if (s.kind === "week-summary") runWeekSummary();
    else runPrompt(s.prompt);
  }

  function handleRegenerate() {
    if (!lastAction || isPending) return;
    if (lastAction.type === "week-summary") runWeekSummary();
    else runPrompt(lastAction.prompt);
  }

  async function handleCopy() {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  const charCount = input.length;
  const overLimit = charCount > MAX_CHARS;
  const canSend = input.trim().length > 0 && !overLimit && !isPending;

  return (
    <div className="mx-auto flex min-h-[calc(100svh-7rem)] max-w-3xl flex-col gap-6">
      <header className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Coach</h1>
          <p className="text-sm text-muted-foreground">
            Reflections on your week, plus a model that&apos;ll answer anything.
          </p>
        </div>
      </header>

      <section className="flex-1">
        {isPending ? (
          <ThinkingState action={lastAction} />
        ) : error ? (
          <ErrorState message={getApiErrorMessage(error)} onRetry={handleRegenerate} />
        ) : response ? (
          <ResponseCard
            text={response}
            copied={copied}
            onCopy={handleCopy}
            onRegenerate={handleRegenerate}
          />
        ) : (
          <EmptyState />
        )}
      </section>

      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Suggestions
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => handleSuggestion(s)}
              disabled={isPending}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors",
                "hover:border-primary/40 hover:bg-primary/5 hover:text-foreground",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            >
              <span aria-hidden>{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section
        className={cn(
          "rounded-xl border bg-card transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          overLimit ? "border-destructive" : "border-border",
        )}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything… (⌘ / Ctrl + Enter to send)"
          disabled={isPending}
          rows={2}
          className="w-full resize-none rounded-t-xl bg-transparent px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <p
            className={cn(
              "text-xs tabular-nums",
              overLimit ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </p>
          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            disabled={!canSend}
            className="gap-1.5"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Send
          </Button>
        </div>
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-gradient-to-br from-primary/[0.04] to-transparent px-6 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
        <Sparkles className="size-7" />
      </div>
      <h2 className="text-lg font-semibold">Ask me anything</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        I can reflect on your habits, spending, journal, and goals — or just
        chat. Pick a suggestion or type below to get started.
      </p>
    </div>
  );
}

function ThinkingState({ action }: { action: Action | null }) {
  const label =
    action?.type === "week-summary"
      ? "Reflecting on your week…"
      : "Thinking…";
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
          <Sparkles className="size-4 animate-pulse" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="space-y-2.5">
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-muted" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
      <p className="text-sm font-medium text-destructive">
        Something went wrong
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={onRetry}
      >
        <RefreshCw className="size-4" data-icon="inline-start" />
        Try again
      </Button>
    </div>
  );
}

function ResponseCard({
  text,
  copied,
  onCopy,
  onRegenerate,
}: {
  text: string;
  copied: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
          <Sparkles className="size-4" />
        </div>
        <span className="text-sm font-medium">AI</span>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
      <div className="mt-5 flex items-center gap-1.5 border-t border-border pt-4">
        <Button variant="ghost" size="sm" onClick={onCopy} className="gap-1.5">
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          className="gap-1.5"
        >
          <RefreshCw className="size-3.5" />
          Regenerate
        </Button>
      </div>
    </div>
  );
}
