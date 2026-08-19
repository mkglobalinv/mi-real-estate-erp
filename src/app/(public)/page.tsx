import HomeClient from './HomeClient';
import QualifierLandingPage from '@/components/QualifierLandingPage';

// Server-side routing so an ad-traffic visit to /?qualify=true renders
// the dedicated qualification landing page with no flash of the regular
// homepage first (the decision happens before any HTML is sent, unlike a
// client-side check in a useEffect).
export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  if (params.qualify === 'true') {
    return <QualifierLandingPage />;
  }
  return <HomeClient />;
}
