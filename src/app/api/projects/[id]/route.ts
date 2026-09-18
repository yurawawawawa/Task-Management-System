import { NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { updateProjectSchema } from '@/app/lib/validations/project';

// Helper function untuk memverifikasi ownership project
async function getProjectIfOwner(projectId: string, userId: string) {
  const project = await db.orm.public.Project.where({ id: projectId }).first();
  if (!project) return null;
  if (project.userId !== userId) return false; // Forbidden
  return project;
}

// GET: Ambil detail satu project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const project = await getProjectIfOwner(id, user.id);
    
    if (project === null) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (project === false) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error('Fetch project detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update project
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const project = await getProjectIfOwner(id, user.id);
    if (project === null) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    if (project === false) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const result = updateProjectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.errors }, { status: 400 });
    }

    // Hanya ambil field yang ada isinya (defined)
    const updateData: any = {};
    if (result.data.name !== undefined) updateData.name = result.data.name;
    if (result.data.description !== undefined) updateData.description = result.data.description;

    const updatedProject = await db.orm.public.Project.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error: any) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Hapus project (Otomatis menghapus tasks di dalamnya karena Cascade setup di Prisma)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const project = await getProjectIfOwner(id, user.id);
    if (project === null) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    if (project === false) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await db.orm.public.Project.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Project and all associated tasks deleted successfully' });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
