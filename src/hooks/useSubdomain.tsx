import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BusinessData } from '@/lib/types';

interface SubdomainSite {
  business: BusinessData | null;
  loading: boolean;
  error: string | null;
  isSubdomain: boolean;
}

export function useSubdomain(): SubdomainSite {
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubdomain, setIsSubdomain] = useState(false);

  useEffect(() => {
    async function checkSubdomain() {
      const hostname = window.location.hostname;
      
      // Check if it's a subdomain of saroarabuilder.com
      const mainDomains = ['saroarabuilder.com', 'localhost', 'lovableproject.com'];
      const isMainDomain = mainDomains.some(domain => 
        hostname === domain || 
        hostname === `www.${domain}` ||
        hostname.endsWith(`.lovableproject.com`)
      );

      if (isMainDomain) {
        setIsSubdomain(false);
        setLoading(false);
        return;
      }

      // Check if it's a subdomain of saroarabuilder.com
      if (hostname.endsWith('.saroarabuilder.com')) {
        setIsSubdomain(true);
        const subdomain = hostname.replace('.saroarabuilder.com', '');
        const customDomain = `${subdomain}.saroarabuilder.com`;

        const { data, error: fetchError } = await supabase
          .from('generated_sites')
          .select('business_data')
          .eq('custom_domain', customDomain)
          .eq('status', 'published')
          .maybeSingle();

        if (fetchError) {
          setError('Failed to load site');
          setLoading(false);
          return;
        }

        if (!data) {
          setError('Site not found');
          setLoading(false);
          return;
        }

        setBusiness(data.business_data as unknown as BusinessData);
        setLoading(false);
        return;
      }

      // Not a recognized subdomain
      setIsSubdomain(false);
      setLoading(false);
    }

    checkSubdomain();
  }, []);

  return { business, loading, error, isSubdomain };
}
