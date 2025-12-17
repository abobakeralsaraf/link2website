import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, Users, Plus, BarChart3, FileCheck, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalSites: number;
  publishedSites: number;
  draftSites: number;
  sitesWithDomain: number;
  totalUsers: number;
}

export default function Dashboard() {
  const { user, isAdmin, loading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setStatsLoading(true);
      
      // Fetch sites stats
      const { data: sites } = await supabase
        .from('generated_sites')
        .select('status, custom_domain');
      
      let totalUsers = 0;
      if (isAdmin) {
        // Fetch users count for admin
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        totalUsers = count || 0;
      }
      
      if (sites) {
        setStats({
          totalSites: sites.length,
          publishedSites: sites.filter(s => s.status === 'published').length,
          draftSites: sites.filter(s => s.status === 'draft').length,
          sitesWithDomain: sites.filter(s => s.custom_domain).length,
          totalUsers,
        });
      }
      
      setStatsLoading(false);
    };

    if (user) {
      fetchStats();
    }
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('welcomeBack')}, {user.user_metadata?.full_name || user.email}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? t('adminDashboardDescription') : t('clientDashboardDescription')}
          </p>
          {isAdmin && (
            <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {t('adminBadge')}
            </span>
          )}
        </div>

        {/* Stats Section - Admin Only */}
        {isAdmin && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalSites}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'إجمالي المواقع' : 'Total Sites'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <FileCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.publishedSites}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'منشور' : 'Published'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Link2 className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.sitesWithDomain}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'مع نطاق' : 'With Domain'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'المستخدمين' : 'Users'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Client Stats */}
        {!isAdmin && stats && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalSites}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'مواقعي' : 'My Sites'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <FileCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.publishedSites}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'منشور' : 'Published'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Generate Site Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                {t('generateNewSite')}
              </CardTitle>
              <CardDescription>{t('generateNewSiteDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/">
                <Button className="w-full">{t('startGenerating')}</Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* My Sites Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                {isAdmin ? (language === 'ar' ? 'جميع المواقع' : 'All Sites') : t('mySites')}
              </CardTitle>
              <CardDescription>
                {isAdmin 
                  ? (language === 'ar' ? 'عرض وإدارة جميع المواقع المنشأة' : 'View and manage all generated sites')
                  : t('mySitesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/generated-sites">
                <Button variant="outline" className="w-full">{t('viewSites')}</Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Admin Only: Manage Users */}
          {isAdmin && (
            <Card className="hover:shadow-lg transition-shadow border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {t('manageUsers')}
                </CardTitle>
                <CardDescription>{t('manageUsersDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin/users">
                  <Button variant="secondary" className="w-full">{t('viewUsers')}</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
