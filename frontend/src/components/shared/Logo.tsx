import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 36 36"
      fill="none"
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="36" height="36" rx="8" className="fill-foreground" />
      <text
        x="18"
        y="24"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="18"
        fontWeight="700"
        letterSpacing="-0.5"
        className="fill-background"
      >
        rm
      </text>
    </svg>
  );
}
