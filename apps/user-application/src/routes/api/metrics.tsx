/**
 * Performance metrics API endpoint
 * Exposes performance data for monitoring and analysis
 * Implements requirement 6.5 from bundle-optimization spec
 */

import { createFileRoute } from "@tanstack/react-router";
import { perfMonitor } from "@/lib/performance-monitor";

export const Route = createFileRoute("/api/metrics")({
  server: {
    handlers: {
      GET: () => {
        try {
          // Get all performance metrics
          const metrics = perfMonitor.getAllMetrics();

          // Calculate additional statistics
          const summary = {
            timestamp: new Date().toISOString(),
            environment: import.meta.env.MODE,
            metrics: {
              webVitals: metrics.webVitals,
              routes: {
                count: metrics.routeMetrics.length,
                data: metrics.routeMetrics,
              },
              bundles: {
                count: metrics.bundleMetrics.length,
                data: metrics.bundleMetrics,
              },
              statistics: metrics.stats,
            },
            summary: {
              totalRoutes: metrics.routeMetrics.length,
              totalBundles: metrics.bundleMetrics.length,
              averageRouteLoadTime: calculateAverage(
                metrics.routeMetrics.map((m) => m.loadTime)
              ),
              averageBundleLoadTime: calculateAverage(
                metrics.bundleMetrics.map((m) => m.loadTime)
              ),
            },
          };

          return new Response(JSON.stringify(summary), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
            },
          });
        } catch (error) {
          console.error("Error fetching performance metrics:", error);
          return new Response(
            JSON.stringify({
              error: "Failed to fetch performance metrics",
              message: error instanceof Error ? error.message : "Unknown error",
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
      },
    },
  },
});

/**
 * Calculate average of an array of numbers
 */
function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}
