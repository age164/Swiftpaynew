'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MoveHorizontal as MoreHorizontal, Pencil, Trash2, ExternalLink, Plus, CreditCard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/layout';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  billing_frequency: string;
  is_active: boolean;
  created_at: string;
}

export default function PlansPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [user]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('merchant_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId: string) => {
    try {
      const { error } = await supabase.from('plans').delete().eq('id', planId);

      if (error) throw error;

      toast.success('Plan deleted successfully');
      setPlans(plans.filter((p) => p.id !== planId));
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      toast.error(error.message || 'Failed to delete plan');
    }
  };

  const handleToggleActive = async (planId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ is_active: !currentStatus })
        .eq('id', planId);

      if (error) throw error;

      setPlans(
        plans.map((p) => (p.id === planId ? { ...p, is_active: !currentStatus } : p))
      );
      toast.success(`Plan ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      console.error('Error updating plan:', error);
      toast.error(error.message || 'Failed to update plan');
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
    });
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    };
    return labels[frequency] || frequency;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Plans</h1>
            <p className="text-gray-500 mt-1">Manage your subscription plans</p>
          </div>
          <Link href="/dashboard/plans/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {plans.length === 0 ? (
              <div className="text-center py-16">
                <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No plans yet</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Create your first subscription plan to start accepting recurring payments from customers.
                </p>
                <Link href="/dashboard/plans/new">
                  <Button>Create Your First Plan</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Billing</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{plan.name}</p>
                          <p className="text-sm text-gray-500 sm:hidden">
                            {formatCurrency(plan.amount)} / {getFrequencyLabel(plan.billing_frequency)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <p className="font-medium text-gray-900">{formatCurrency(plan.amount)}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getFrequencyLabel(plan.billing_frequency)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-gray-500">
                        {formatDate(plan.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={plan.is_active ? 'default' : 'secondary'}
                          className={plan.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                        >
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/plans/${plan.id}`} className="flex items-center gap-2">
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/checkout/${plan.id}`} className="flex items-center gap-2">
                                <ExternalLink className="h-4 w-4" />
                                View Checkout
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(plan.id, plan.is_active)}
                              className="flex items-center gap-2"
                            >
                              {plan.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <AlertDialog>
                                <AlertDialogTrigger className="w-full flex items-center gap-2 text-destructive focus:text-destructive px-2 py-1.5 text-sm rounded-sm hover:bg-destructive/10 focus:bg-destructive/10">
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{plan.name}"? This action cannot be undone.
                                      Any active subscribers on this plan will still continue their subscription.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(plan.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
