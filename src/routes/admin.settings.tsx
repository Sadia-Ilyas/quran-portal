import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FieldError, PageHeader } from "@/components/dashboard/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import { useGetMeQuery } from "@/features/auth";
import { getFieldErrors } from "@/types/api";

export default function AdminSettings() {
  const { settings, updateSettings } = useDashboard();
  const { user, updateProfile, changePassword, isUpdatingProfile, isChangingPassword } = useAuth();
  
  // Endpoint 1: GET /api/users/me/ on page visit
  const { data: meData, refetch: refetchMe } = useGetMeQuery();

  // Profile Form state (PUT /api/users/me/)
  const [profileForm, setProfileForm] = useState({
    first_name: user?.firstName ?? meData?.first_name ?? "",
    last_name: user?.lastName ?? meData?.last_name ?? "",
    email: user?.email ?? meData?.email ?? "",
    phone_number: user?.phone ?? meData?.phone_number ?? "",
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Password Form state (POST /api/users/change-password/)
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});

  // Academy branding form (local dashboard settings)
  const [academyForm, setAcademyForm] = useState(settings);
  const [academyErrors, setAcademyErrors] = useState<Record<string, string>>({});

  // Sync profile form when GET /api/users/me/ data loads
  useEffect(() => {
    if (meData) {
      setProfileForm({
        first_name: meData.first_name ?? "",
        last_name: meData.last_name ?? "",
        email: meData.email ?? "",
        phone_number: meData.phone_number ?? "",
      });
    } else if (user) {
      setProfileForm((prev) => ({
        ...prev,
        first_name: user.firstName ?? prev.first_name,
        last_name: user.lastName ?? prev.last_name,
        email: user.email ?? prev.email,
        phone_number: user.phone ?? prev.phone_number,
      }));
    }
  }, [meData, user]);

  // Endpoint 2: PUT /api/users/me/ - save admin profile
  const saveProfile = async () => {
    const errs: Record<string, string> = {};
    if (!profileForm.first_name.trim()) errs.first_name = "First name is required.";
    if (!profileForm.last_name.trim()) errs.last_name = "Last name is required.";
    if (!profileForm.phone_number.trim()) {
      errs.phone_number = "Phone number is required.";
    }

    setProfileErrors(errs);
    if (Object.keys(errs).length) return;

    const res = await updateProfile({
      first_name: profileForm.first_name.trim(),
      last_name: profileForm.last_name.trim(),
      phone_number: profileForm.phone_number.trim(),
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
    toast.success("Admin profile updated successfully.");
    refetchMe();
  };

  // Endpoint 3: POST /api/users/change-password/ - change admin password
  const savePassword = async () => {
    const errs: Record<string, string> = {};
    if (!pwd.current) errs.current = "Current password is required.";
    if (!pwd.next) {
      errs.next = "New password is required.";
    } else if (pwd.next.length < 6) {
      errs.next = "New password must be at least 6 characters.";
    }
    if (!pwd.confirm) {
      errs.confirm = "Confirm password is required.";
    } else if (pwd.next !== pwd.confirm) {
      errs.confirm = "Passwords do not match.";
    }

    setPwdErrors(errs);
    if (Object.keys(errs).length) return;

    const res = await changePassword(pwd.current, pwd.next, pwd.confirm);
    if (!res.ok) {
      const serverFieldErrors = getFieldErrors(res.rawError);
      if (Object.keys(serverFieldErrors).length) {
        const mapped: Record<string, string> = {};
        if (serverFieldErrors.old_password) mapped.current = serverFieldErrors.old_password;
        if (serverFieldErrors.new_password) mapped.next = serverFieldErrors.new_password;
        if (serverFieldErrors.confirm_new_password) mapped.confirm = serverFieldErrors.confirm_new_password;
        if (serverFieldErrors.detail) mapped.current = serverFieldErrors.detail;
        setPwdErrors(mapped);
      }
      toast.error(res.error ?? "Could not change password.");
      return;
    }

    setPwdErrors({});
    setPwd({ current: "", next: "", confirm: "" });
    toast.success("Password updated successfully.");
  };

  // Save Academy branding settings
  const saveAcademy = () => {
    const next: Record<string, string> = {};
    if (!academyForm.name.trim()) next.name = "Academy name is required";
    if (!/^\S+@\S+\.\S+$/.test(academyForm.email)) next.email = "Valid email required";
    setAcademyErrors(next);
    if (Object.keys(next).length) return;
    updateSettings(academyForm);
    toast.success("Academy settings saved");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Settings & Profile"
        description="Admin profile, account security and academy settings."
      />

      {/* Admin Profile Section: GET /api/users/me/ & PUT /api/users/me/ */}
      <section className="app-card p-6">
        <h2 className="text-base font-semibold">Admin profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your personal account details (synchronized with /api/users/me/).
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="adm_first_name">First name *</Label>
            <Input
              id="adm_first_name"
              value={profileForm.first_name}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, first_name: e.target.value }))
              }
              disabled={isUpdatingProfile}
              placeholder="First name"
            />
            <FieldError message={profileErrors.first_name} />
          </div>

          <div>
            <Label htmlFor="adm_last_name">Last name *</Label>
            <Input
              id="adm_last_name"
              value={profileForm.last_name}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, last_name: e.target.value }))
              }
              disabled={isUpdatingProfile}
              placeholder="Last name"
            />
            <FieldError message={profileErrors.last_name} />
          </div>

          <div>
            <Label htmlFor="adm_email">Email</Label>
            <Input
              id="adm_email"
              type="email"
              value={profileForm.email}
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-muted-foreground">Email is tied to your login account.</p>
          </div>

          <div>
            <Label htmlFor="adm_phone">Phone number *</Label>
            <Input
              id="adm_phone"
              value={profileForm.phone_number}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, phone_number: e.target.value }))
              }
              disabled={isUpdatingProfile}
              placeholder="+923001234567"
            />
            <FieldError message={profileErrors.phone_number} />
          </div>

          {/* Extra fields not supported by /users/me/ backend payload are commented out
          <div>
            <Label htmlFor="adm_country">Country</Label>
            <Input id="adm_country" disabled />
          </div>
          <div>
            <Label htmlFor="adm_timezone">Timezone</Label>
            <Input id="adm_timezone" disabled />
          </div>
          */}
        </div>

        <div className="mt-6">
          <Button onClick={saveProfile} disabled={isUpdatingProfile}>
            {isUpdatingProfile ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </section>

      {/* Admin Change Password Section: POST /api/users/change-password/ */}
      <section className="app-card p-6">
        <h2 className="text-base font-semibold">Change password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as {profileForm.email || user?.email}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="p-cur">Current password</Label>
            <Input
              id="p-cur"
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              disabled={isChangingPassword}
              placeholder="••••••••"
            />
            <FieldError message={pwdErrors.current} />
          </div>
          <div>
            <Label htmlFor="p-new">New password</Label>
            <Input
              id="p-new"
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              disabled={isChangingPassword}
              placeholder="••••••••"
            />
            <FieldError message={pwdErrors.next} />
          </div>
          <div>
            <Label htmlFor="p-conf">Confirm password</Label>
            <Input
              id="p-conf"
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              disabled={isChangingPassword}
              placeholder="••••••••"
            />
            <FieldError message={pwdErrors.confirm} />
          </div>
        </div>

        <Button className="mt-6" onClick={savePassword} disabled={isChangingPassword}>
          {isChangingPassword ? "Updating..." : "Update password"}
        </Button>
      </section>

      {/* Academy Branding & Settings Section */}
      <section className="app-card p-6">
        <h2 className="font-semibold">Academy profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Public portal branding and contact details.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="a-name">Academy name</Label>
            <Input
              id="a-name"
              value={academyForm.name}
              onChange={(e) => setAcademyForm({ ...academyForm, name: e.target.value })}
            />
            <FieldError message={academyErrors.name} />
          </div>
          <div>
            <Label htmlFor="a-tag">Tagline</Label>
            <Input
              id="a-tag"
              value={academyForm.tagline}
              onChange={(e) => setAcademyForm({ ...academyForm, tagline: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="a-email">Email</Label>
            <Input
              id="a-email"
              value={academyForm.email}
              onChange={(e) => setAcademyForm({ ...academyForm, email: e.target.value })}
            />
            <FieldError message={academyErrors.email} />
          </div>
          <div>
            <Label htmlFor="a-wa">WhatsApp</Label>
            <Input
              id="a-wa"
              value={academyForm.whatsapp}
              onChange={(e) => setAcademyForm({ ...academyForm, whatsapp: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="a-phone">Phone</Label>
            <Input
              id="a-phone"
              value={academyForm.phone}
              onChange={(e) => setAcademyForm({ ...academyForm, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="a-logo">Logo URL</Label>
            <Input
              id="a-logo"
              value={academyForm.logoUrl}
              onChange={(e) => setAcademyForm({ ...academyForm, logoUrl: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="a-addr">Address</Label>
            <Textarea
              id="a-addr"
              rows={2}
              value={academyForm.address}
              onChange={(e) => setAcademyForm({ ...academyForm, address: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="a-fb">Facebook</Label>
            <Input
              id="a-fb"
              value={academyForm.facebook}
              onChange={(e) => setAcademyForm({ ...academyForm, facebook: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="a-ig">Instagram</Label>
            <Input
              id="a-ig"
              value={academyForm.instagram}
              onChange={(e) => setAcademyForm({ ...academyForm, instagram: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="a-yt">YouTube</Label>
            <Input
              id="a-yt"
              value={academyForm.youtube}
              onChange={(e) => setAcademyForm({ ...academyForm, youtube: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={saveAcademy}>Save academy settings</Button>
          <Button variant="outline" onClick={() => setAcademyForm(settings)}>
            Reset
          </Button>
        </div>
      </section>
    </div>
  );
}
