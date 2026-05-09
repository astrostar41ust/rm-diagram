import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile · rm-diagram" };

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings.</p>
      </div>

      <div className="max-w-xl rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            JD
          </div>
          <div>
            <p className="text-lg font-medium">John Doe</p>
            <p className="text-sm text-muted-foreground">john.doe@example.com</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">First name</label>
              <input
                type="text"
                defaultValue="John"
                readOnly
                className="mt-1 block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last name</label>
              <input
                type="text"
                defaultValue="Doe"
                readOnly
                className="mt-1 block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Username</label>
            <input
              type="text"
              defaultValue="johndoe"
              readOnly
              className="mt-1 block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              defaultValue="john.doe@example.com"
              readOnly
              className="mt-1 block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
            Edit profile
          </button>
          <button className="h-9 rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-muted">
            Change password
          </button>
        </div>
      </div>
    </div>
  );
}
