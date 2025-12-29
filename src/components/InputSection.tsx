import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, MapPin, Zap, Plus, Trash2, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { PaymentMethod, PaymentMethodType } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InputSectionProps {
  onGenerate: (input: string, paymentMethods: PaymentMethod[]) => void;
  isLoading: boolean;
}

const DEMO_URL = 'https://www.google.com/maps/place/Ramses+Hilton/@29.9958183,31.1568785,12z/data=!4m13!1m2!2m1!1shilton+!3m9!1s0x145840c381a29537:0xf1d5b3a64a0e4de1!5m2!4m1!1i2!8m2!3d30.050365!4d31.2320411!15sCgZoaWx0b24iA4gBAVoIIgZoaWx0b26SAQVob3RlbOABAA!16s%2Fg%2F1tf3kxjk?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D';

// Default demo payment methods
const DEMO_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'demo-1',
    methodName: 'InstaPay',
    accountOwner: 'أبوبكر عبد الله مبشر',
    accountNumber: '01104459265',
    paymentLink: 'https://ipn.eg/S/abubaker1989/instapay/6SWBCl',
  },
  {
    id: 'demo-2',
    methodName: 'Vodafone Cash',
    accountOwner: 'محمد محمد محمد',
    accountNumber: '01012345678',
    paymentLink: '',
  },
];

const createEmptyPayment = (): PaymentMethod => ({
  id: crypto.randomUUID(),
  methodName: '',
  accountOwner: '',
  accountNumber: '',
  paymentLink: '',
});

export function InputSection({ onGenerate, isLoading }: InputSectionProps) {
  const { t, dir, language } = useLanguage();
  const [input, setInput] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([createEmptyPayment()]);
  const [showPayments, setShowPayments] = useState(false);
  const [paymentTypes, setPaymentTypes] = useState<PaymentMethodType[]>([]);

  // Fetch payment method types from database
  useEffect(() => {
    const fetchPaymentTypes = async () => {
      const { data } = await supabase
        .from('payment_method_types')
        .select('*')
        .order('name');
      
      if (data) {
        setPaymentTypes(data);
      }
    };
    fetchPaymentTypes();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const validPayments = paymentMethods.filter(
        p => p.methodName.trim() || p.accountNumber.trim() || p.paymentLink.trim()
      );
      onGenerate(input.trim(), validPayments);
    }
  };

  const handleTryDemoWithPayment = () => {
    setInput(DEMO_URL);
    onGenerate(DEMO_URL, DEMO_PAYMENT_METHODS);
  };

  const handleTryDemoWithoutPayment = () => {
    setInput(DEMO_URL);
    onGenerate(DEMO_URL, []);
  };

  const handlePaymentTypeSelect = (paymentId: string, typeId: string) => {
    const selectedType = paymentTypes.find(t => t.id === typeId);
    if (selectedType) {
      setPaymentMethods(prev => 
        prev.map(p => p.id === paymentId 
          ? { ...p, methodTypeId: typeId, methodName: selectedType.name } 
          : p
        )
      );
    }
  };

  const updatePayment = (id: string, field: keyof PaymentMethod, value: string) => {
    setPaymentMethods(prev => 
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
  };

  const addPaymentMethod = () => {
    setPaymentMethods(prev => [...prev, createEmptyPayment()]);
  };

  const removePaymentMethod = (id: string) => {
    if (paymentMethods.length > 1) {
      setPaymentMethods(prev => prev.filter(p => p.id !== id));
    }
  };

  const getPaymentTypeName = (type: PaymentMethodType) => {
    return language === 'ar' ? type.name_ar : type.name;
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-4">
      <div className="bg-card rounded-2xl shadow-card-lg p-6 md:p-8 border border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl gradient-primary">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {t('inputTitle')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${dir === 'rtl' ? 'right-4' : 'left-4'}`} />
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('inputPlaceholder')}
              className={`h-14 text-base bg-background border-2 border-border focus:border-primary ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
              dir={dir}
            />
          </div>

          {/* Payment Methods Section - Collapsible */}
          <div className="border border-border/50 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPayments(!showPayments)}
              className="w-full flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{t('paymentMethods')}</span>
              </div>
              {showPayments ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {showPayments && (
              <div className="p-4 space-y-4 bg-background">
                {paymentMethods.map((payment, index) => (
                  <div key={payment.id} className="space-y-3 p-4 border border-border/30 rounded-lg bg-secondary/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        {dir === 'rtl' ? `وسيلة الدفع ${index + 1}` : `Payment Method ${index + 1}`}
                      </span>
                      {paymentMethods.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePaymentMethod(payment.id)}
                          className="text-destructive hover:text-destructive/80 h-8 px-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="ml-1">{t('removePayment')}</span>
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Payment Method Type Dropdown */}
                      <Select
                        value={payment.methodTypeId || ''}
                        onValueChange={(value) => handlePaymentTypeSelect(payment.id, value)}
                      >
                        <SelectTrigger className="h-11 bg-background">
                          <SelectValue placeholder={t('selectPaymentMethod')} />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border z-50">
                          {paymentTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id} className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                <img 
                                  src={type.icon_url} 
                                  alt={type.name} 
                                  className="w-5 h-5 object-contain"
                                />
                                <span>{getPaymentTypeName(type)}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="text"
                        value={payment.accountOwner}
                        onChange={(e) => updatePayment(payment.id, 'accountOwner', e.target.value)}
                        placeholder={t('accountOwnerPlaceholder')}
                        className="h-11 bg-background"
                        dir={dir}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        type="text"
                        value={payment.accountNumber}
                        onChange={(e) => updatePayment(payment.id, 'accountNumber', e.target.value)}
                        placeholder={t('accountNumberPlaceholder')}
                        className="h-11 bg-background"
                        dir="ltr"
                      />
                      <Input
                        type="url"
                        value={payment.paymentLink}
                        onChange={(e) => updatePayment(payment.id, 'paymentLink', e.target.value)}
                        placeholder={t('paymentLinkPlaceholder')}
                        className="h-11 bg-background"
                        dir="ltr"
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addPaymentMethod}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('addAnotherPayment')}
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="flex-1"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>{t('generating')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>{t('generateButton')}</span>
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleTryDemoWithPayment}
                disabled={isLoading}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Zap className="h-5 w-5" />
                <span className="text-sm">{t('tryDemoWithPayment')}</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={handleTryDemoWithoutPayment}
                disabled={isLoading}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Zap className="h-5 w-5" />
                <span className="text-sm">{t('tryDemoWithoutPayment')}</span>
              </Button>
            </div>
          </div>
        </form>

        <p className="mt-4 text-sm text-muted-foreground text-center">
          {t('demoDescription')}
        </p>
      </div>
    </section>
  );
}
