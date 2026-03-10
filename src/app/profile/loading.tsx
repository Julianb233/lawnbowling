import { ProfileSkeleton } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-animated-gradient p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-6 h-6 w-32 rounded skeleton" />
        <ProfileSkeleton />
      </div>
    </div>
  );
}
