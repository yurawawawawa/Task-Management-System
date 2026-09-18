import { NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { updateTaskSchema } from '@/app/lib/validations/task';

async function getTaskIfOwner(taskId: string, userId: string) {
  const task = await db.orm.public.Task.where({ id: taskId }).first();
  if (!task) return null;
  if (task.userId !== userId) return false;
  return task;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const task = await getTaskIfOwner(id, user.id);
    if (task === null) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    if (task === false) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error('Fetch task detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const task = await getTaskIfOwner(id, user.id);
    if (task === null) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    if (task === false) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const result = updateTaskSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.errors }, { status: 400 });
    }

    const { projectId } = result.data;

    // Jika memindahkan task ke project lain, pastikan user memiliki project tersebut
    if (projectId && projectId !== task.projectId) {
      const project = await db.orm.public.Project.where({ id: projectId }).first();
      if (!project) return NextResponse.json({ error: 'Assigned project not found' }, { status: 404 });
      if (project.userId !== user.id) return NextResponse.json({ error: 'Cannot assign task to a project you do not own' }, { status: 403 });
    }

    const updateData: any = {};
    for (const [key, value] of Object.entries(result.data)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    const updatedTask = await db.orm.public.Task.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error: any) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const task = await getTaskIfOwner(id, user.id);
    if (task === null) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    if (task === false) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await db.orm.public.Task.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
