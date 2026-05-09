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
import { SUPPORTED_CURRENCIES } from "@/features/finance/types";
import { getApiErrorMessage } from "@/lib/api";
import {
  createAccountSchema,
  type CreateAccountFormValues,
} from "../schema";
import { useCreateAccount } from "../hooks";
import type { AccountType } from "../types";

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "BANK", label: "Bank" },
  { value: "CASH", label: "Cash" },
  { value: "INVESTMENT", label: "Investment" },
  { value: "ASSET", label: "Other asset" },
  { value: "CREDIT", label: "Credit card" },
  { value: "LIABILITY", label: "Other liability" },
];

interface AddAccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAccountSheet({ open, onOpenChange }: AddAccountSheetProps) {
  const create = useCreateAccount();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: { type: "BANK", balance: 0 },
  });

  const type = watch("type");
  const currency = watch("currency");

  function onSubmit(data: CreateAccountFormValues) {
    clearErrors("root");
    create.mutate(data, {
      onSuccess: () => {
        reset({ type: "BANK", balance: 0 });
        onOpenChange(false);
      },
      onError: (err) => setError("root", { message: getApiErrorMessage(err) }),
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset({ type: "BANK", balance: 0 });
        onOpenChange(v);
      }}
    >
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>New account</SheetTitle>
          <SheetDescription>
            Add a bank, cash, investment, or liability account.
          </SheetDescription>
        </SheetHeader>

        <form
          id="add-account-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4"
        >
          <div className="space-y-2">
            <Label htmlFor="account-name">Name</Label>
            <Input
              id="account-name"
              placeholder="e.g. Bangkok Bank Savings"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Combobox
              placeholder="Pick type"
              searchPlaceholder="Search type…"
              value={type ?? null}
              onChange={(v) =>
                setValue("type", v as AccountType, { shouldValidate: true })
              }
              options={ACCOUNT_TYPES}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-balance">Balance</Label>
            <div className="flex gap-2">
              <Input
                id="account-balance"
                type="number"
                inputMode="decimal"
                step="0.01"
                className="flex-1"
                {...register("balance", { valueAsNumber: true })}
              />
              <Combobox
                placeholder="Currency"
                searchPlaceholder="Search currency…"
                triggerClassName="w-28"
                popupWidth="auto"
                value={currency ?? null}
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
            {errors.balance && (
              <p className="text-xs text-destructive">
                {errors.balance.message}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">
              Use a positive number for credit-card balances; we treat them as
              liabilities automatically.
            </p>
          </div>

          {errors.root && (
            <p className="text-xs text-destructive">{errors.root.message}</p>
          )}
        </form>

        <SheetFooter>
          <Button
            type="submit"
            form="add-account-form"
            disabled={create.isPending}
            className="w-full"
          >
            {create.isPending ? "Saving…" : "Save account"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
