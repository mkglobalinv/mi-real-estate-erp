import CustomerCarePage from '@/features/customers/[id]/page';
export default function Page({ params }: any) { return <CustomerCarePage basePath="/admin" params={params} />; }