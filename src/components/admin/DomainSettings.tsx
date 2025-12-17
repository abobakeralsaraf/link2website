import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Globe, Copy, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DomainSettingsProps {
  siteId: string;
  siteName: string;
  slug: string;
  currentDomain: string | null;
  domainVerified: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDomainUpdated: () => void;
}

export function DomainSettings({
  siteId,
  siteName,
  slug,
  currentDomain,
  domainVerified,
  open,
  onOpenChange,
  onDomainUpdated,
}: DomainSettingsProps) {
  const { language } = useLanguage();
  const [domain, setDomain] = useState(currentDomain || '');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const autoSubdomain = `${slug}.saroarabuilder.com`;

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success(language === 'ar' ? 'تم النسخ!' : 'Copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveDomain = async () => {
    if (!domain.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال النطاق' : 'Please enter a domain');
      return;
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain.trim())) {
      toast.error(language === 'ar' ? 'صيغة النطاق غير صحيحة' : 'Invalid domain format');
      return;
    }

    setIsSaving(true);

    const { error } = await supabase
      .from('generated_sites')
      .update({
        custom_domain: domain.trim().toLowerCase(),
        domain_verified: false,
        status: 'ready_for_domain',
      })
      .eq('id', siteId);

    setIsSaving(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(language === 'ar' ? 'تم حفظ النطاق' : 'Domain saved');
      onDomainUpdated();
      onOpenChange(false);
    }
  };

  const handleRemoveDomain = async () => {
    setIsSaving(true);

    // Reset to auto subdomain
    const { error } = await supabase
      .from('generated_sites')
      .update({
        custom_domain: autoSubdomain,
        domain_verified: true,
        status: 'published',
      })
      .eq('id', siteId);

    setIsSaving(false);

    if (error) {
      toast.error(error.message);
    } else {
      setDomain('');
      toast.success(language === 'ar' ? 'تم إعادة تعيين النطاق الفرعي' : 'Domain reset to subdomain');
      onDomainUpdated();
    }
  };

  const isCustomDomain = currentDomain && !currentDomain.endsWith('.saroarabuilder.com');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {language === 'ar' ? 'إعدادات النطاق' : 'Domain Settings'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ar' 
              ? `إدارة نطاق موقع "${siteName}"`
              : `Manage domain for "${siteName}"`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Auto Subdomain Info */}
          <Alert className="bg-primary/5 border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">
              {language === 'ar' ? 'النطاق الفرعي التلقائي' : 'Automatic Subdomain'}
            </AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                {language === 'ar'
                  ? 'موقعك متاح تلقائياً على الرابط التالي:'
                  : 'Your site is automatically available at:'}
              </p>
              <div className="flex items-center gap-2 bg-background rounded-lg p-2">
                <span className="font-mono text-sm text-foreground flex-1">
                  https://{autoSubdomain}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(`https://${autoSubdomain}`, 'auto')}
                >
                  {copied === 'auto' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* Current Custom Domain Status */}
          {isCustomDomain && currentDomain && (
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">{currentDomain}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'النطاق المخصص الحالي' : 'Current custom domain'}
                </p>
              </div>
              <Badge variant={domainVerified ? 'default' : 'secondary'}>
                {domainVerified 
                  ? (language === 'ar' ? 'متحقق' : 'Verified')
                  : (language === 'ar' ? 'قيد الانتظار' : 'Pending')}
              </Badge>
            </div>
          )}

          {/* Custom Domain Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">
                {language === 'ar' ? 'ربط نطاق مخصص (اختياري)' : 'Connect Custom Domain (Optional)'}
              </Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {language === 'ar' 
                  ? 'أدخل نطاقك بدون http:// أو www'
                  : 'Enter your domain without http:// or www'}
              </p>
            </div>

            {/* DNS Instructions */}
            {domain && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {language === 'ar' ? 'إعدادات DNS المطلوبة' : 'Required DNS Settings'}
                </AlertTitle>
                <AlertDescription className="mt-2 space-y-3">
                  <p className="text-sm">
                    {language === 'ar' 
                      ? 'أضف السجلات التالية في إعدادات DNS لدى مزود النطاق:'
                      : 'Add the following records in your domain provider\'s DNS settings:'}
                  </p>
                  
                  <div className="space-y-2 font-mono text-xs bg-background rounded-lg p-3">
                    {/* A Record for root */}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">A Record (Root):</span>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">@ → 185.158.133.1</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy('185.158.133.1', 'root')}
                        >
                          {copied === 'root' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    {/* A Record for www */}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">A Record (www):</span>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">www → 185.158.133.1</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy('185.158.133.1', 'www')}
                        >
                          {copied === 'www' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    {/* TXT Record */}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">TXT Record:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">_lovable → lovable_verify={siteId.slice(0, 8)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(`lovable_verify=${siteId.slice(0, 8)}`, 'txt')}
                        >
                          {copied === 'txt' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' 
                      ? 'قد يستغرق انتشار DNS حتى 72 ساعة. سيتم إصدار شهادة SSL تلقائياً بعد التحقق.'
                      : 'DNS propagation may take up to 72 hours. SSL certificate will be provisioned automatically after verification.'}
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleSaveDomain} 
              disabled={isSaving || !domain.trim()}
              className="w-full"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {language === 'ar' ? 'حفظ النطاق المخصص' : 'Save Custom Domain'}
            </Button>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          {isCustomDomain && (
            <Button
              variant="destructive"
              onClick={handleRemoveDomain}
              disabled={isSaving}
            >
              {language === 'ar' ? 'إعادة تعيين للنطاق الفرعي' : 'Reset to Subdomain'}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}