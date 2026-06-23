'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function NewPlanPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    billing_frequency: 'monthly',
  });

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

    setLoading(true);

    try {
      const { error } = await supabase.from('plans').insert({
        merchant_id: user!.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        billing_frequency: formData.billing_frequency,
      });

      if (error) throw error;

      toast.success('Plan created successfully!');
      router.push('/dashboard/plans');
    } catch (error: any) {
      console.error('Error creating plan:', error);
      toast.error(error.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Plan</h1>
          <p className="text-gray-500 mt-1">Set up a new subscription plan for your customers.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
              <CardDescription>
                Configure your subscription plan settings
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
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Plan
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
