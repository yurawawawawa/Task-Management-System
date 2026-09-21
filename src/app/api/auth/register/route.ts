import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { registerSchema } from '@/app/lib/validations/auth';
import { db } from '@/prisma/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Validation
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.issues }, { status: 400 });
    }
    const { email, password, name } = result.data;

    // 2. Create user in Supabase Auth
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // 3. Create Profile in our Prisma database
    // Because Supabase might return the user before email verification (depending on settings),
    // we create the profile immediately using the auth.users.id
    try {
      const profile = await db.orm.public.Profile.create({
        id: authData.user.id,
        email: authData.user.email!,
        name: name,
      });

      return NextResponse.json(
        { message: 'User registered successfully', user: profile },
        { status: 201 }
      );
    } catch (dbError: any) {
      // If DB creation fails (e.g., unique constraint on email if somehow out of sync)
      console.error('Failed to create profile:', dbError);
      // In a real production app, we might want to clean up the Supabase auth user here 
      // or rely on a Supabase database trigger to create the profile.
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
