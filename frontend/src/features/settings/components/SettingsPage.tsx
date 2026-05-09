"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/authStore";
import { useCurrentUser, useLogout } from "@/features/auth/hooks";
import { getApiErrorMessage } from "@/lib/api";
import {
  useChangePassword,
  useSettings,
  useUpdateProfile,
  useUpdateSettings,
} from "../hooks";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
  updatePreferencesSchema,
  type UpdatePreferencesFormValues,
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "../schema";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, security, and preferences.
        </p>
      </div>

      <ProfileSection />
      <SecuritySection />
      <PreferencesSection />
      <DangerZone />
    </div>
  );
}

function ProfileSection() {
  const user = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      username: "",
      email: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
      });
    }
  }, [user, reset]);

  function onSubmit(values: UpdateProfileFormValues) {
    updateProfile.mutate(values, {
      onSuccess: (next) => {
        useAuthStore.getState().setAuth({
          user: next,
          accessToken: useAuthStore.getState().accessToken,
          refreshToken: useAuthStore.getState().refreshToken,
        });
        reset(values);
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your account information.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstname">First name</Label>
              <Input id="firstname" {...register("firstname")} />
              {errors.firstname && (
                <p className="text-xs text-destructive">
                  {errors.firstname.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastname">Last name</Label>
              <Input id="lastname" {...register("lastname")} />
              {errors.lastname && (
                <p className="text-xs text-destructive">
                  {errors.lastname.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register("username")} />
            {errors.username && (
              <p className="text-xs text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          {updateProfile.error && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(updateProfile.error)}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={!isDirty || updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving…" : "Save profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function SecuritySection() {
  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: ChangePasswordFormValues) {
    changePassword.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () =>
          reset({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }),
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Change your password.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
          {changePassword.error && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(changePassword.error)}
            </p>
          )}
          {changePassword.isSuccess && (
            <p className="text-sm text-green-600">Password updated.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? "Updating…" : "Update password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function PreferencesSection() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdatePreferencesFormValues>({
    resolver: zodResolver(updatePreferencesSchema),
    defaultValues: {
      currency: "THB",
      monthlyBudget: null,
      theme: "system",
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        currency: (settings.currency as UpdatePreferencesFormValues["currency"]) ?? "THB",
        monthlyBudget: settings.monthlyBudget,
        theme: (settings.theme as UpdatePreferencesFormValues["theme"]) ?? "system",
      });
    }
  }, [settings, reset]);

  const currency = watch("currency");
  const theme = watch("theme");

  function onSubmit(values: UpdatePreferencesFormValues) {
    updateSettings.mutate(
      {
        currency: values.currency,
        monthlyBudget: values.monthlyBudget ?? undefined,
        theme: values.theme,
      },
      {
        onSuccess: () => reset(values),
      },
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>How the app looks and behaves.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) =>
                setValue(
                  "currency",
                  e.target.value as UpdatePreferencesFormValues["currency"],
                  { shouldDirty: true },
                )
              }
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="THB">THB — Thai Baht</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="JPY">JPY — Japanese Yen</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyBudget">Monthly budget</Label>
            <Input
              id="monthlyBudget"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="Optional"
              {...register("monthlyBudget", {
                setValueAs: (v) =>
                  v === "" || v === null || v === undefined
                    ? null
                    : Number(v),
              })}
            />
            {errors.monthlyBudget && (
              <p className="text-xs text-destructive">
                {errors.monthlyBudget.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["system", "light", "dark"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setValue("theme", opt, { shouldDirty: true })
                  }
                  className={
                    theme === opt
                      ? "rounded-lg border border-primary bg-primary/10 px-3 py-2 text-sm font-medium capitalize text-primary"
                      : "rounded-lg border border-border px-3 py-2 text-sm font-medium capitalize text-muted-foreground hover:text-foreground"
                  }
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {updateSettings.error && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(updateSettings.error)}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={!isDirty || updateSettings.isPending}
          >
            {updateSettings.isPending ? "Saving…" : "Save preferences"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function DangerZone() {
  const logout = useLogout();

  function handleDeleteAccount() {
    const ok = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone.",
    );
    if (!ok) return;
    const reallyOk = window.confirm(
      "This will permanently remove your habits, transactions, goals, and notes. Continue?",
    );
    if (!reallyOk) return;

    // TODO: hook up to DELETE /api/v1/users/me when backend supports it.
    window.alert(
      "Account deletion is not yet implemented on the backend. You will be logged out for now.",
    );
    logout.mutate();
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-5" />
          Danger zone
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          variant="destructive"
          onClick={handleDeleteAccount}
        >
          Delete account
        </Button>
      </CardFooter>
    </Card>
  );
}
