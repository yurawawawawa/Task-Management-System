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

    // Check if user already exists in Prisma database
    const existingProfile = await db.orm.public.Profile
      .where({ email })
      .first();

    if (existingProfile) {
      return NextResponse.json(
        {
          error: 'Akun dengan email ini sudah terdaftar',
          code: 'USER_ALREADY_EXISTS',
          email,
        },
        { status: 409 }
      );
    }

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
      const isAlreadyRegistered =
        authError.message.toLowerCase().includes('already registered') ||
        authError.message.toLowerCase().includes('already exists') ||
        authError.status === 422;

      if (isAlreadyRegistered) {
        return NextResponse.json(
          {
            error: 'Akun dengan email ini sudah terdaftar',
            code: 'USER_ALREADY_EXISTS',
            email,
          },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // In Supabase, when email enumeration protection is enabled,
    // signUp for an existing user returns a dummy user with empty identities array
    if (authData.user.identities && authData.user.identities.length === 0) {
      return NextResponse.json(
        {
          error: 'Akun dengan email ini sudah terdaftar',
          code: 'USER_ALREADY_EXISTS',
          email,
        },
        { status: 409 }
      );
    }

    // 3. Create Profile in our Prisma database
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
      console.error('Failed to create profile:', dbError);
      
      // If unique constraint violation on email
      const isUniqueError =
        dbError?.message?.includes('unique') ||
        dbError?.code === 'P2002' ||
        dbError?.message?.includes('duplicate key');

      if (isUniqueError) {
        return NextResponse.json(
          {
            error: 'Akun dengan email ini sudah terdaftar',
            code: 'USER_ALREADY_EXISTS',
            email,
          },
          { status: 409 }
        );
      }

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
