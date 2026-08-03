import AnnouncementsManager from '@/features/announcements/page';
export default function Page({ params }: any) { return <AnnouncementsManager basePath="/admin" params={params} />; }