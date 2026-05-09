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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createTransactionSchema,
  type CreateTransactionFormValues,
} from "../schema";
import { useCategories, useCreateTransaction } from "../hooks";
import type { TransactionType } from "../types";

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
            <select
              id="tx-category"
              value={selectedCategoryId || ""}
              onChange={(e) =>
                setValue("categoryId", Number(e.target.value), {
                  shouldValidate: true,
                })
              }
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">Select a category…</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-amount">Amount</Label>
            <Input
              id="tx-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("amount", { valueAsNumber: true })}
            />
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
            <Label htmlFor="tx-note">Note</Label>
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
