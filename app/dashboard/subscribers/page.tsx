'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

interface Subscriber {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
  plans: { name: string } | null;
}

export default function SubscribersPage() {
  const { user } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscribers();
    }
  }, [user]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select(`
          *,
          plans (name)
        `)
        .eq('merchant_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700 hover:bg-green-200',
      paused: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      cancelled: 'bg-red-100 text-red-700 hover:bg-red-200',
    };
    return colors[status] || '';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Subscribers</h1>
          <p className="text-gray-500 mt-1">Manage your subscription customers</p>
        </div>

        <Card>
          <CardContent className="p-0">
            {subscribers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscribers yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  When customers subscribe to your plans, they will appear here.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Plan</TableHead>
                    <TableHead className="hidden md:table-cell">Subscribed</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{subscriber.name}</p>
                          <p className="text-sm text-gray-500">{subscriber.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {subscriber.plans?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-gray-500">
                        {formatDate(subscriber.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(subscriber.status)}>
                          {subscriber.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
