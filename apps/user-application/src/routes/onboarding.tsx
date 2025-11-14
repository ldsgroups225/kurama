import { createFileRoute } from "@tanstack/react-router";
import { FormSkeleton } from "@/components/skeletons/form-skeleton";

export const Route = createFileRoute("/onboarding")({
  pendingComponent: FormSkeleton,
});
