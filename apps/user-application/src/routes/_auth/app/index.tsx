import { createFileRoute } from "@tanstack/react-router";
import { AppPageSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/_auth/app/")({
  pendingComponent: AppPageSkeleton,
});
