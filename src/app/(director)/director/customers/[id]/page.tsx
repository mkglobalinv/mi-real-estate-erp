import CustomerCarePage from '@/features/customers/[id]/page';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <CustomerCarePage basePath="/director" params={resolvedParams} />;
}