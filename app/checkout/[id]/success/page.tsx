'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, CreditCard } from 'lucide-react';

export default function SuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const planId = params.id as string;
  const paymentRef = searchParams.get('ref');
  const customerName = searchParams.get('name');

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-4">
              Thank you, {customerName || 'valued customer'}! Your subscription has been activated.
            </p>

            {paymentRef && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-sm text-gray-500 mb-1">Payment Reference</p>
                <p className="font-mono text-sm font-medium text-gray-900 break-all">
                  {paymentRef}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-800">
            A confirmation email has been sent to your email address. You will receive notifications before each billing cycle.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button className="w-full" variant="default">
              Done
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <Link href="/" className="text-primary hover:underline font-medium flex items-center justify-center gap-1 mt-1">
              <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
                <CreditCard className="h-3 w-3 text-white" />
              </div>
              SwiftPay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
