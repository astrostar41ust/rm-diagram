"use client";

import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCategories } from "@/features/finance/hooks";
import {
  SUPPORTED_CURRENCIES,
  type TransactionType,
} from "@/features/finance/types";
import { getApiErrorMessage } from "@/lib/api";
import {
  createRecurringSchema,
  type CreateRecurringFormValues,
} from "../schema";
import { useCreateRecurring } from "../hooks";
import type { DayOfWeek, RecurrenceFrequency } from "../types";

const DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

interface AddRecurringSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRecurringSheet({
  open,
  onOpenChange,
}: AddRecurringSheetProps) {
  const { data: categories = [] } = useCategories();
  const create = useCreateRecurring();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateRecurringFormValues>({
    resolver: zodResolver(createRecurringSchema),
    defaultValues: {
      type: "EXPENSE",
      frequency: "MONTHLY",
      dayOfMonth: 1,
      nextRunDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const type = watch("type");
  const categoryId = watch("categoryId");
  const frequency = watch("frequency");
  const dayOfWeek = watch("dayOfWeek");
  const filteredCategories = categories.filter((c) => c.type === type);

  function onSubmit(data: CreateRecurringFormValues) {
    clearErrors("root");
    create.mutate(
      {
        ...data,
        currency: data.currency || undefined,
        note: data.note?.trim() || undefined,
        endDate: data.endDate?.trim() || undefined,
        dayOfMonth: data.frequency === "MONTHLY" ? data.dayOfMonth : undefined,
        dayOfWeek: data.frequency === "WEEKLY" ? data.dayOfWeek : undefined,
      },
      {
        onSuccess: () => {
          reset({
            type: "EXPENSE",
            frequency: "MONTHLY",
            dayOfMonth: 1,
            nextRunDate: format(new Date(), "yyyy-MM-dd"),
          });
          onOpenChange(false);
        },
        onError: (err: unknown) => {
          setError("root", { message: getApiErrorMessage(err) });
        },
      },
    );
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>New recurring transaction</SheetTitle>
          <SheetDescription>
            Posts automatically each day, week, or month.
          </SheetDescription>
        </SheetHeader>

        <form
          id="add-recurring-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <div className="grid grid-cols-2 gap-2">
            {(["EXPENSE", "INCOME"] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setValue("type", t);
                  setValue("categoryId", 0 as number);
                }}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium",
                  type === t
                    ? t === "INCOME"
                      ? "border-green-500 bg-green-500/10 text-green-700"
                      : "border-red-500 bg-red-500/10 text-red-600"
                    : "border-border text-muted-foreground",
                )}
              >
                {t === "INCOME" ? "Income" : "Expense"}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Combobox
              placeholder="Select…"
              searchPlaceholder="Search categories…"
              value={categoryId || null}
              onChange={(v) =>
                setValue("categoryId", v as number, { shouldValidate: true })
              }
              options={filteredCategories.map((c) => ({
                value: c.id,
                label: c.name,
                icon: c.icon ?? undefined,
              }))}
            />
            {errors.categoryId && (
              <p className="text-xs text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                className="flex-1"
                {...register("amount", { valueAsNumber: true })}
              />
              <Combobox
                placeholder="Default"
                searchPlaceholder="Search currency…"
                triggerClassName="w-28"
                popupWidth="auto"
                value={watch("currency") ?? null}
                onChange={(v) =>
                  setValue(
                    "currency",
                    v ? (v as (typeof SUPPORTED_CURRENCIES)[number]) : undefined,
                    { shouldValidate: true },
                  )
                }
                options={SUPPORTED_CURRENCIES.map((c) => ({
                  value: c,
                  label: c,
                }))}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Note</Label>
            <Input {...register("note")} />
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["DAILY", "WEEKLY", "MONTHLY"] as RecurrenceFrequency[]).map(
                (f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setValue("frequency", f)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium capitalize",
                      frequency === f
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {f.toLowerCase()}
                  </button>
                ),
              )}
            </div>
          </div>

          {frequency === "MONTHLY" && (
            <div className="space-y-2">
              <Label>Day of month</Label>
              <Input
                type="number"
                min="1"
                max="31"
                {...register("dayOfMonth", { valueAsNumber: true })}
              />
              {errors.dayOfMonth && (
                <p className="text-xs text-destructive">
                  {errors.dayOfMonth.message}
                </p>
              )}
            </div>
          )}

          {frequency === "WEEKLY" && (
            <div className="space-y-2">
              <Label>Day of week</Label>
              <Combobox
                placeholder="Select…"
                searchPlaceholder="Search day…"
                value={dayOfWeek ?? null}
                onChange={(v) =>
                  setValue("dayOfWeek", (v as DayOfWeek) ?? undefined, {
                    shouldValidate: true,
                  })
                }
                options={DAYS.map((d) => ({
                  value: d as string,
                  label: d.charAt(0) + d.slice(1).toLowerCase(),
                }))}
              />
              {errors.dayOfWeek && (
                <p className="text-xs text-destructive">
                  {errors.dayOfWeek.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Next run</Label>
              <Input type="date" {...register("nextRunDate")} />
              {errors.nextRunDate && (
                <p className="text-xs text-destructive">
                  {errors.nextRunDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>End date</Label>
              <Input type="date" {...register("endDate")} />
            </div>
          </div>

          {errors.root && (
            <p className="text-xs text-destructive">{errors.root.message}</p>
          )}
        </form>

        <SheetFooter>
          <Button
            type="submit"
            form="add-recurring-form"
            disabled={create.isPending}
            className="w-full"
          >
            {create.isPending ? "Saving…" : "Save rule"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
