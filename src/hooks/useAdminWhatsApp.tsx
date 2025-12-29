import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminContact {
  whatsapp_number: string | null;
  country: string | null;
  full_name: string | null;
}

export function useAdminWhatsApp() {
  const [adminContact, setAdminContact] = useState<AdminContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [userCountry, setUserCountry] = useState<string | null>(null);

  useEffect(() => {
    detectCountryAndFetchAdmin();
  }, []);

  const detectCountryAndFetchAdmin = async () => {
    try {
      // First, try to detect user's country
      let detectedCountry = 'EG'; // Default fallback
      
      try {
        const { data, error } = await supabase.functions.invoke('detect-country');
        if (!error && data?.countryCode) {
          detectedCountry = data.countryCode;
        }
      } catch (e) {
        console.log('Country detection failed, using default:', e);
      }

      setUserCountry(detectedCountry);

      // Fetch admin for this country
      const { data: admins, error: adminError } = await supabase
        .from('profiles')
        .select('whatsapp_number, country, full_name')
        .eq('country', detectedCountry)
        .not('whatsapp_number', 'is', null);

      if (adminError) {
        console.error('Error fetching admin:', adminError);
        // Fallback: get any admin with WhatsApp
        const { data: anyAdmin } = await supabase
          .from('profiles')
          .select('whatsapp_number, country, full_name')
          .not('whatsapp_number', 'is', null)
          .limit(1)
          .single();
        
        if (anyAdmin) {
          setAdminContact(anyAdmin);
        }
      } else if (admins && admins.length > 0) {
        setAdminContact(admins[0]);
      } else {
        // No admin for this country, get any admin with WhatsApp
        const { data: anyAdmin } = await supabase
          .from('profiles')
          .select('whatsapp_number, country, full_name')
          .not('whatsapp_number', 'is', null)
          .limit(1)
          .single();
        
        if (anyAdmin) {
          setAdminContact(anyAdmin);
        }
      }
    } catch (error) {
      console.error('Error in detectCountryAndFetchAdmin:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    adminWhatsApp: adminContact?.whatsapp_number || null,
    adminCountry: adminContact?.country || null,
    userCountry,
    loading,
  };
}
