'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader as Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/layout';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

export default function EditPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    billing_frequency: 'monthly',
  });

  useEffect(() => {
    if (user && planId) {
      fetchPlan();
    }
  }, [user, planId]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .eq('merchant_id', user!.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name,
          description: data.description || '',
          amount: data.amount.toString(),
          billing_frequency: data.billing_frequency,
        });
      } else {
        toast.error('Plan not found');
        router.push('/dashboard/plans');
      }
    } catch (error: any) {
      console.error('Error fetching plan:', error);
      toast.error(error.message || 'Failed to load plan');
      router.push('/dashboard/plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Plan name is required');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('plans')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim(),
          amount: parseFloat(formData.amount),
          billing_frequency: formData.billing_frequency,
        })
        .eq('id', planId);

      if (error) throw error;

      toast.success('Plan updated successfully!');
      router.push('/dashboard/plans');
    } catch (error: any) {
      console.error('Error updating plan:', error);
      toast.error(error.message || 'Failed to update plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard/plans"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Plans
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Plan</h1>
          <p className="text-gray-500 mt-1">Update your subscription plan details.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
              <CardDescription>
                Update your subscription plan settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Pro Plan, Basic Package"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what's included in this plan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (NGN)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="5000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing_frequency">Billing Frequency</Label>
                  <Select
                    value={formData.billing_frequency}
                    onValueChange={(value) => setFormData({ ...formData, billing_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => router.push('/dashboard/plans')}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
