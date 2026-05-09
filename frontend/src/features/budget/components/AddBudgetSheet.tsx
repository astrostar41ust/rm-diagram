"use client";

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
import { useCategories } from "@/features/finance/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { createBudgetSchema, type CreateBudgetFormValues } from "../schema";
import { useCreateBudget } from "../hooks";

interface AddBudgetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBudgetSheet({ open, onOpenChange }: AddBudgetSheetProps) {
  const { data: categories = [] } = useCategories();
  const create = useCreateBudget();
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateBudgetFormValues>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: { alertThreshold: 80 },
  });

  const selectedCategory = watch("categoryId");

  function onSubmit(data: CreateBudgetFormValues) {
    clearErrors("root");
    create.mutate(data, {
      onSuccess: () => {
        reset({ alertThreshold: 80 });
        onOpenChange(false);
      },
      onError: (err: unknown) => {
        setError("root", { message: getApiErrorMessage(err) });
      },
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset({ alertThreshold: 80 });
        onOpenChange(v);
      }}
    >
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>New budget</SheetTitle>
          <SheetDescription>
            Set a monthly spending limit for an expense category.
          </SheetDescription>
        </SheetHeader>

        <form
          id="add-budget-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4"
        >
          <div className="space-y-2">
            <Label htmlFor="budget-category">Category</Label>
            <Combobox
              id="budget-category"
              placeholder="Select an expense category…"
              searchPlaceholder="Search categories…"
              value={selectedCategory ?? null}
              onChange={(v) =>
                setValue("categoryId", v as number, { shouldValidate: true })
              }
              options={expenseCategories.map((c) => ({
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
            <Label htmlFor="budget-limit">Monthly limit</Label>
            <Input
              id="budget-limit"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("monthlyLimit", { valueAsNumber: true })}
            />
            {errors.monthlyLimit && (
              <p className="text-xs text-destructive">
                {errors.monthlyLimit.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-threshold">Alert threshold (%)</Label>
            <Input
              id="budget-threshold"
              type="number"
              min="1"
              max="100"
              {...register("alertThreshold", { valueAsNumber: true })}
            />
            {errors.alertThreshold && (
              <p className="text-xs text-destructive">
                {errors.alertThreshold.message}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">
              Warn when spending crosses this percent of the limit.
            </p>
          </div>

          {errors.root && (
            <p className="text-xs text-destructive">{errors.root.message}</p>
          )}
        </form>

        <SheetFooter>
          <Button
            type="submit"
            form="add-budget-form"
            disabled={create.isPending}
            className="w-full"
          >
            {create.isPending ? "Saving…" : "Save budget"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
