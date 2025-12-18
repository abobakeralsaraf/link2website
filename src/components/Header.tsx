import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { LanguageToggle } from './LanguageToggle';
import { NavLink } from './NavLink';
import { Button } from './ui/button';
import { Menu, X, Layers, LogOut, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = user ? [
    { to: '/dashboard', label: t('dashboard') },
    { to: '/', label: t('navGenerator') },
    { to: '/generated-sites', label: t('navGeneratedSites') },
    ...(isAdmin ? [
      { to: '/admin/users', label: t('manageUsers') },
      { to: '/admin/domains', label: language === 'ar' ? 'إدارة النطاقات' : 'Domains' },
    ] : []),
  ] : [
    { to: '/', label: t('navGenerator') },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
            <Layers className="h-7 w-7" />
            <span className="font-bold text-xl tracking-tight">{t('appName')}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label={t('dashboard')}>
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className="px-3 py-2 text-sm font-semibold text-foreground/90 hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                activeClassName="bg-secondary text-foreground"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <LanguageToggle />
            
            {user ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                {t('signOut')}
              </Button>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button size="sm" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  {t('signIn')}
                </Button>
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.label} 
                  to={link.to} 
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              
              {user ? (
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t('signOut')}
                </button>
              ) : (
                <Link 
                  to="/auth" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  {t('signIn')}
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
