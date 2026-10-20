import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

export default function RootLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <MeritlaneLoader level="page" text="Loading Meritlane…" />
    </div>
  );
}
