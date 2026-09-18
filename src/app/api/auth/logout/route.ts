import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Clear session cookies
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
