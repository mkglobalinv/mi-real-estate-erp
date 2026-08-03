import CampaignQuestionsPage from '@/features/campaigns/[id]/questions/page';
export default function Page({ params }: any) {
  return <CampaignQuestionsPage basePath="/social-media-director" params={params} />;
}