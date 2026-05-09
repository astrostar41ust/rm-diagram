"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotifications } from "../hooks";
import type { NotificationItem } from "../types";

function severityStyles(severity: NotificationItem["severity"]) {
  if (severity === "DANGER")
    return { ring: "bg-red-500", icon: AlertTriangle, color: "text-red-500" };
  if (severity === "WARNING")
    return {
      ring: "bg-amber-500",
      icon: AlertTriangle,
      color: "text-amber-500",
    };
  return { ring: "bg-primary", icon: Info, color: "text-primary" };
}

export function NotificationBell() {
  const router = useRouter();
  const { data } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const total = data?.total ?? 0;

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {total > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 rounded-lg border border-border bg-popover shadow-lg">
          <div className="border-b border-border px-3 py-2 text-sm font-medium">
            Notifications
          </div>
          <div className="max-h-96 overflow-y-auto scroll-thin p-1">
            {!data || data.items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CheckCircle2 className="size-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">All caught up.</p>
              </div>
            ) : (
              data.items.map((n) => {
                const { ring, icon: Icon, color } = severityStyles(n.severity);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      router.push(n.href);
                      setOpen(false);
                    }}
                    className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-muted"
                  >
                    <span
                      className={cn(
                        "mt-1 flex size-2 shrink-0 rounded-full",
                        ring,
                      )}
                    />
                    <Icon className={cn("mt-0.5 size-4 shrink-0", color)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{n.title}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {n.body}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
