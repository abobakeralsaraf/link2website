import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { GeneratedSitesList } from '@/components/admin/GeneratedSitesList';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export interface GeneratedSiteRow {
  id: string;
  site_name: string;
  slug: string;
  place_id: string;
  business_data: Record<string, unknown>;
  status: 'draft' | 'published' | 'ready_for_domain';
  custom_domain: string | null;
  domain_verified: boolean;
  public_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export default function GeneratedSites() {
  const { t, language } = useLanguage();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sites, setSites] = useState<GeneratedSiteRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchSites = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('generated_sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setSites((data as GeneratedSiteRow[]) || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchSites();
    }
  }, [user]);

  const handleStatusChange = async (id: string, status: GeneratedSiteRow['status']) => {
    const { error } = await supabase
      .from('generated_sites')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setSites(sites.map(site => 
        site.id === id ? { ...site, status } : site
      ));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('generated_sites')
      .delete()
      .eq('id', id);

    if (!error) {
      setSites(sites.filter(site => site.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('generatedSites')}
          </h1>
          <p className="text-muted-foreground">
            {t('generatedSitesDescription')}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : (
          <GeneratedSitesList 
            sites={sites} 
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onRefresh={fetchSites}
          />
        )}
      </main>
    </div>
  );
}