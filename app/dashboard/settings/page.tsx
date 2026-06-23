'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader as Loader2, Settings as SettingsIcon } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { merchant, refreshMerchant } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: merchant?.business_name || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('merchants')
        .update({ business_name: formData.businessName.trim() })
        .eq('id', merchant!.id);

      if (error) throw error;

      await refreshMerchant();
      toast.success('Settings updated successfully');
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account settings</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your business details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={merchant?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>

        {/* Coming Soon Features */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Integration</CardTitle>
            <CardDescription>
              Configure your payment gateway (Nomba integration coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <SettingsIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Payment gateway integration coming soon</p>
              <p className="text-sm text-gray-400 mt-1">
                You'll be able to connect your Nomba account here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
