import { createFileRoute } from "@tanstack/react-router";
import { PageSkeleton } from "@/components/skeletons/page-skeleton";

export const Route = createFileRoute("/")({
  pendingComponent: PageSkeleton,
});
