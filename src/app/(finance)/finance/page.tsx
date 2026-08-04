import FinanceDashboardPage from '@/features/finance/page';

export default function Page({ params }: any) {
  return <FinanceDashboardPage basePath="/finance" params={params} />;
}
