'use client';

import { useRouter } from 'next/navigation';

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
      className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
    >
      Log Out
    </button>
  );
}
