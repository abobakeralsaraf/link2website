import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AuthProvider } from "@/hooks/useAuth";
import { useSubdomain } from "@/hooks/useSubdomain";
import { GeneratedWebsite } from "@/components/generated/GeneratedWebsite";
import { LoadingState } from "@/components/LoadingState";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import GeneratedSites from "./pages/GeneratedSites";
import AdminUsers from "./pages/AdminUsers";
import AdminDomains from "./pages/AdminDomains";
import PublicSite from "./pages/PublicSite";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle subdomain routing
function SubdomainRouter() {
  const { business, loading, error, isSubdomain } = useSubdomain();

  // If it's a subdomain, render the client site directly
  if (isSubdomain) {
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

  // Otherwise, render the main app routes
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/generated-sites" element={<GeneratedSites />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/domains" element={<AdminDomains />} />
        <Route path="/site/:slug" element={<PublicSite />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <SubdomainRouter />
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
