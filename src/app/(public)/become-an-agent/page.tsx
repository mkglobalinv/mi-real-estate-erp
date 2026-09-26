import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { AgentPageContent, withAgentPageDefaults } from "@/lib/agent-page-content";
import BecomeAnAgentClient from "./BecomeAnAgentClient";

// Chairman edits (at /chairman/agent-page) show up within a minute.
export const revalidate = 60;

// Anonymous read of the public agent_page_settings row (schema.sql section
// 40). Falls back to the built-in defaults if it can't be read.
async function getContent(): Promise<AgentPageContent> {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data, error } = await supabase.from("agent_page_settings").select("content").eq("id", 1).maybeSingle();
    if (error) throw error;
    return withAgentPageDefaults(data?.content as Partial<AgentPageContent> | undefined);
  } catch (err) {
    console.warn("Failed to load agent page content:", err instanceof Error ? err.message : err);
    return withAgentPageDefaults(null);
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { seoTitle: title, seoDescription: description, heroImageUrl, heroImageAlt } = await getContent();
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: heroImageUrl, alt: heroImageAlt }] },
    twitter: { card: "summary_large_image", title, description, images: [heroImageUrl] },
  };
}

export default async function BecomeAnAgentPage() {
  return <BecomeAnAgentClient content={await getContent()} />;
}
