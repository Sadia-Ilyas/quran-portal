import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { FieldError } from "@/components/dashboard/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useGetMeQuery } from "@/features/auth";
import { getFieldErrors } from "@/types/api";

export function ProfileForm({ extra }: { extra?: ReactNode }) {
  const { user, updateProfile, changePassword, isUpdatingProfile, isChangingPassword } = useAuth();
  const { data: meData, refetch } = useGetMeQuery();

  const [form, setForm] = useState({
    first_name: user?.firstName ?? meData?.first_name ?? "",
    last_name: user?.lastName ?? meData?.last_name ?? "",
    email: user?.email ?? meData?.email ?? "",
    phone_number: user?.phone ?? meData?.phone_number ?? "",
  });

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  // Sync state whenever fresh user data from GET /users/me/ arrives
  useEffect(() => {
    if (meData) {
      setForm({
        first_name: meData.first_name ?? "",
        last_name: meData.last_name ?? "",
        email: meData.email ?? "",
        phone_number: meData.phone_number ?? "",
      });
    } else if (user) {
      setForm((prev) => ({
        ...prev,
        first_name: user.firstName ?? prev.first_name,
        last_name: user.lastName ?? prev.last_name,
        email: user.email ?? prev.email,
        phone_number: user.phone ?? prev.phone_number,
      }));
    }
  }, [meData, user]);

  const saveProfile = async () => {
    const errs: Record<string, string> = {};
    if (!form.first_name.trim()) errs.first_name = "First name is required.";
    if (!form.last_name.trim()) errs.last_name = "Last name is required.";
    if (!form.phone_number.trim()) {
      errs.phone_number = "Phone number is required.";
    }

    setProfileErrors(errs);
    if (Object.keys(errs).length) return;

    const res = await updateProfile({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone_number: form.phone_number.trim(),
    });

    if (!res.ok) {
      const serverFieldErrors = getFieldErrors(res.rawError);
      if (Object.keys(serverFieldErrors).length) {
        setProfileErrors(serverFieldErrors);
      }
      toast.error(res.error ?? "Could not update profile.");
      return;
    }

    setProfileErrors({});
    toast.success("Profile updated successfully.");
    refetch();
  };

  const savePassword = async () => {
    const errs: Record<string, string> = {};
    if (!pw.current) errs.current = "Current password is required.";
    if (!pw.next) errs.next = "New password is required.";
    if (!pw.confirm) errs.confirm = "Confirm password is required.";

    if (pw.next && pw.confirm && pw.next !== pw.confirm) {
      errs.confirm = "Passwords do not match.";
    }

    setPwErrors(errs);
    if (Object.keys(errs).length) return;

    const res = await changePassword(pw.current, pw.next, pw.confirm);
    if (!res.ok) {
      const serverFieldErrors = getFieldErrors(res.rawError);
      if (Object.keys(serverFieldErrors).length) {
        const mapped: Record<string, string> = {};
        if (serverFieldErrors.old_password) mapped.current = serverFieldErrors.old_password;
        if (serverFieldErrors.new_password) mapped.next = serverFieldErrors.new_password;
        if (serverFieldErrors.confirm_new_password) mapped.confirm = serverFieldErrors.confirm_new_password;
        if (serverFieldErrors.detail) mapped.current = serverFieldErrors.detail;
        setPwErrors(mapped);
      }
      toast.error(res.error ?? "Could not change password.");
      return;
    }

    setPwErrors({});
    setPw({ current: "", next: "", confirm: "" });
    toast.success("Password changed successfully.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="app-card p-6 lg:col-span-2">
        <h2 className="text-base font-semibold">Personal details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your profile information and contact details.
        </p>

        {/* Extra fields not supported by backend are commented out per instructions
        <div className="mt-5 flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={form.avatarUrl} alt={form.first_name} />
            <AvatarFallback>{form.first_name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input id="avatar" placeholder="https://…" />
          </div>
        </div>
        */}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="prof_first_name">First name *</Label>
            <Input
              id="prof_first_name"
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              placeholder="First name"
              disabled={isUpdatingProfile}
            />
            <FieldError message={profileErrors.first_name} />
          </div>

          <div>
            <Label htmlFor="prof_last_name">Last name *</Label>
            <Input
              id="prof_last_name"
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              placeholder="Last name"
              disabled={isUpdatingProfile}
            />
            <FieldError message={profileErrors.last_name} />
          </div>

          <div>
            <Label htmlFor="prof_email">Email</Label>
            <Input
              id="prof_email"
              type="email"
              value={form.email}
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>

          <div>
            <Label htmlFor="prof_phone">Phone number *</Label>
            <Input
              id="prof_phone"
              value={form.phone_number}
              onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
              placeholder="+923001234567"
              disabled={isUpdatingProfile}
            />
            <FieldError message={profileErrors.phone_number} />
          </div>

          {/* Extra unsupported fields commented out
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" disabled />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="tz">Timezone</Label>
            <Input id="tz" disabled />
          </div>
          */}
        </div>

        {extra}

        <div className="mt-6">
          <Button onClick={saveProfile} disabled={isUpdatingProfile}>
            {isUpdatingProfile ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </section>

      <section className="app-card h-fit p-6">
        <h2 className="text-base font-semibold">Change password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ensure your account uses a strong password.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="cur">Current password</Label>
            <Input
              id="cur"
              type="password"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              disabled={isChangingPassword}
              placeholder="••••••••"
            />
            <FieldError message={pwErrors.current} />
          </div>
          <div>
            <Label htmlFor="new">New password</Label>
            <Input
              id="new"
              type="password"
              value={pw.next}
              onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
              disabled={isChangingPassword}
              placeholder="••••••••"
            />
            <FieldError message={pwErrors.next} />
          </div>
          <div>
            <Label htmlFor="conf">Confirm new password</Label>
            <Input
              id="conf"
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              disabled={isChangingPassword}
              placeholder="••••••••"
            />
            <FieldError message={pwErrors.confirm} />
          </div>
          <Button
            variant="outline"
            onClick={savePassword}
            className="w-full"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? "Updating..." : "Update password"}
          </Button>
        </div>
      </section>
    </div>
  );
}
