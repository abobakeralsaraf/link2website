-- Add whatsapp_number and country columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN whatsapp_number text,
ADD COLUMN country text;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.whatsapp_number IS 'Admin WhatsApp number for client contact';
COMMENT ON COLUMN public.profiles.country IS 'Country the admin is responsible for';