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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const filters: any = { userId: user.id };
    
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (projectId) filters.projectId = projectId;

    const tasks = await db.orm.public.Task
      .where(filters)
      .orderBy(t => t.createdAt.desc())
      .limit(limit)
      .offset((page - 1) * limit)
      .all();

    const { totalItems } = await db.orm.public.Task
      .where(filters)
      .aggregate((a) => ({ totalItems: a.count() }));
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: tasks
    });
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
      return NextResponse.json({ error: 'Validation failed', details: result.error.issues }, { status: 400 });
    }

    const { title, description, projectId, status, priority, dueDate } = result.data;


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
