
import { PageHeader } from "@/components/dashboard/ui-kit";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export default StudentProfile;

function StudentProfile() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Profile" description="Keep your details and timezone up to date." />
      <ProfileForm />
    </div>
  );
}
