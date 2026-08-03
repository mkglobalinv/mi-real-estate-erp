import EditCampaignPage from '@/features/campaigns/[id]/edit/page';
export default function Page({ params }: any) {
  return <EditCampaignPage basePath="/social-media-director" params={params} />;
}