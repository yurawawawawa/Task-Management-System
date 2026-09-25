import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { loginSchema } from '@/app/lib/validations/auth';
import { db } from '@/prisma/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Validation
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.issues }, { status: 400 });
    }
    const { email, password } = result.data;

    // 2. Authenticate with Supabase
    // This will automatically set the session cookie using our server client
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 3. Fetch user profile from database, or auto-create if missing
    let profile = await db.orm.public.Profile
      .where({ id: authData.user.id })
      .first();

    if (!profile) {
      try {
        profile = await db.orm.public.Profile.create({
          id: authData.user.id,
          email: authData.user.email!,
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User',
        });
      } catch (e) {
        console.error('Failed to auto-create missing profile during login:', e);
      }
    }

    return NextResponse.json({ 
      message: 'Logged in successfully',
      user: profile 
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
