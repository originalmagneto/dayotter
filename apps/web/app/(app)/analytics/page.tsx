import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { InsightsTabs } from "@/components/insights-tabs";
import { PageHeader } from "@/components/page-header";
import { ProGate } from "@/components/upgrade-prompt";
import { getTenant } from "@/lib/brand/server";

export async function generateMetadata() {
  const tenant = await getTenant();
  return { title: `Analytics - ${tenant.name}` };
}

export default async function AnalyticsPage() {
  const tenant = await getTenant();
  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="How your booking pages convert - views, bookings, cancellations, and revenue."
      />
      <InsightsTabs />
      <ProGate feature="analytics">
        <AnalyticsDashboard />
      </ProGate>
    </>
  );
}
