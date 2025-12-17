import { useLanguage } from '@/hooks/useLanguage';
import { GeneratedSiteRow } from '@/pages/GeneratedSites';
import { SiteStatusBadge } from './SiteStatusBadge';
import { Button } from '@/components/ui/button';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExternalLink, MoreVertical, Trash2, Globe, FileCheck } from 'lucide-react';
import { format } from 'date-fns';

interface GeneratedSitesListProps {
  sites: GeneratedSiteRow[];
  onStatusChange: (id: string, status: GeneratedSiteRow['status']) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function GeneratedSitesList({ 
  sites, 
  onStatusChange, 
  onDelete,
}: GeneratedSitesListProps) {
  const { t } = useLanguage();

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
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('siteName')}</TableHead>
            <TableHead>{t('slug')}</TableHead>
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
              <TableCell>
                <SiteStatusBadge status={site.status} />
              </TableCell>
              <TableCell>
                {site.custom_domain ? (
                  <span className="text-primary">{site.custom_domain}</span>
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
  );
}