-- Create payment methods reference table
CREATE TABLE public.payment_method_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_method_types ENABLE ROW LEVEL SECURITY;

-- Allow public read access (these are reference data)
CREATE POLICY "Payment method types are viewable by everyone" 
ON public.payment_method_types 
FOR SELECT 
USING (true);

-- Insert default payment methods
INSERT INTO public.payment_method_types (name, name_ar, icon_url) VALUES
('InstaPay', 'إنستا باي', '/payment-icons/instapay.png'),
('Vodafone Cash', 'فودافون كاش', '/payment-icons/vodafone-cash.png'),
('Zelle', 'زيلي', '/payment-icons/zelle.png');