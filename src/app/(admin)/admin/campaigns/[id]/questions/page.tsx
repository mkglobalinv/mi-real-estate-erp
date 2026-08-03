import CampaignQuestionsPage from '@/features/campaigns/[id]/questions/page';
export default function Page({ params }: any) { return <CampaignQuestionsPage basePath="/admin" params={params} />; }