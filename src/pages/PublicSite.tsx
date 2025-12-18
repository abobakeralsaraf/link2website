import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BusinessData } from '@/lib/types';
import { GeneratedWebsite } from '@/components/generated/GeneratedWebsite';
import { LoadingState } from '@/components/LoadingState';

export default function PublicSite() {
  const { slug } = useParams<{ slug: string }>();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSite() {
      if (!slug) {
        setError('No site slug provided');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('public_sites')
        .select('business_data')
        .eq('slug', slug)
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
    }

    fetchSite();
  }, [slug]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-muted-foreground">{error || 'Site not found'}</p>
        </div>
      </div>
    );
  }

  return <GeneratedWebsite business={business} />;
}
