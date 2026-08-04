import React from 'react';
import ClientServicePage, { servicesData } from './ClientServicePage';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const service = servicesData[params.slug];
  if (!service) return { title: 'Service Not Found' };
  
  return {
    title: `${service.title} | M.I. Real Estate Services`,
    description: service.description,
  };
}

export default async function ServicePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  return <ClientServicePage slug={params.slug} />;
}
