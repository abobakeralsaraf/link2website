-- Create generated_sites table for managing client sites
CREATE TABLE public.generated_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  place_id TEXT NOT NULL,
  business_data JSONB NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'ready_for_domain')),
  custom_domain TEXT,
  domain_verified BOOLEAN DEFAULT false,
  public_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_sites ENABLE ROW LEVEL SECURITY;

-- For now, allow public read access (admin tool - will add auth later)
CREATE POLICY "Allow public read access to generated_sites"
ON public.generated_sites
FOR SELECT
USING (true);

-- Allow public insert (will secure with auth later)
CREATE POLICY "Allow public insert to generated_sites"
ON public.generated_sites
FOR INSERT
WITH CHECK (true);

-- Allow public update (will secure with auth later)
CREATE POLICY "Allow public update to generated_sites"
ON public.generated_sites
FOR UPDATE
USING (true);

-- Allow public delete (will secure with auth later)
CREATE POLICY "Allow public delete to generated_sites"
ON public.generated_sites
FOR DELETE
USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_generated_sites_updated_at
BEFORE UPDATE ON public.generated_sites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_generated_sites_slug ON public.generated_sites(slug);
CREATE INDEX idx_generated_sites_place_id ON public.generated_sites(place_id);
CREATE INDEX idx_generated_sites_status ON public.generated_sites(status);