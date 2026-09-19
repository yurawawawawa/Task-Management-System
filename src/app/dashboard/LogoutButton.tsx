'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-gray-400 hover:text-black transition-colors p-2.5 md:p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px]"
      title="Sign out"
      aria-label="Sign out"
    >
      <LogOut className="w-5 h-5" />
    </button>
  );
}
