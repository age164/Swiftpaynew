'use client';

import { useSonner as useSonnerOriginal, Toaster as OriginalToaster } from 'sonner';

export { toast } from 'sonner';

export function Toaster() {
  return (
    <OriginalToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
      }}
    />
  );
}
