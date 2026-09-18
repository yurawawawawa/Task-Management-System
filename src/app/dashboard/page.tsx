import { getAuthUser } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/prisma/db';

export default async function DashboardPage() {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect('/login');
  }

  const profile = await db.orm.public.Profile.where({ id: authUser.id }).first();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back, {profile?.name}!</p>
        
        <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
          <p>This is a protected page. You can only see this if you are logged in.</p>
        </div>
      </div>
    </div>
  );
}
