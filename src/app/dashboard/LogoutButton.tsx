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
      className="text-gray-400 hover:text-black transition-colors p-1.5 rounded-md hover:bg-gray-100"
      title="Sign out"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
