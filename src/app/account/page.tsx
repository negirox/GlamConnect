
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();

  useEffect(() => {
    // This is a simple redirect to the profile page.
    // In a real app, you might have a more complex logic
    // to determine where to redirect the user.
    router.replace('/account/profile');
  }, [router]);

  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
