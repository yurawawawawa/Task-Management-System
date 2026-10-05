import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({
  user: vi.fn(), activity: vi.fn(), daily: vi.fn(),
  taskCreate: vi.fn(), taskFirst: vi.fn(), taskUpdate: vi.fn(),
  habitCreate: vi.fn(), habitFirst: vi.fn(), completionFirst: vi.fn(), completionCreate: vi.fn(),
  projectFirst: vi.fn(), memberFirst: vi.fn(),
}));
vi.mock('@/app/lib/supabase/server', () => ({getAuthUser:mock.user}));
vi.mock('@/app/lib/admin/telemetry', () => ({recordActivity:mock.activity}));
vi.mock('@/app/lib/activity', () => ({recordDailyActivity:mock.daily}));
vi.mock('next/cache', () => ({revalidatePath:vi.fn()}));
vi.mock('@/prisma/db', () => ({db:{orm:{public:{
  Task:{create:mock.taskCreate,where:()=>({first:mock.taskFirst,update:mock.taskUpdate})},
  Habit:{create:mock.habitCreate,where:()=>({first:mock.habitFirst})},
  HabitCompletion:{create:mock.completionCreate,where:()=>({first:mock.completionFirst})},
  Project:{where:()=>({first:mock.projectFirst})},
  ProjectMember:{where:()=>({first:mock.memberFirst})},
}}}}));
import {createPersonalTask,updateTaskStatus,createHabit,toggleHabitCompletion} from './actions';
import {addTask,updateTaskStatus as updateProjectTaskStatus} from './projects/[id]/actions';

beforeEach(() => {
  vi.resetAllMocks();
  mock.user.mockResolvedValue({id:'user-id'});
  mock.taskCreate.mockResolvedValue({id:'task-id'});
  mock.habitCreate.mockResolvedValue({id:'habit-id'});
});

describe('activity integration preserves task and habit operations', () => {
  it('keeps the existing priority, description, due date and return value', async () => {
    const task = await createPersonalTask(' Work ', 'URGENT', 'Description', '2026-10-05');
    expect(mock.taskCreate).toHaveBeenCalledWith({userId:'user-id',title:'Work',description:'Description',status:'TODO',priority:'URGENT',dueDate:'2026-10-05T23:59:59.000Z'});
    expect(task).toEqual({id:'task-id'});
    expect(mock.activity).toHaveBeenCalledWith('user-id','TASK_CREATED','task','task-id');
  });
  it('does not create phantom activity for a failed mutation', async () => {
    mock.taskCreate.mockRejectedValue(new Error('write failed'));
    await expect(createPersonalTask('Work')).rejects.toThrow('write failed');
    expect(mock.activity).not.toHaveBeenCalled();
  });
  it('preserves validation and rejects anonymous creates', async () => {
    await expect(createPersonalTask('  ')).rejects.toThrow('Task title cannot be empty');
    mock.user.mockResolvedValue(null);
    await expect(createPersonalTask('Work')).rejects.toThrow('Unauthorized');
    expect(mock.taskCreate).not.toHaveBeenCalled();
  });
  it('records completion only on a real status transition and preserves productivity tracking', async () => {
    mock.taskFirst.mockResolvedValue({id:'task-id',status:'TODO'});
    await updateTaskStatus('task-id','DONE');
    expect(mock.taskUpdate).toHaveBeenCalledWith({status:'DONE'});
    expect(mock.activity).toHaveBeenCalledWith('user-id','TASK_COMPLETED','task','task-id');
    expect(mock.daily).toHaveBeenCalledWith('user-id',{type:'task',action:'increment'});
    mock.taskFirst.mockResolvedValue({id:'task-id',status:'DONE'});
    mock.activity.mockClear(); mock.daily.mockClear();
    await updateTaskStatus('task-id','DONE');
    expect(mock.activity).not.toHaveBeenCalled(); expect(mock.daily).not.toHaveBeenCalled();
  });
  it('preserves habit creation and does not double-record completion', async () => {
    await createHabit(' Read ','Belajar','WEEKLY');
    expect(mock.habitCreate).toHaveBeenCalledWith({userId:'user-id',title:'Read',category:'Belajar',frequency:'WEEKLY'});
    mock.activity.mockClear();
    mock.habitFirst.mockResolvedValue({id:'habit-id'});
    mock.completionFirst.mockResolvedValue({id:'completion-id'});
    await toggleHabitCompletion('habit-id','2026-10-05',true);
    expect(mock.completionCreate).not.toHaveBeenCalled(); expect(mock.activity).not.toHaveBeenCalled();
  });
  it('keeps collaborator assignment and default project task priority unchanged', async () => {
    mock.projectFirst.mockResolvedValue({id:'project-id',userId:'user-id'});
    await addTask('project-id','Task','collaborator-id');
    expect(mock.taskCreate).toHaveBeenCalledWith({userId:'user-id',projectId:'project-id',title:'Task',status:'TODO',priority:'MEDIUM',assigneeId:'collaborator-id'});
    expect(mock.activity).toHaveBeenCalledWith('user-id','TASK_CREATED','task','task-id');
  });
  it('rejects a project status mutation from someone who is neither owner nor member', async () => {
    mock.taskFirst.mockResolvedValue({id:'task-id',userId:'someone-else',projectId:'project-id',status:'TODO'});
    mock.memberFirst.mockResolvedValue(null);
    await expect(updateProjectTaskStatus('task-id','DONE')).rejects.toThrow('Unauthorized');
    expect(mock.taskUpdate).not.toHaveBeenCalled(); expect(mock.activity).not.toHaveBeenCalled();
  });
});
