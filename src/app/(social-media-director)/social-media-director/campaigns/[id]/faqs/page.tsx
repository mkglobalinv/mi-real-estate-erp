import CampaignFaqsPage from '@/features/campaigns/[id]/faqs/page';
export default function Page({ params }: any) {
  return <CampaignFaqsPage basePath="/social-media-director" params={params} />;
}