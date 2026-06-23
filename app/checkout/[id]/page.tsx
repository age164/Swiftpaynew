'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Loader as Loader2, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  billing_frequency: string;
  merchant_id: string;
  merchants: {
    business_name: string;
    email: string;
  } | null;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plans')
        .select(`
          *,
          merchants (business_name, email)
        `)
        .eq('id', planId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setPlan(data);
    } catch (error) {
      console.error('Error fetching plan:', error);
      toast.error('Plan not found or no longer available');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!plan) return;

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setProcessing(true);

    try {
      // Create subscriber
      const subscriberId = globalThis.crypto.randomUUID();
      const { error: subscriberError } = await supabase.from('subscribers').insert({
        id: subscriberId,
        plan_id: plan.id,
        merchant_id: plan.merchant_id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        status: 'active',
      });

      if (subscriberError) throw subscriberError;

      // Create payment record (simulated)
      const paymentRef = `PAY-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const { error: paymentError } = await supabase.from('payments').insert({
        subscriber_id: subscriberId,
        plan_id: plan.id,
        merchant_id: plan.merchant_id,
        amount: plan.amount,
        currency: plan.currency,
        status: 'successful',
        payment_reference: paymentRef,
      });

      if (paymentError) throw paymentError;

      // Redirect to success page
      router.push(`/checkout/${planId}/success?ref=${paymentRef}&name=${encodeURIComponent(formData.name)}`);
    } catch (error: any) {
      console.error('Error processing subscription:', error);
      toast.error(error.message || 'Failed to process subscription');
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      weekly: 'week',
      monthly: 'month',
      yearly: 'year',
    };
    return labels[frequency] || frequency;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Plan Not Found</h2>
            <p className="text-gray-500 mb-4">This subscription plan is no longer available.</p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">SwiftPay</span>
          </Link>
          <p className="text-gray-500">Secure checkout powered by SwiftPay</p>
        </div>

        <div className="grid gap-6">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="mt-1">
                    by {plan.merchants?.business_name || 'Unknown Merchant'}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {plan.billing_frequency}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {plan.description && (
                <p className="text-gray-600 mb-4">{plan.description}</p>
              )}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Subscription amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(plan.amount)}
                  <span className="text-lg font-normal text-gray-500">/{getFrequencyLabel(plan.billing_frequency)}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Form */}
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <CardDescription>
                  Enter your information to complete the subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" size="lg" disabled={processing}>
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Subscribe Now
                    </>
                  )}
                </Button>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span>Secure payment processing</span>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By subscribing, you agree to the terms of service.</p>
          <p className="mt-1">Powered by <Link href="/" className="text-primary hover:underline">SwiftPay</Link></p>
        </div>
      </div>
    </div>
  );
}
