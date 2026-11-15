import { useMemo, useState } from "react";
import { AlertCircle, GraduationCap, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  EmptyState,
  FieldError,
  PageHeader,
  PaginationBar,
  TableSkeleton,
} from "@/components/dashboard/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useGetTeachersQuery,
  useCreateTeacherMutation,
  type CreateTeacherRequest,
  type Gender,
} from "@/features/teacher";
import { getFieldErrors } from "@/types/api";

const PAGE_SIZE = 10;

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

function getTeacherLoadError(error: unknown): string {
  if (!error) return "Cannot reach the server.";
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    if (err.status === "FETCH_ERROR") return "Cannot reach the server.";
    const data = err.data as Record<string, unknown> | undefined;
    if (data?.detail && typeof data.detail === "string") return data.detail;
  }
  return "Something went wrong. Please try again.";
}

// ─── Form state ──────────────────────────────────────────────────────────────

interface TeacherFormState {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  bio: string;
  qualification: string;
  specialisation: string;
  experience_years: string;
  languages: string;        // comma-separated in UI, sent as string[] to API
  gender: Gender | "";
  hourly_rate: string;
  timezone: string;
}

const INITIAL_FORM: TeacherFormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  bio: "",
  qualification: "",
  specialisation: "",
  experience_years: "",
  languages: "",
  gender: "",
  hourly_rate: "",
  timezone: "Asia/Karachi",
};

// ─── Add Teacher Dialog ──────────────────────────────────────────────────────

function AddTeacherDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState<TeacherFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [createTeacher, { isLoading: creating }] = useCreateTeacherMutation();

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setGeneralError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const set = (field: keyof TeacherFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.last_name.trim()) e.last_name = "Last name is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!emailRegex.test(form.email.trim())) {
      e.email = "Please enter a valid email address";
    }
    const phoneRegex = /^\+\d{8,15}$/;
    if (!form.phone_number.trim()) {
      e.phone_number = "Phone number is required";
    } else if (!phoneRegex.test(form.phone_number.trim())) {
      e.phone_number = "Phone must be in E.164 format (e.g. +923001234567)";
    }
    if (form.experience_years.trim()) {
      const n = Number(form.experience_years.trim());
      if (isNaN(n) || !Number.isInteger(n) || n < 0 || n > 60) {
        e.experience_years = "Experience must be a whole number between 0 and 60";
      }
    }
    if (form.hourly_rate.trim()) {
      const n = Number(form.hourly_rate.trim());
      if (isNaN(n) || n < 0) {
        e.hourly_rate = "Hourly rate must be a non-negative number";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (creating) return;
    if (!validate()) return;

    const body: CreateTeacherRequest = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone_number: form.phone_number.trim(),
    };

    if (form.bio.trim()) body.bio = form.bio.trim();
    if (form.qualification.trim()) body.qualification = form.qualification.trim();
    if (form.specialisation.trim()) body.specialisation = form.specialisation.trim();
    if (form.experience_years.trim()) body.experience_years = Number(form.experience_years.trim());
    if (form.languages.trim()) {
      body.languages = form.languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);
    }
    if (form.gender) body.gender = form.gender as Gender;
    if (form.hourly_rate.trim()) body.hourly_rate = form.hourly_rate.trim();
    if (form.timezone.trim()) body.timezone = form.timezone.trim();

    try {
      await createTeacher(body).unwrap();
      toast.success("Teacher registered. Login details were emailed to them.");
      handleOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const fetchErr = err as FetchBaseQueryError;
      if (fetchErr?.status === 400) {
        const fieldErrors = getFieldErrors(err);
        const nextErrors: Record<string, string> = {};
        const unmapped: string[] = [];
        for (const [key, msg] of Object.entries(fieldErrors)) {
          if (key in INITIAL_FORM) {
            nextErrors[key] = msg;
          } else {
            unmapped.push(
              key === "detail" || key === "non_field_errors" ? msg : `${key}: ${msg}`
            );
          }
        }
        setErrors(nextErrors);
        if (unmapped.length > 0) setGeneralError(unmapped.join(" | "));
        toast.error("Please fix the highlighted fields.");
      } else if (fetchErr?.status === 401) {
        toast.error("Session expired. Please sign in again.");
      } else if (fetchErr?.status === 403) {
        toast.error("Only admins can add teachers.");
      } else if (fetchErr?.status === "FETCH_ERROR") {
        toast.error("Cannot reach the server.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add new teacher</DialogTitle>
          <DialogDescription>
            A temporary password will be emailed to the teacher.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {generalError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">
              {generalError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* First name */}
            <div>
              <Label htmlFor="tf_first_name">First name *</Label>
              <Input
                id="tf_first_name"
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                placeholder="First name"
                disabled={creating}
              />
              <FieldError message={errors.first_name} />
            </div>

            {/* Last name */}
            <div>
              <Label htmlFor="tf_last_name">Last name *</Label>
              <Input
                id="tf_last_name"
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                placeholder="Last name"
                disabled={creating}
              />
              <FieldError message={errors.last_name} />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="tf_email">Email *</Label>
              <Input
                id="tf_email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="teacher@example.com"
                disabled={creating}
              />
              <FieldError message={errors.email} />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="tf_phone_number">Phone number *</Label>
              <Input
                id="tf_phone_number"
                value={form.phone_number}
                onChange={(e) => set("phone_number", e.target.value)}
                placeholder="+923001234567"
                disabled={creating}
              />
              <FieldError message={errors.phone_number} />
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="tf_gender">Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => set("gender", v)}
                disabled={creating}
              >
                <SelectTrigger id="tf_gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={errors.gender} />
            </div>

            {/* Timezone */}
            <div>
              <Label htmlFor="tf_timezone">Timezone</Label>
              <Input
                id="tf_timezone"
                value={form.timezone}
                onChange={(e) => set("timezone", e.target.value)}
                placeholder="Asia/Karachi"
                disabled={creating}
              />
              <FieldError message={errors.timezone} />
            </div>

            {/* Experience */}
            <div>
              <Label htmlFor="tf_experience_years">Experience (years)</Label>
              <Input
                id="tf_experience_years"
                type="number"
                min={0}
                max={60}
                value={form.experience_years}
                onChange={(e) => set("experience_years", e.target.value)}
                placeholder="0"
                disabled={creating}
              />
              <FieldError message={errors.experience_years} />
            </div>

            {/* Hourly rate */}
            <div>
              <Label htmlFor="tf_hourly_rate">Hourly rate (\$)</Label>
              <Input
                id="tf_hourly_rate"
                type="number"
                min={0}
                step="0.01"
                value={form.hourly_rate}
                onChange={(e) => set("hourly_rate", e.target.value)}
                placeholder="e.g. 25.00"
                disabled={creating}
              />
              <FieldError message={errors.hourly_rate} />
            </div>

            {/* Qualification */}
            <div>
              <Label htmlFor="tf_qualification">Qualification</Label>
              <Input
                id="tf_qualification"
                value={form.qualification}
                onChange={(e) => set("qualification", e.target.value)}
                placeholder="e.g. Islamic Studies degree"
                disabled={creating}
              />
              <FieldError message={errors.qualification} />
            </div>

            {/* Specialisation */}
            <div>
              <Label htmlFor="tf_specialisation">Specialisation</Label>
              <Input
                id="tf_specialisation"
                value={form.specialisation}
                onChange={(e) => set("specialisation", e.target.value)}
                placeholder="e.g. Tajweed, Hifz"
                disabled={creating}
              />
              <FieldError message={errors.specialisation} />
            </div>

            {/* Languages */}
            <div className="sm:col-span-2">
              <Label htmlFor="tf_languages">Languages (comma-separated)</Label>
              <Input
                id="tf_languages"
                value={form.languages}
                onChange={(e) => set("languages", e.target.value)}
                placeholder="Urdu, English, Arabic"
                disabled={creating}
              />
              <FieldError message={errors.languages} />
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <Label htmlFor="tf_bio">Bio</Label>
              <Textarea
                id="tf_bio"
                rows={3}
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                placeholder="Short bio visible to students"
                disabled={creating}
              />
              <FieldError message={errors.bio} />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Saving..." : "Add teacher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminTeachers() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useGetTeachersQuery({ page });

  const total = data?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filtered = useMemo(() => {
    const list = data?.results ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((t) => {
      const name = (t.full_name || `${t.first_name} ${t.last_name}`).toLowerCase();
      const email = (t.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [data?.results, query]);

  const fetchStatus = (error as FetchBaseQueryError | undefined)?.status;

  if (isError && fetchStatus === 403) {
    return (
      <div>
        <PageHeader
          title="Teachers"
          description="Staff profiles, specialisations and assigned student load."
        />
        <div className="app-card">
          <EmptyState
            icon={AlertCircle}
            title="Access Denied"
            description="You don't have permission to view teachers."
          />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div>
        <PageHeader
          title="Teachers"
          description="Staff profiles, specialisations and assigned student load."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 size-4" /> Add teacher
            </Button>
          }
        />

        <div className="app-card">
          {/* Search */}
          <div className="border-b border-border p-4">
            <Input
              placeholder="Search this page — name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="sm:max-w-xs"
            />
          </div>

          {/* Body states */}
          {isLoading ? (
            <TableSkeleton rows={8} />
          ) : isError ? (
            <EmptyState
              icon={AlertCircle}
              title="Failed to load teachers"
              description={getTeacherLoadError(error)}
              action={
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="mr-2 size-4" /> Retry
                </Button>
              }
            />
          ) : total === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No teachers yet"
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No teachers found"
              description={`No teachers matching "${query}".`}
              action={
                <Button variant="outline" size="sm" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Specialisation</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Languages</TableHead>
                    <TableHead>Rate / hr</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <p className="font-medium">
                          {t.full_name ||
                            `${t.first_name} ${t.last_name}`.trim() ||
                            "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">{t.email}</p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {t.phone_number || "—"}
                      </TableCell>
                      <TableCell>
                        {t.specialisation ? (
                          <Badge variant="secondary">{t.specialisation}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {t.experience_years != null ? `${t.experience_years} yrs` : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {t.languages || "—"}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {t.hourly_rate ? `$${t.hourly_rate}` : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={t.is_active ? "secondary" : "outline"}>
                            {t.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {t.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(t.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled
                                  aria-label="Edit teacher (coming soon)"
                                >
                                  <Pencil className="size-4 opacity-40" />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Coming soon</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled
                                  aria-label="Delete teacher (coming soon)"
                                >
                                  <Trash2 className="size-4 opacity-40 text-destructive" />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Coming soon</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <PaginationBar
            page={page}
            pageCount={pageCount}
            total={total}
            onChange={setPage}
          />
        </div>

        <AddTeacherDialog
          open={open}
          onOpenChange={setOpen}
          onSuccess={() => setPage(1)}
        />
      </div>
    </TooltipProvider>
  );
}
