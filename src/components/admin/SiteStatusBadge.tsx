import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';

interface SiteStatusBadgeProps {
  status: 'draft' | 'published' | 'ready_for_domain';
}

export function SiteStatusBadge({ status }: SiteStatusBadgeProps) {
  const { t } = useLanguage();
  
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'secondary',
    published: 'default',
    ready_for_domain: 'outline',
  };

  const labels: Record<string, string> = {
    draft: t('statusDraft'),
    published: t('statusPublished'),
    ready_for_domain: t('statusReadyForDomain'),
  };

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  );
}