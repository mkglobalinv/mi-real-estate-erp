import CustomersPage from '@/features/customers/page';
export default function Page({ params }: any) { return <CustomersPage basePath="/admin" params={params} />; }