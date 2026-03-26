-- Create lead_status enum
CREATE TYPE public.lead_status AS ENUM ('new', 'called', 'interested', 'demo_booked', 'closed', 'dead');

-- Create leads table
CREATE TABLE public.leads (
  id BIGSERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  city TEXT,
  postcode TEXT,
  industry TEXT DEFAULT 'Unknown',
  status public.lead_status NOT NULL DEFAULT 'new',
  source TEXT DEFAULT 'manual',
  rating NUMERIC,
  review_count INTEGER,
  notes TEXT DEFAULT '',
  last_called_at TIMESTAMPTZ,
  call_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create call_log table
CREATE TABLE public.call_log (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  outcome TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (open access since there's no auth in this app)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_log ENABLE ROW LEVEL SECURITY;

-- Allow all operations (no auth in this CRM)
CREATE POLICY "Allow all access to leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to call_log" ON public.call_log FOR ALL USING (true) WITH CHECK (true);

-- Index for common queries
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_call_log_lead_id ON public.call_log(lead_id);
CREATE INDEX idx_call_log_created_at ON public.call_log(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();