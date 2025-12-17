import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { GeneratedSiteRow } from '@/pages/GeneratedSites';
import { SiteStatusBadge } from './SiteStatusBadge';
import { DomainSettings } from './DomainSettings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExternalLink, MoreVertical, Trash2, Globe, FileCheck, Link2, User } from 'lucide-react';
import { format } from 'date-fns';

interface GeneratedSitesListProps {
  sites: GeneratedSiteRow[];
  onStatusChange: (id: string, status: GeneratedSiteRow['status']) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  showOwner?: boolean;
}

export function GeneratedSitesList({ 
  sites, 
  onStatusChange, 
  onDelete,
  onRefresh,
  showOwner = false,
}: GeneratedSitesListProps) {
  const { t, language } = useLanguage();
  const [domainDialogSite, setDomainDialogSite] = useState<GeneratedSiteRow | null>(null);

  if (sites.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
        <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          {t('noSitesYet')}
        </h3>
        <p className="text-muted-foreground">
          {t('noSitesDescription')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('siteName')}</TableHead>
              <TableHead>{t('slug')}</TableHead>
              {showOwner && (
                <TableHead>
                  {language === 'ar' ? 'المالك' : 'Owner'}
                </TableHead>
              )}
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('customDomain')}</TableHead>
              <TableHead>{t('createdAt')}</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.map((site) => (
              <TableRow key={site.id}>
                <TableCell className="font-medium">{site.site_name}</TableCell>
                <TableCell className="text-muted-foreground">/{site.slug}</TableCell>
                {showOwner && (
                  <TableCell>
                    {site.owner_email ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{site.owner_email}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <SiteStatusBadge status={site.status} />
                </TableCell>
                <TableCell>
                  {site.custom_domain ? (
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{site.custom_domain}</span>
                      <Badge 
                        variant={site.domain_verified ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {site.domain_verified 
                          ? (language === 'ar' ? 'متحقق' : 'Verified')
                          : (language === 'ar' ? 'قيد الانتظار' : 'Pending')}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(site.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => window.open(`/site/${site.slug}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t('openSite')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDomainDialogSite(site)}
                      >
                        <Link2 className="h-4 w-4 mr-2" />
                        {language === 'ar' ? 'ربط نطاق' : 'Connect Domain'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onStatusChange(site.id, 'published')}
                        disabled={site.status === 'published'}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        {t('markPublished')}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onStatusChange(site.id, 'ready_for_domain')}
                        disabled={site.status === 'ready_for_domain'}
                      >
                        <FileCheck className="h-4 w-4 mr-2" />
                        {t('readyForDomain')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(site.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Domain Settings Dialog */}
      {domainDialogSite && (
        <DomainSettings
          siteId={domainDialogSite.id}
          siteName={domainDialogSite.site_name}
          currentDomain={domainDialogSite.custom_domain}
          domainVerified={domainDialogSite.domain_verified}
          open={!!domainDialogSite}
          onOpenChange={(open) => !open && setDomainDialogSite(null)}
          onDomainUpdated={onRefresh}
        />
      )}
    </>
  );
}
