import CustomerCarePage from '@/features/customers/[id]/page';
export default function Page({ params }: any) {
  return <CustomerCarePage basePath="/director" params={params} />;
}