import { NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { createTaskSchema } from '@/app/lib/validations/task';

// GET: Ambil semua task milik user yang sedang login (bisa difilter via Query Params)
export async function GET(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    const priority = searchParams.get('priority') as any;
    const projectId = searchParams.get('projectId');

    const filters: any = { userId: user.id };
    
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (projectId) filters.projectId = projectId;

    const tasks = await db.orm.public.Task
      .where(filters)
      .orderBy({ createdAt: 'desc' })
      .all();

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error('Fetch tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Buat task baru
export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const result = createTaskSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.errors }, { status: 400 });
    }

    const { title, description, projectId, status, priority, dueDate } = result.data;

    // Jika di-assign ke sebuah project, pastikan project tersebut milik user ini!
    if (projectId) {
      const project = await db.orm.public.Project.where({ id: projectId }).first();
      if (!project) return NextResponse.json({ error: 'Assigned project not found' }, { status: 404 });
      if (project.userId !== user.id) return NextResponse.json({ error: 'Cannot assign task to a project you do not own' }, { status: 403 });
    }

    const task = await db.orm.public.Task.create({
      userId: user.id,
      projectId: projectId || null,
      title,
      description,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate || null,
    });

    return NextResponse.json(
      { message: 'Task created successfully', task },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
