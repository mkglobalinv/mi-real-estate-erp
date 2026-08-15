import CampaignAnalyticsPage from '@/features/campaigns/[id]/analytics/page';
export default function Page({ params }: any) {
  return <CampaignAnalyticsPage basePath="/social-media-director" params={params} />;
}
