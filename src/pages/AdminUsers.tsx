import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Users, MoreVertical, Shield, ShieldOff, Phone, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role: 'admin' | 'client';
  whatsapp_number: string | null;
  country: string | null;
}

const COUNTRIES = [
  { code: 'EG', name: 'Egypt', nameAr: 'مصر' },
  { code: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية' },
  { code: 'AE', name: 'UAE', nameAr: 'الإمارات' },
  { code: 'KW', name: 'Kuwait', nameAr: 'الكويت' },
  { code: 'QA', name: 'Qatar', nameAr: 'قطر' },
  { code: 'BH', name: 'Bahrain', nameAr: 'البحرين' },
  { code: 'OM', name: 'Oman', nameAr: 'عمان' },
  { code: 'JO', name: 'Jordan', nameAr: 'الأردن' },
  { code: 'LB', name: 'Lebanon', nameAr: 'لبنان' },
  { code: 'IQ', name: 'Iraq', nameAr: 'العراق' },
  { code: 'SY', name: 'Syria', nameAr: 'سوريا' },
  { code: 'PS', name: 'Palestine', nameAr: 'فلسطين' },
  { code: 'YE', name: 'Yemen', nameAr: 'اليمن' },
  { code: 'LY', name: 'Libya', nameAr: 'ليبيا' },
  { code: 'TN', name: 'Tunisia', nameAr: 'تونس' },
  { code: 'DZ', name: 'Algeria', nameAr: 'الجزائر' },
  { code: 'MA', name: 'Morocco', nameAr: 'المغرب' },
  { code: 'SD', name: 'Sudan', nameAr: 'السودان' },
  { code: 'US', name: 'United States', nameAr: 'الولايات المتحدة' },
  { code: 'GB', name: 'United Kingdom', nameAr: 'المملكة المتحدة' },
  { code: 'DE', name: 'Germany', nameAr: 'ألمانيا' },
  { code: 'FR', name: 'France', nameAr: 'فرنسا' },
  { code: 'TR', name: 'Turkey', nameAr: 'تركيا' },
];

export default function AdminUsers() {
  const { user, isAdmin, loading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      setLoadingUsers(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
    
    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
    }

    const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
      const userRole = roles?.find(r => r.user_id === profile.id);
      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
        role: (userRole?.role as 'admin' | 'client') || 'client',
        whatsapp_number: profile.whatsapp_number,
        country: profile.country,
      };
    });

    setUsers(usersWithRoles);
    setLoadingUsers(false);
  };

  const openMakeAdminDialog = (u: UserWithRole) => {
    setSelectedUser(u);
    setWhatsappNumber(u.whatsapp_number || '');
    setSelectedCountry(u.country || '');
    setAdminDialogOpen(true);
  };

  const handleMakeAdmin = async () => {
    if (!selectedUser) return;
    
    if (!whatsappNumber.trim()) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'رقم الواتساب مطلوب' : 'WhatsApp number is required',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedCountry) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'الدولة مطلوبة' : 'Country is required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    // Update profile with WhatsApp and country
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        whatsapp_number: whatsappNumber.trim(),
        country: selectedCountry 
      })
      .eq('id', selectedUser.id);

    if (profileError) {
      toast({
        title: t('errorTitle'),
        description: profileError.message,
        variant: 'destructive',
      });
      setSaving(false);
      return;
    }

    // Update role to admin
    const { error: roleError } = await supabase
      .from('user_roles')
      .update({ role: 'admin' })
      .eq('user_id', selectedUser.id);
    
    if (roleError) {
      toast({
        title: t('errorTitle'),
        description: roleError.message,
        variant: 'destructive',
      });
    } else {
      fetchUsers();
      toast({
        title: language === 'ar' ? 'تم التعيين' : 'Admin Assigned',
        description: language === 'ar' ? 'تم تعيين المستخدم كأدمن بنجاح' : 'User has been assigned as admin',
      });
      setAdminDialogOpen(false);
    }

    setSaving(false);
  };

  const handleRemoveAdmin = async (userId: string) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: 'client' })
      .eq('user_id', userId);
    
    if (error) {
      toast({
        title: t('errorTitle'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      fetchUsers();
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم إزالة صلاحية الأدمن' : 'Admin role removed',
      });
    }
  };

  if (loading || loadingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('manageUsers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'ar' ? 'لا يوجد مستخدمين' : 'No users found'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('fullName')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{language === 'ar' ? 'الدور' : 'Role'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الدولة' : 'Country'}</TableHead>
                    <TableHead>{language === 'ar' ? 'واتساب' : 'WhatsApp'}</TableHead>
                    <TableHead>{t('createdAt')}</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const countryData = COUNTRIES.find(c => c.code === u.country);
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          {u.full_name || '-'}
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                            {u.role === 'admin' 
                              ? (language === 'ar' ? 'مدير' : 'Admin')
                              : (language === 'ar' ? 'عميل' : 'Client')
                            }
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {countryData ? (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3 text-muted-foreground" />
                              {language === 'ar' ? countryData.nameAr : countryData.name}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {u.whatsapp_number ? (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {u.whatsapp_number}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(u.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {u.role === 'admin' ? (
                                <DropdownMenuItem 
                                  onClick={() => handleRemoveAdmin(u.id)}
                                  disabled={u.id === user?.id}
                                >
                                  <ShieldOff className="h-4 w-4 mr-2" />
                                  {language === 'ar' ? 'إزالة صلاحية الأدمن' : 'Remove Admin'}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => openMakeAdminDialog(u)}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  {language === 'ar' ? 'تعيين كأدمن' : 'Make Admin'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Make Admin Dialog */}
      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'تعيين كأدمن' : 'Make Admin'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? `تعيين ${selectedUser?.full_name || selectedUser?.email} كأدمن. يرجى إدخال رقم الواتساب والدولة.`
                : `Assign ${selectedUser?.full_name || selectedUser?.email} as admin. Please enter WhatsApp number and country.`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">
                {language === 'ar' ? 'رقم الواتساب' : 'WhatsApp Number'}
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+201234567890"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                {language === 'ar' 
                  ? 'أدخل الرقم مع رمز الدولة (مثال: +201234567890)'
                  : 'Enter with country code (e.g., +201234567890)'
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                {language === 'ar' ? 'الدولة' : 'Country'}
              </Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر الدولة' : 'Select country'} />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {language === 'ar' ? country.nameAr : country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' 
                  ? 'الدولة التي سيكون هذا الأدمن مسؤولاً عنها'
                  : 'The country this admin will be responsible for'
                }
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminDialogOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleMakeAdmin} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {language === 'ar' ? 'تعيين كأدمن' : 'Make Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
