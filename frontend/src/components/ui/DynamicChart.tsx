'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from './Skeletons';
import { cn } from '@/lib/utils';

// This wrapper ensures that any chart is only rendered on the client side
// and allows for a smooth loading state while the heavy Recharts library is initialized.

export const DynamicChart = dynamic(
  () => import('./DynamicChartContent'),
  { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-full min-h-[300px] rounded-2xl" />
  }
);
