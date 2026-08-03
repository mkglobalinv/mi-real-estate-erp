import CRMBoardPage from '@/features/leads/board/page';
export default function Page({ params }: any) {
  return <CRMBoardPage basePath="/customer-care" params={params} />;
}