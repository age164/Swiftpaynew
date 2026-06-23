'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, CreditCard, TrendingUp, ArrowUpRight, ExternalLink, Plus } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/layout';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';

interface Plan {
  id: string;
  name: string;
  amount: number;
  billing_frequency: string;
}

interface Subscriber {
  id: string;
  name: string;
  email: string;
  plan_id: string;
  status: string;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  subscriber_id: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    subscriberCount: 0,
    activePlans: 0,
    monthlyGrowth: 0,
  });
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [plansRes, subscribersRes, paymentsRes] = await Promise.all([
        supabase.from('plans').select('*').eq('merchant_id', user!.id).eq('is_active', true),
        supabase.from('subscribers').select('*').eq('merchant_id', user!.id).eq('status', 'active'),
        supabase.from('payments').select('*').eq('merchant_id', user!.id).order('created_at', { ascending: false }).limit(5),
      ]);

      const plansData = plansRes.data || [];
      const subscribersData = subscribersRes.data || [];
      const paymentsData = paymentsRes.data || [];

      setPlans(plansData);
      setSubscribers(subscribersData);
      setRecentPayments(paymentsData);

      const totalRevenue = paymentsData
        .filter((p: Payment) => p.status === 'successful')
        .reduce((sum: number, p: Payment) => sum + p.amount, 0);

      setStats({
        totalRevenue,
        subscriberCount: subscribersData.length,
        activePlans: plansData.length,
        monthlyGrowth: 12.5,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here's your business overview.</p>
          </div>
          <Link href="/dashboard/plans/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">+{stats.monthlyGrowth}%</span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Subscribers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.subscriberCount}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">+8.2%</span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Plans</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activePlans}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <Link href="/dashboard/plans" className="text-sm text-primary hover:underline mt-3 inline-block">
                View all plans
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Growth Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.monthlyGrowth}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3">Revenue growth rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Payments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Your latest payment transactions</CardDescription>
                </div>
                <Link href="/dashboard/payments">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentPayments.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No payments yet</p>
                    <p className="text-sm text-gray-400 mt-1">Payments will appear here when you start receiving subscriptions</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-gray-500">{formatDate(payment.created_at)}</p>
                          </div>
                        </div>
                        <Badge
                          variant={payment.status === 'successful' ? 'default' : 'secondary'}
                          className={payment.status === 'successful' ? 'bg-green-100 text-green-700' : ''}
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Plans */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Active Plans</CardTitle>
                <CardDescription>Your subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                {plans.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No plans yet</p>
                    <Link href="/dashboard/plans/new">
                      <Button variant="outline" className="mt-3">
                        Create Plan
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plans.slice(0, 5).map((plan) => (
                      <div
                        key={plan.id}
                        className="p-4 rounded-lg border hover:bg-gray-50 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{plan.name}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatCurrency(plan.amount)} / {getFrequencyLabel(plan.billing_frequency)}
                            </p>
                          </div>
                          <Link href={`/checkout/${plan.id}`}>
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
