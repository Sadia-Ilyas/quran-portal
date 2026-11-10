import { useState } from "react";
import { toast } from "sonner";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
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
import { FieldError } from "@/components/dashboard/ui-kit";
import {
  useCreateStudentMutation,
  type CreateStudentRequest,
  type Gender,
  type StudentLevel,
} from "@/features/student";
import { getFieldErrors } from "@/types/api";

interface StudentFormState {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  age: string;
  gender: Gender | "";
  country: string;
  timezone: string;
  current_level: StudentLevel | "";
  guardian_name: string;
  guardian_relationship: string;
  guardian_phone: string;
}

const INITIAL_FORM: StudentFormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  age: "",
  gender: "",
  country: "",
  timezone: "Asia/Karachi",
  current_level: "",
  guardian_name: "",
  guardian_relationship: "",
  guardian_phone: "",
};

export interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddStudentDialog({ open, onOpenChange, onSuccess }: AddStudentDialogProps) {
  const [form, setForm] = useState<StudentFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [createStudent, { isLoading: creating }] = useCreateStudentMutation();

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setGeneralError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleChange = (field: keyof StudentFormState, value: string) => {
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
    const nextErrors: Record<string, string> = {};

    if (!form.first_name.trim()) nextErrors.first_name = "First name is required";
    if (!form.last_name.trim()) nextErrors.last_name = "Last name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address";
    }

    const phoneRegex = /^\+\d{8,15}$/;
    if (!form.phone_number.trim()) {
      nextErrors.phone_number = "Phone number is required";
    } else if (!phoneRegex.test(form.phone_number.trim())) {
      nextErrors.phone_number = "Phone must match E.164 format (e.g. +923001234567)";
    }

    if (form.guardian_phone.trim() && !phoneRegex.test(form.guardian_phone.trim())) {
      nextErrors.guardian_phone = "Guardian phone must match E.164 format (e.g. +923001234567)";
    }

    if (form.age.trim()) {
      const parsedAge = Number(form.age.trim());
      if (isNaN(parsedAge) || !Number.isInteger(parsedAge) || parsedAge < 3 || parsedAge > 100) {
        nextErrors.age = "Age must be a number between 3 and 100";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;

    if (!validate()) return;

    const body: CreateStudentRequest = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone_number: form.phone_number.trim(),
    };

    if (form.guardian_name.trim()) body.guardian_name = form.guardian_name.trim();
    if (form.guardian_relationship.trim()) body.guardian_relationship = form.guardian_relationship.trim();
    if (form.guardian_phone.trim()) body.guardian_phone = form.guardian_phone.trim();
    if (form.age.trim()) body.age = Number(form.age.trim());
    if (form.gender) body.gender = form.gender as Gender;
    if (form.country.trim()) body.country = form.country.trim();
    if (form.timezone.trim()) body.timezone = form.timezone.trim();
    if (form.current_level) body.current_level = form.current_level as StudentLevel;

    try {
      await createStudent(body).unwrap();
      toast.success("Student registered successfully. Credentials dispatched via email.");
      handleOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const fetchError = err as FetchBaseQueryError;

      if (fetchError?.status === 400) {
        const fieldErrors = getFieldErrors(err);
        const nextErrors: Record<string, string> = {};
        const unmapped: string[] = [];

        for (const [key, msg] of Object.entries(fieldErrors)) {
          if (key in INITIAL_FORM) {
            nextErrors[key] = msg;
          } else {
            unmapped.push(key === "detail" || key === "non_field_errors" ? msg : `${key}: ${msg}`);
          }
        }

        setErrors(nextErrors);
        if (unmapped.length > 0) {
          setGeneralError(unmapped.join(" | "));
        }
        toast.error("Please fix the highlighted fields.");
      } else if (fetchError?.status === 401) {
        toast.error("Session expired. Please sign in again.");
      } else if (fetchError?.status === 403) {
        toast.error("Only admins can add students.");
      } else if (fetchError?.status === "FETCH_ERROR") {
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
          <DialogTitle>Add new student</DialogTitle>
          <DialogDescription>
            A temporary password will be emailed to the student.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {generalError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">
              {generalError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="dlg_first_name">First name *</Label>
              <Input
                id="dlg_first_name"
                value={form.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                placeholder="First name"
                disabled={creating}
              />
              <FieldError message={errors.first_name} />
            </div>

            <div>
              <Label htmlFor="dlg_last_name">Last name *</Label>
              <Input
                id="dlg_last_name"
                value={form.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                placeholder="Last name"
                disabled={creating}
              />
              <FieldError message={errors.last_name} />
            </div>

            <div>
              <Label htmlFor="dlg_email">Email *</Label>
              <Input
                id="dlg_email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="student@example.com"
                disabled={creating}
              />
              <FieldError message={errors.email} />
            </div>

            <div>
              <Label htmlFor="dlg_phone_number">Phone number *</Label>
              <Input
                id="dlg_phone_number"
                value={form.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                placeholder="+923001234567"
                disabled={creating}
              />
              <FieldError message={errors.phone_number} />
            </div>

            <div>
              <Label htmlFor="dlg_age">Age</Label>
              <Input
                id="dlg_age"
                type="number"
                min={3}
                max={100}
                value={form.age}
                onChange={(e) => handleChange("age", e.target.value)}
                placeholder="3 - 100"
                disabled={creating}
              />
              <FieldError message={errors.age} />
            </div>

            <div>
              <Label htmlFor="dlg_gender">Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(val) => handleChange("gender", val as Gender)}
                disabled={creating}
              >
                <SelectTrigger id="dlg_gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={errors.gender} />
            </div>

            <div>
              <Label htmlFor="dlg_country">Country</Label>
              <Input
                id="dlg_country"
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder="Country"
                disabled={creating}
              />
              <FieldError message={errors.country} />
            </div>

            <div>
              <Label htmlFor="dlg_timezone">Timezone</Label>
              <Input
                id="dlg_timezone"
                value={form.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                placeholder="Asia/Karachi"
                disabled={creating}
              />
              <FieldError message={errors.timezone} />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="dlg_current_level">Level</Label>
              <Select
                value={form.current_level}
                onValueChange={(val) => handleChange("current_level", val as StudentLevel)}
                disabled={creating}
              >
                <SelectTrigger id="dlg_current_level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={errors.current_level} />
            </div>

            <div>
              <Label htmlFor="dlg_guardian_name">Guardian name</Label>
              <Input
                id="dlg_guardian_name"
                value={form.guardian_name}
                onChange={(e) => handleChange("guardian_name", e.target.value)}
                placeholder="Guardian full name"
                disabled={creating}
              />
              <FieldError message={errors.guardian_name} />
            </div>

            <div>
              <Label htmlFor="dlg_guardian_relationship">Guardian relationship</Label>
              <Input
                id="dlg_guardian_relationship"
                value={form.guardian_relationship}
                onChange={(e) => handleChange("guardian_relationship", e.target.value)}
                placeholder="e.g. Father, Mother"
                disabled={creating}
              />
              <FieldError message={errors.guardian_relationship} />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="dlg_guardian_phone">Guardian phone</Label>
              <Input
                id="dlg_guardian_phone"
                value={form.guardian_phone}
                onChange={(e) => handleChange("guardian_phone", e.target.value)}
                placeholder="+923001234567"
                disabled={creating}
              />
              <FieldError message={errors.guardian_phone} />
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
              {creating ? "Saving..." : "Add student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

