"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Database,
  KeyRound,
  Settings2,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/authStore";
import { useCurrentUser, useLogout } from "@/features/auth/hooks";
import { DataSection } from "@/features/dataio/components/DataSection";
import { getApiErrorMessage } from "@/lib/api";
import {
  useChangePassword,
  useDeleteAccount,
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

const TABS = [
  { value: "profile", label: "Profile", icon: UserRound },
  { value: "security", label: "Security", icon: KeyRound },
  { value: "preferences", label: "Preferences", icon: Settings2 },
  { value: "data", label: "Data", icon: Database },
  { value: "danger", label: "Danger zone", icon: ShieldAlert },
] as const;

export function SettingsPage() {
  const user = useCurrentUser();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
          {initialsFor(user?.firstname, user?.lastname)}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {user ? `${user.firstname} ${user.lastname}` : "Settings"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.email ?? "Manage your profile, security, and preferences."}
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value}>
              <Icon className="mr-1.5 size-4 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile">
          <ProfileSection />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySection />
        </TabsContent>
        <TabsContent value="preferences">
          <PreferencesSection />
        </TabsContent>
        <TabsContent value="data">
          <DataSection />
        </TabsContent>
        <TabsContent value="danger">
          <DangerZone />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function initialsFor(firstname?: string, lastname?: string): string {
  const a = firstname?.[0] ?? "";
  const b = lastname?.[0] ?? "";
  const result = `${a}${b}`.toUpperCase();
  return result || "?";
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
        <CardContent className="mb-4 space-y-4">
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
        <CardContent className="mb-4 space-y-4">
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
        <CardContent className="mb-4 space-y-3">
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
        <CardContent className="mb-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Combobox
              id="currency"
              placeholder="Select currency…"
              searchPlaceholder="Search currency…"
              value={currency ?? null}
              onChange={(v) =>
                setValue(
                  "currency",
                  v as UpdatePreferencesFormValues["currency"],
                  { shouldDirty: true },
                )
              }
              options={[
                { value: "THB", label: "THB — Thai Baht" },
                { value: "USD", label: "USD — US Dollar" },
                { value: "EUR", label: "EUR — Euro" },
                { value: "JPY", label: "JPY — Japanese Yen" },
              ]}
            />
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
  const deleteAccount = useDeleteAccount();

  function handleDeleteAccount() {
    const ok = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone.",
    );
    if (!ok) return;
    const reallyOk = window.confirm(
      "This will permanently remove your habits, transactions, goals, and notes. Continue?",
    );
    if (!reallyOk) return;

    deleteAccount.mutate(undefined, {
      onSuccess: () => logout.mutate(),
    });
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
      <CardContent className="mb-4">
        <p className="text-sm text-muted-foreground">
          Once you delete your account, all of your habits, transactions, goals,
          and notes will be removed and cannot be recovered.
        </p>
        {deleteAccount.error && (
          <p className="mt-3 text-sm text-destructive">
            {getApiErrorMessage(deleteAccount.error)}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="destructive"
          onClick={handleDeleteAccount}
          disabled={deleteAccount.isPending}
        >
          {deleteAccount.isPending ? "Deleting…" : "Delete account"}
        </Button>
      </CardFooter>
    </Card>
  );
}
