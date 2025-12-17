import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { GeneratedSitesList } from '@/components/admin/GeneratedSitesList';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  owner_email?: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
}

export default function GeneratedSites() {
  const { t, language } = useLanguage();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sites, setSites] = useState<GeneratedSiteRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userFilter, setUserFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchSites = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    // Fetch sites
    const { data: sitesData, error: sitesError } = await supabase
      .from('generated_sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (sitesError) {
      setError(sitesError.message);
      setIsLoading(false);
      return;
    }

    // If admin, fetch user profiles to get owner emails
    if (isAdmin && sitesData) {
      const userIds = [...new Set(sitesData.map(s => s.user_id).filter(Boolean))];
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        if (profilesData) {
          setUsers(profilesData);
          
          // Map owner emails to sites
          const sitesWithOwners = sitesData.map(site => ({
            ...site,
            owner_email: profilesData.find(p => p.id === site.user_id)?.email || undefined,
          })) as GeneratedSiteRow[];
          
          setSites(sitesWithOwners);
        } else {
          setSites(sitesData as GeneratedSiteRow[]);
        }
      } else {
        setSites(sitesData as GeneratedSiteRow[]);
      }
    } else {
      setSites((sitesData as GeneratedSiteRow[]) || []);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchSites();
    }
  }, [user, isAdmin]);

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

  // Filter sites
  const filteredSites = sites.filter(site => {
    const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
    const matchesUser = userFilter === 'all' || site.user_id === userFilter;
    return matchesStatus && matchesUser;
  });

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isAdmin 
              ? (language === 'ar' ? 'جميع المواقع المُنشأة' : 'All Generated Sites')
              : t('generatedSites')}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? (language === 'ar' ? 'عرض وإدارة جميع المواقع المُنشأة من جميع المستخدمين' : 'View and manage all generated sites from all users')
              : t('generatedSitesDescription')}
          </p>
        </div>

        {/* Filters - Admin Only */}
        {isAdmin && !isLoading && sites.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {language === 'ar' ? 'الحالة:' : 'Status:'}
              </span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'ar' ? 'الكل' : 'All'}
                  </SelectItem>
                  <SelectItem value="draft">
                    {language === 'ar' ? 'مسودة' : 'Draft'}
                  </SelectItem>
                  <SelectItem value="published">
                    {language === 'ar' ? 'منشور' : 'Published'}
                  </SelectItem>
                  <SelectItem value="ready_for_domain">
                    {language === 'ar' ? 'جاهز للنطاق' : 'Ready for Domain'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {users.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'المالك:' : 'Owner:'}
                </span>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language === 'ar' ? 'جميع المستخدمين' : 'All Users'}
                    </SelectItem>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

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
            sites={filteredSites} 
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onRefresh={fetchSites}
            showOwner={isAdmin}
          />
        )}
      </main>
    </div>
  );
}
