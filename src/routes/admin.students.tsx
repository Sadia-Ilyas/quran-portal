import { useMemo, useState } from "react";
import { AlertCircle, Pencil, Plus, RefreshCw, Trash2, Users } from "lucide-react";
import { format } from "date-fns";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  EmptyState,
  PageHeader,
  PaginationBar,
  TableSkeleton,
} from "@/components/dashboard/ui-kit";
import { AddStudentDialog } from "@/components/dashboard/AddStudentDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetStudentsQuery } from "@/features/student";

/** Backend returns 10 items per page by default. */
const PAGE_SIZE = 10;

function formatLevel(level?: string | null) {
  if (!level) return "—";
  switch (level.toUpperCase()) {
    case "BEGINNER":
      return "Beginner";
    case "INTERMEDIATE":
      return "Intermediate";
    case "ADVANCED":
      return "Advanced";
    default:
      return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
  }
}

function formatDate(isoDate?: string | null) {
  if (!isoDate) return "—";
  try {
    return format(new Date(isoDate), "MMM d, yyyy");
  } catch {
    return isoDate;
  }
}

function getStudentLoadError(error: unknown): string {
  if (!error) return "Cannot reach the server.";
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    if (err.status === "FETCH_ERROR") return "Cannot reach the server.";
    const data = err.data as Record<string, unknown> | undefined;
    if (data?.detail && typeof data.detail === "string") return data.detail;
  }
  return "Cannot reach the server.";
}

export default function AdminStudents() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useGetStudentsQuery({ page });

  const total = data?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filtered = useMemo(() => {
    const list = data?.results ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((s) => {
      const name = (s.full_name || `${s.first_name} ${s.last_name}`).toLowerCase();
      const email = (s.email || "").toLowerCase();
      const phone = (s.phone_number || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [data?.results, query]);

  const status = (error as FetchBaseQueryError | undefined)?.status;

  if (isError && status === 403) {
    return (
      <div>
        <PageHeader
          title="Students"
          description="Student records, profiles, and academic levels."
        />
        <div className="app-card">
          <EmptyState
            icon={AlertCircle}
            title="Access Denied"
            description="You don't have permission to view students."
          />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div>
        <PageHeader
          title="Students"
          description="Student records, profiles, and academic levels."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 size-4" /> Add student
            </Button>
          }
        />

        <div className="app-card">
          {/* Search bar */}
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
            <Input
              placeholder="Search this page — name, email or phone"
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
              title="Failed to load students"
              description={getStudentLoadError(error)}
              action={
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="mr-2 size-4" /> Retry
                </Button>
              }
            />
          ) : total === 0 ? (
            <EmptyState
              icon={Users}
              title="No students yet"
              description="Click 'Add student' above to register the first student."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No students found"
              description={`No students matching "${query}".`}
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
                    <TableHead>Student</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Age / Gender</TableHead>
                    <TableHead>Country / Timezone</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => {
                    const ageStr = s.age ? `${s.age} yrs` : null;
                    const genderStr = s.gender
                      ? s.gender.charAt(0) + s.gender.slice(1).toLowerCase()
                      : null;
                    const ageGender =
                      [ageStr, genderStr].filter(Boolean).join(" / ") || "—";

                    return (
                      <TableRow key={s.id}>
                        <TableCell>
                          <p className="font-medium">
                            {s.full_name ||
                              `${s.first_name} ${s.last_name}`.trim() ||
                              "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {s.phone_number || "—"}
                        </TableCell>
                        <TableCell className="text-sm">{ageGender}</TableCell>
                        <TableCell>
                          <p className="text-sm">{s.country || "—"}</p>
                          {s.timezone && (
                            <p className="text-xs text-muted-foreground">
                              {s.timezone}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {formatLevel(s.current_level)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {s.guardian_name ? (
                            <div>
                              <p className="text-sm font-medium">{s.guardian_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {[s.guardian_relationship, s.guardian_phone]
                                  .filter(Boolean)
                                  .join(" · ") || "—"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.is_active ? "secondary" : "outline"}>
                            {s.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(s.created_at)}
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
                                    aria-label="Edit student (coming soon)"
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
                                  // aria-label="Delete student (coming soon)"
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination — only shown when there are records */}
          <PaginationBar
            page={page}
            pageCount={pageCount}
            total={total}
            onChange={setPage}
          />
        </div>

        <AddStudentDialog
          open={open}
          onOpenChange={setOpen}
          onSuccess={() => setPage(1)}
        />
      </div>
    </TooltipProvider>
  );
}
