"use client";

import { useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createTransactionSchema,
  type CreateTransactionFormValues,
} from "../schema";
import { Sparkles } from "lucide-react";
import { useCategories, useCreateTransaction } from "../hooks";
import { SUPPORTED_CURRENCIES, type TransactionType } from "../types";
import { useSuggestCategory } from "@/features/ai/hooks";

interface AddTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionSheet({
  open,
  onOpenChange,
}: AddTransactionSheetProps) {
  const { data: categories = [] } = useCategories();
  const createTx = useCreateTransaction();
  const suggest = useSuggestCategory();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "EXPENSE",
      transactionDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const selectedType = watch("type");
  const selectedCategoryId = watch("categoryId");

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === selectedType),
    [categories, selectedType],
  );

  useEffect(() => {
    if (
      selectedCategoryId &&
      !filteredCategories.some((c) => c.id === selectedCategoryId)
    ) {
      setValue("categoryId", 0 as number);
    }
  }, [selectedType, filteredCategories, selectedCategoryId, setValue]);

  function onSubmit(data: CreateTransactionFormValues) {
    createTx.mutate(
      {
        ...data,
        note: data.note?.trim() || undefined,
      },
      {
        onSuccess: () => {
          reset({
            type: "EXPENSE",
            transactionDate: format(new Date(), "yyyy-MM-dd"),
          });
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          reset({
            type: "EXPENSE",
            transactionDate: format(new Date(), "yyyy-MM-dd"),
          });
        }
        onOpenChange(val);
      }}
    >
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>New transaction</SheetTitle>
          <SheetDescription>
            Record income or an expense.
          </SheetDescription>
        </SheetHeader>

        <form
          id="add-transaction-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4"
        >
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["EXPENSE", "INCOME"] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue("type", t)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    selectedType === t
                      ? t === "INCOME"
                        ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                        : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t === "INCOME" ? "Income" : "Expense"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-category">Category</Label>
            <Combobox
              id="tx-category"
              placeholder="Select a category…"
              searchPlaceholder="Search categories…"
              value={selectedCategoryId || null}
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
            <Label htmlFor="tx-amount">Amount</Label>
            <div className="flex gap-2">
              <Input
                id="tx-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
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
            <Label htmlFor="tx-date">Date</Label>
            <Input id="tx-date" type="date" {...register("transactionDate")} />
            {errors.transactionDate && (
              <p className="text-xs text-destructive">
                {errors.transactionDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tx-note">Note</Label>
              <button
                type="button"
                disabled={suggest.isPending}
                onClick={() => {
                  const note = watch("note")?.trim();
                  if (!note) return;
                  suggest.mutate(
                    { note, type: selectedType },
                    {
                      onSuccess: (res) => {
                        if (res.categoryId)
                          setValue("categoryId", res.categoryId, {
                            shouldValidate: true,
                          });
                      },
                    },
                  );
                }}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
              >
                <Sparkles className="size-3" />
                {suggest.isPending ? "Thinking…" : "Suggest category"}
              </button>
            </div>
            <Input
              id="tx-note"
              placeholder="Optional"
              {...register("note")}
            />
            {errors.note && (
              <p className="text-xs text-destructive">{errors.note.message}</p>
            )}
          </div>
        </form>

        <SheetFooter>
          <Button
            type="submit"
            form="add-transaction-form"
            disabled={createTx.isPending}
            className="w-full"
          >
            {createTx.isPending ? "Saving…" : "Save transaction"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
