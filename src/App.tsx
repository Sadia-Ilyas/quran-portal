import { BrowserRouter, Navigate, Route, Routes, Link } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import Index from "./routes/index";
import Login from "./routes/login";
import AdminDashboard from "./routes/admin.dashboard";
import AdminTrialRequests from "./routes/admin.trial-requests";
import AdminContactInquiries from "./routes/admin.contact-inquiries";
import AdminStudents from "./routes/admin.students";
import AdminTeachers from "./routes/admin.teachers";
import AdminCourses from "./routes/admin.courses";
import AdminContent from "./routes/admin.content";
import AdminSettings from "./routes/admin.settings";
import TeacherDashboard from "./routes/teacher.dashboard";
import TeacherSchedule from "./routes/teacher.schedule";
import TeacherStudents from "./routes/teacher.students";
import TeacherLogs from "./routes/teacher.logs";
import TeacherProfile from "./routes/teacher.profile";
import StudentDashboard from "./routes/student.dashboard";
import StudentSchedule from "./routes/student.schedule";
import StudentCourses from "./routes/student.courses";
import StudentTeacher from "./routes/student.teacher";
import StudentProfile from "./routes/student.profile";

function Page({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return <>{children}</>;
}

function AdminLayout() {
  return <DashboardLayout role="admin" />;
}
function TeacherLayout() {
  return <DashboardLayout role="teacher" />;
}
function StudentLayout() {
  return <DashboardLayout role="student" />;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DashboardProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
    <Route path="/" element={<Page title="Quran Academy — Online Tajweed, Hifz & Qaida Classes"><Index /></Page>} />
    <Route path="/login" element={<Page title="Sign in — Quran Academy Portal"><Login /></Page>} />
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Page title="Admin Overview — Quran Academy Portal"><AdminDashboard /></Page>} />
        <Route path="trial-requests" element={<Page title="Trial Requests — Quran Academy Admin"><AdminTrialRequests /></Page>} />
        <Route path="contact-inquiries" element={<Page title="Contact Inquiries — Quran Academy Admin"><AdminContactInquiries /></Page>} />
        <Route path="students" element={<Page title="Students — Quran Academy Portal"><AdminStudents /></Page>} />
        <Route path="teachers" element={<Page title="Teachers — Quran Academy Portal"><AdminTeachers /></Page>} />
        <Route path="courses" element={<Page title="Courses — Quran Academy Portal"><AdminCourses /></Page>} />
        <Route path="content" element={<Page title="Content & FAQs — Quran Academy Portal"><AdminContent /></Page>} />
        <Route path="settings" element={<Page title="Academy Settings — Quran Academy Portal"><AdminSettings /></Page>} />
    </Route>
    <Route path="/teacher" element={<TeacherLayout />}>
      <Route index element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="dashboard" element={<Page title="Teacher Overview — Quran Academy Portal"><TeacherDashboard /></Page>} />
        <Route path="schedule" element={<Page title="Class Schedule — Quran Academy Portal"><TeacherSchedule /></Page>} />
        <Route path="students" element={<Page title="My Students — Quran Academy Portal"><TeacherStudents /></Page>} />
        <Route path="logs" element={<Page title="Class Logs — Quran Academy Portal"><TeacherLogs /></Page>} />
        <Route path="profile" element={<Page title="Teacher Profile — Quran Academy Portal"><TeacherProfile /></Page>} />
    </Route>
    <Route path="/student" element={<StudentLayout />}>
      <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<Page title="Student Dashboard — Quran Academy Portal"><StudentDashboard /></Page>} />
        <Route path="schedule" element={<Page title="My Timetable — Quran Academy Portal"><StudentSchedule /></Page>} />
        <Route path="courses" element={<Page title="My Courses — Quran Academy Portal"><StudentCourses /></Page>} />
        <Route path="teacher" element={<Page title="My Teacher — Quran Academy Portal"><StudentTeacher /></Page>} />
        <Route path="profile" element={<Page title="Student Profile — Quran Academy Portal"><StudentProfile /></Page>} />
    </Route>
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </DashboardProvider>
    </ThemeProvider>
  );
}
