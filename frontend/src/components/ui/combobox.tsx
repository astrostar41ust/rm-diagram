"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ComboboxOption<V extends string | number = string | number> {
  value: V;
  label: string;
  /** Optional emoji or short string rendered before the label. */
  icon?: string;
  /** Secondary text shown to the right (e.g. category type). */
  hint?: string;
}

interface ComboboxProps<V extends string | number> {
  options: readonly ComboboxOption<V>[];
  value: V | null | undefined;
  onChange: (value: V | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  /** Width of the popup; defaults to matching the trigger. */
  popupWidth?: "trigger" | "auto";
  id?: string;
  "aria-invalid"?: boolean;
}

export function Combobox<V extends string | number>({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results.",
  disabled,
  className,
  triggerClassName,
  popupWidth = "trigger",
  id,
  "aria-invalid": ariaInvalid,
}: ComboboxProps<V>) {
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <ComboboxPrimitive.Root<ComboboxOption<V>>
      items={options as ComboboxOption<V>[]}
      value={selected}
      onValueChange={(v) => onChange(v ? v.value : null)}
      itemToStringLabel={(o) => o.label}
      itemToStringValue={(o) => String(o.value)}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <ComboboxPrimitive.Trigger
        id={id}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30",
          className,
          triggerClassName,
        )}
      >
        <span
          className={cn(
            "flex min-w-0 items-center gap-2 truncate",
            !selected && "text-muted-foreground",
          )}
        >
          {selected?.icon && <span className="shrink-0">{selected.icon}</span>}
          <span className="truncate">{selected?.label ?? placeholder}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </ComboboxPrimitive.Trigger>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner
          sideOffset={4}
          className="z-[60] outline-none"
        >
          <ComboboxPrimitive.Popup
            className={cn(
              "flex max-h-[min(var(--available-height),20rem)] flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg",
              popupWidth === "trigger"
                ? "w-[var(--anchor-width)]"
                : "min-w-48",
            )}
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-2.5 py-1.5">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <ComboboxPrimitive.Input
                placeholder={searchPlaceholder}
                className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <ComboboxPrimitive.Empty className="shrink-0 px-3 py-6 text-center text-xs text-muted-foreground">
              {emptyText}
            </ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List className="scroll-thin min-h-0 flex-1 overflow-y-auto p-1">
              {(option: ComboboxOption<V>) => (
                <ComboboxPrimitive.Item
                  key={option.value}
                  value={option}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                >
                  {option.icon && (
                    <span className="shrink-0">{option.icon}</span>
                  )}
                  <span className="min-w-0 flex-1 truncate">
                    {option.label}
                  </span>
                  {option.hint && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {option.hint}
                    </span>
                  )}
                  <ComboboxPrimitive.ItemIndicator>
                    <Check className="size-4 shrink-0 text-primary" />
                  </ComboboxPrimitive.ItemIndicator>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}
