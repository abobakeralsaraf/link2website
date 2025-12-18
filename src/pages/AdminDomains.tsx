import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Globe, Check, X, Clock, ExternalLink, Copy, Loader2 } from 'lucide-react';

interface DomainRequest {
  id: string;
  site_name: string;
  slug: string;
  custom_domain: string | null;
  domain_approval_status: string | null;
  domain_admin_notes: string | null;
  domain_verified: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function AdminDomains() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState<DomainRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DomainRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchDomainRequests();
    }
  }, [user, isAdmin]);

  const fetchDomainRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('generated_sites')
      .select('id, site_name, slug, custom_domain, domain_approval_status, domain_admin_notes, domain_verified, created_at, updated_at')
      .not('custom_domain', 'is', null)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error(language === 'ar' ? 'فشل في جلب الطلبات' : 'Failed to fetch requests');
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    const { error } = await supabase
      .from('generated_sites')
      .update({
        domain_approval_status: 'approved',
        domain_admin_notes: adminNotes || null,
      })
      .eq('id', selectedRequest.id);

    setProcessing(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(language === 'ar' ? 'تمت الموافقة على النطاق' : 'Domain approved');
      setDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchDomainRequests();
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    if (!adminNotes.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال سبب الرفض' : 'Please enter rejection reason');
      return;
    }

    setProcessing(true);
    const { error } = await supabase
      .from('generated_sites')
      .update({
        domain_approval_status: 'rejected',
        domain_admin_notes: adminNotes,
      })
      .eq('id', selectedRequest.id);

    setProcessing(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(language === 'ar' ? 'تم رفض النطاق' : 'Domain rejected');
      setDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchDomainRequests();
    }
  };

  const handleMarkVerified = async (request: DomainRequest) => {
    const { error } = await supabase
      .from('generated_sites')
      .update({
        domain_verified: true,
        status: 'published',
      })
      .eq('id', request.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(language === 'ar' ? 'تم تأكيد التحقق' : 'Marked as verified');
      fetchDomainRequests();
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(language === 'ar' ? 'تم النسخ!' : 'Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string | null, verified: boolean | null) => {
    if (verified) {
      return <Badge className="bg-green-500">{language === 'ar' ? 'مُفعّل' : 'Active'}</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
          <Clock className="w-3 h-3 mr-1" />
          {language === 'ar' ? 'قيد الانتظار' : 'Pending'}
        </Badge>;
      case 'approved':
        return <Badge className="bg-blue-500">
          <Check className="w-3 h-3 mr-1" />
          {language === 'ar' ? 'تمت الموافقة' : 'Approved'}
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive">
          <X className="w-3 h-3 mr-1" />
          {language === 'ar' ? 'مرفوض' : 'Rejected'}
        </Badge>;
      default:
        return <Badge variant="outline">{language === 'ar' ? 'غير محدد' : 'None'}</Badge>;
    }
  };

  const pendingCount = requests.filter(r => r.domain_approval_status === 'pending').length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            {language === 'ar' ? 'إدارة طلبات النطاقات' : 'Domain Requests Management'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'ar' 
              ? 'مراجعة والموافقة على طلبات النطاقات المخصصة من العملاء'
              : 'Review and approve custom domain requests from clients'}
          </p>
          {pendingCount > 0 && (
            <Badge className="mt-2 bg-yellow-500">
              {language === 'ar' ? `${pendingCount} طلب قيد الانتظار` : `${pendingCount} pending requests`}
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'جميع طلبات النطاقات' : 'All Domain Requests'}</CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'انقر على طلب للمراجعة والموافقة أو الرفض'
                : 'Click on a request to review and approve or reject'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'ar' ? 'لا توجد طلبات نطاقات' : 'No domain requests yet'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'ar' ? 'الموقع' : 'Site'}</TableHead>
                    <TableHead>{language === 'ar' ? 'النطاق المطلوب' : 'Requested Domain'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.site_name}</p>
                          <p className="text-sm text-muted-foreground">{request.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{request.custom_domain}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopy(request.custom_domain || '')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.domain_approval_status, request.domain_verified)}
                      </TableCell>
                      <TableCell>
                        {request.updated_at 
                          ? new Date(request.updated_at).toLocaleDateString(language === 'ar' ? 'ar' : 'en')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setAdminNotes(request.domain_admin_notes || '');
                              setDialogOpen(true);
                            }}
                          >
                            {language === 'ar' ? 'مراجعة' : 'Review'}
                          </Button>
                          {request.domain_approval_status === 'approved' && !request.domain_verified && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleMarkVerified(request)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              {language === 'ar' ? 'تأكيد التفعيل' : 'Mark Active'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'مراجعة طلب النطاق' : 'Review Domain Request'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.site_name}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'ar' ? 'النطاق:' : 'Domain:'}</span>
                  <span className="font-mono font-medium">{selectedRequest.custom_domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'ar' ? 'الموقع:' : 'Site:'}</span>
                  <span>{selectedRequest.site_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'ar' ? 'الرابط الحالي:' : 'Current URL:'}</span>
                  <a 
                    href={`/site/${selectedRequest.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    /site/{selectedRequest.slug}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === 'ar' ? 'ملاحظات الأدمن (اختياري للموافقة، إجباري للرفض):' : 'Admin Notes (optional for approval, required for rejection):'}
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={language === 'ar' 
                    ? 'أضف ملاحظات أو تعليمات للعميل...'
                    : 'Add notes or instructions for the client...'}
                  rows={3}
                />
              </div>

              {selectedRequest.domain_approval_status === 'approved' && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
                  <p className="font-medium text-blue-600 mb-2">
                    {language === 'ar' ? 'الخطوة التالية:' : 'Next Step:'}
                  </p>
                  <p className="text-muted-foreground">
                    {language === 'ar' 
                      ? 'اذهب إلى إعدادات المشروع → Domains وأضف النطاق يدوياً، ثم اضغط "تأكيد التفعيل"'
                      : 'Go to Project Settings → Domains and add the domain manually, then click "Mark Active"'}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing}
            >
              {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <X className="h-4 w-4 mr-1" />
              {language === 'ar' ? 'رفض' : 'Reject'}
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing}
            >
              {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <Check className="h-4 w-4 mr-1" />
              {language === 'ar' ? 'موافقة' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}