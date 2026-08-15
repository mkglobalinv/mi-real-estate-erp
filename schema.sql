-- M.I Real Estate ERP Supabase PostgreSQL Schema
-- Run this entire script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ROLES (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Chairman', 'Director', 'Secretary', 'Customer Care', 'Admin Engineer', 'Social Media Director', 'Customer', 'Super Admin')),
    phone TEXT,
    branch TEXT DEFAULT 'HQ Kano',
    active_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, 
    ref TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    address TEXT,
    occupation TEXT,
    nok_name TEXT,
    nok_phone TEXT,
    nok_relation TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROJECTS & LOCATIONS
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    cover_image TEXT,
    available_units INTEGER DEFAULT 0,
    starting_price NUMERIC DEFAULT 0,
    easy_buy_status BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PROPERTIES (Inventory)
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ref TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    purpose TEXT NOT NULL,
    location TEXT NOT NULL,
    price NUMERIC NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    area TEXT,
    status TEXT DEFAULT 'Available',
    verification_status TEXT DEFAULT 'Verified',
    easy_buy_eligible BOOLEAN DEFAULT false,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LEADS (CRM)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ref TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    whatsapp TEXT,
    source TEXT NOT NULL,
    interest TEXT NOT NULL,
    budget TEXT,
    location TEXT,
    notes TEXT,
    score INTEGER DEFAULT 10,
    temperature TEXT DEFAULT 'Cold',
    status TEXT DEFAULT 'New',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assignment_date TIMESTAMP WITH TIME ZONE,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. EASY BUY ACCOUNTS
CREATE TABLE IF NOT EXISTS public.easy_buy_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ref TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE RESTRICT,
    total_amount NUMERIC NOT NULL,
    initial_deposit NUMERIC NOT NULL,
    monthly_installment NUMERIC NOT NULL,
    duration_months INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    amount_paid NUMERIC DEFAULT 0,
    outstanding_balance NUMERIC NOT NULL,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. INSTALLMENTS
CREATE TABLE IF NOT EXISTS public.installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES public.easy_buy_accounts(id) ON DELETE CASCADE,
    month_number INTEGER NOT NULL,
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'Pending',
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. PAYMENT PROOFS & TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.payment_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.easy_buy_accounts(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    payment_date DATE NOT NULL,
    reference_number TEXT NOT NULL,
    proof_image_url TEXT NOT NULL,
    applied_to TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'Pending Verification',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ledger_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Credit', 'Debit')),
    description TEXT NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    reference_id TEXT,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ALLOCATIONS
CREATE TABLE IF NOT EXISTS public.allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ref TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
    property_id UUID REFERENCES public.properties(id) ON DELETE RESTRICT,
    project_id UUID REFERENCES public.projects(id) ON DELETE RESTRICT,
    block_number TEXT NOT NULL,
    plot_number TEXT NOT NULL,
    size_sqm INTEGER,
    status TEXT DEFAULT 'Provisional',
    allocation_date DATE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. DOCUMENTS
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_ref TEXT NOT NULL,
    file_url TEXT NOT NULL,
    generated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. CUSTOMER CARE TICKETS
CREATE TABLE IF NOT EXISTS public.customer_care_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ref TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Pending',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'System',
    read_status BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, active_status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'Customer',
    true
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 15. CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    description TEXT,
    featured_image TEXT,
    fb_ad_reference TEXT,
    status TEXT DEFAULT 'Draft',
    start_date DATE,
    end_date DATE,
    whatsapp_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. CAMPAIGN QUESTIONS
CREATE TABLE IF NOT EXISTS public.campaign_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB,
    order_index INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. CAMPAIGN MEDIA
CREATE TABLE IF NOT EXISTS public.campaign_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. CAMPAIGN FAQS
CREATE TABLE IF NOT EXISTS public.campaign_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. LEAD SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.lead_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    name TEXT,
    source TEXT,
    status TEXT DEFAULT 'New',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(phone, campaign_id)
);

-- 20. LEAD ANSWERS
CREATE TABLE IF NOT EXISTS public.lead_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.lead_submissions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.campaign_questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. LEAD SCORES
CREATE TABLE IF NOT EXISTS public.lead_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.lead_submissions(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. LEAD NOTES
CREATE TABLE IF NOT EXISTS public.lead_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.lead_submissions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 23. LEAD FOLLOWUPS
CREATE TABLE IF NOT EXISTS public.lead_followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.lead_submissions(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 24. LEAD ACTIVITIES
CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.lead_submissions(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 25. CAMPAIGN ANALYTICS
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ref TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'Pending Review',
    documents_verified BOOLEAN DEFAULT false,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 26. LANDING PAGE AGENT / CAMPAIGN BUILDER — PHASE 1 FOUNDATION
-- Additive, backward-compatible extensions to the EXISTING campaign system.
-- No existing table, column, or constraint is altered or dropped.
-- Every statement is idempotent (safe to re-run against a DB that has
-- already had this section applied).
-- Campaign status management reuses the existing campaigns.status column
-- (Draft/Active/Paused/Archived/Ended) — no schema change required there.
-- ============================================================================

-- 26.1 Campaign language configuration
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS supported_languages JSONB DEFAULT '["English","Hausa"]'::jsonb,
  ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'English';

-- 26.2 Formal greeting configuration
-- greeting_config holds optional per-language greeting overrides, e.g.
-- {"English": {"morning": "...", "afternoon": "...", "evening": "..."}, "Hausa": {...}}
-- An empty object means "use the system default time-of-day greeting".
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS greeting_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS greeting_config JSONB DEFAULT '{}'::jsonb;

-- 26.3 Conditional question branching + stable question keys
-- question_key is a stable machine identifier (e.g. 'name', 'location',
-- 'plot_size', 'purpose', 'payment_preference', 'timeline', 'readiness')
-- used by the workflow engine, the WhatsApp handoff message builder, and
-- the AI Builder to recognize well-known qualification questions without
-- relying on free-text question wording. It is optional/nullable so all
-- existing campaign_questions rows remain valid as-is.
-- parent_question_id + show_if_option implement conditional branching:
-- a child question is only shown if the parent question's answer equals
-- show_if_option.
ALTER TABLE public.campaign_questions
  ADD COLUMN IF NOT EXISTS question_key TEXT,
  ADD COLUMN IF NOT EXISTS parent_question_id UUID REFERENCES public.campaign_questions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS show_if_option TEXT;

-- 26.4 Optional pre-application form: official form templates.
-- New, additive table. Deliberately NOT the existing `applications` table —
-- this only models the reusable form template an Admin can select for a
-- campaign. It does not create ERP application records by itself.
CREATE TABLE IF NOT EXISTS public.application_form_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    -- The actual official form (a hosted PDF/document URL or external form
    -- link), mirroring the existing documents.file_url convention — this is
    -- the real ERP application form, not a newly invented form builder.
    file_url TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safe to re-run against a DB that already had this table from an earlier
-- application of this section, before file_url existed.
ALTER TABLE public.application_form_templates
  ADD COLUMN IF NOT EXISTS file_url TEXT;

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS pre_application_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS application_form_template_id UUID REFERENCES public.application_form_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pre_application_prompt TEXT;

-- 26.5 WhatsApp handoff configuration
-- campaigns.whatsapp_number already exists (section 15) and remains the
-- per-campaign number override. whatsapp_message_template is an optional
-- override of the default handoff message text; NULL means "use system
-- default template".
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS whatsapp_message_template TEXT;

-- 26.6 AI Builder drafts.
-- New, additive table. An AI draft is NEVER written into `campaigns`
-- directly — it only becomes a live campaign once an Admin reviews and
-- approves it (application-layer rule enforced in Phase 11).
CREATE TABLE IF NOT EXISTS public.campaign_ai_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    prompt_text TEXT NOT NULL,
    generated_config JSONB NOT NULL,
    status TEXT DEFAULT 'Pending Review' CHECK (status IN ('Pending Review', 'Approved', 'Rejected')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PHASE 9 — lead_submissions -> leads relationship.
-- Additive FK only. Existing lead_submissions rows are unaffected (lead_id
-- defaults to NULL); api.submitCampaignLead() now sets it on new
-- submissions instead of only linking the two by a notes-string summary.
-- Does not touch the existing applications/customer workflow.
-- ============================================================================
ALTER TABLE public.lead_submissions
  ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;
