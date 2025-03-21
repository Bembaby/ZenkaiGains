'use client';

import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';
import { useAuthRedirect } from '@/hooks/auth';

export default function MeasurementsPage() {
  // This hook checks authentication status.
  // If not logged in, it will redirect to '/login'.
  const { isAuthLoading } = useAuthRedirect({
    redirectTo: '/login',
    protectedRoute: true,
  });

  const router = useRouter();

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Measurements</h1>
      <p className="mb-6">
        Track your body measurements and monitor your progress over time.
      </p>
      {/* Add your measurement forms or components here */}
      <div>
        {/* Example placeholder content */}
        <p>Your measurements will be displayed here.</p>
      </div>
    </div>
  );
}
