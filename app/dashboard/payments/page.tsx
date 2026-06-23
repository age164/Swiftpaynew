'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_reference: string | null;
  created_at: string;
  subscriber_id: string;
  plans: { name: string } | null;
  subscribers: { name: string; email: string } | null;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          plans (name),
          subscribers (name, email)
        `)
        .eq('merchant_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      successful: 'bg-green-100 text-green-700 hover:bg-green-200',
      pending: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      failed: 'bg-red-100 text-red-700 hover:bg-red-200',
    };
    return colors[status] || '';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">View your payment history</p>
        </div>

        <Card>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="text-center py-16">
                <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  When payments are processed, they will appear here.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden sm:table-cell">Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Plan</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-gray-500 sm:hidden mt-1">
                          {payment.subscribers?.name || 'Unknown'}
                        </p>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.subscribers?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">{payment.subscribers?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {payment.plans?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-gray-500">
                        {formatDate(payment.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
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
