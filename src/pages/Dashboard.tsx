import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, Users, Plus, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, isAdmin, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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
    <div className="min-h-screen bg-background">
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
                {t('mySites')}
              </CardTitle>
              <CardDescription>{t('mySitesDesc')}</CardDescription>
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
