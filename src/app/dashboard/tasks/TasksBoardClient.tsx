'use client';

import { useState } from 'react';
import {
  Kanban,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Flame,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';
import { createPersonalTask, updateTaskStatus, deleteTask } from '../actions';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
}

interface TasksBoardClientProps {
  initialTasks: Task[];
}

export default function TasksBoardClient({ initialTasks }: TasksBoardClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [targetColumn, setTargetColumn] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [isAdding, setIsAdding] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesQuery && matchesPriority;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = filteredTasks.filter((t) => t.status === 'DONE');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await createPersonalTask(newTitle, newPriority);
      if (created) {
        setTasks((prev) => [created as any, ...prev]);
        setNewTitle('');
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Failed to add task', err);
    }
  };

  const handleMoveStatus = async (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error('Failed to move task', err);
    }
  };

  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await deleteTask(taskId);
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const renderTaskCard = (task: Task) => {
    const priorityColor = {
      LOW: 'bg-gray-100 text-gray-700 border-gray-200',
      MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
      HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
      URGENT: 'bg-red-50 text-red-700 border-red-200',
    }[task.priority || 'MEDIUM'];

    return (
      <div
        key={task.id}
        className="bg-white p-4 rounded-2xl border-2 border-border shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all space-y-3 group"
      >
        <div className="flex items-start justify-between gap-2">
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${priorityColor}`}>
            {task.priority || 'MED'}
          </span>
          <button
            type="button"
            onClick={() => handleDelete(task.id)}
            className="text-muted-foreground/60 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
            title="Hapus task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <p className={`text-sm font-extrabold tracking-tight ${task.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.title}
        </p>

        {/* Column Shifting Controls */}
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          {task.status !== 'TODO' && (
            <button
              type="button"
              onClick={() => handleMoveStatus(task.id, task.status === 'DONE' ? 'IN_PROGRESS' : 'TODO')}
              className="inline-flex items-center gap-1 font-bold hover:text-foreground transition-colors"
              title="Kembalikan ke status sebelumnya"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Mundur</span>
            </button>
          )}

          {task.status === 'TODO' && <div />}

          {task.status !== 'DONE' ? (
            <button
              type="button"
              onClick={() => handleMoveStatus(task.id, task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
              className="inline-flex items-center gap-1 font-black text-primary hover:text-primary-hover ml-auto transition-colors"
            >
              <span>{task.status === 'TODO' ? 'Mulai Kerja' : 'Selesaikan'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 ml-auto">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Selesai</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20 mb-3">
              <Kanban className="w-3.5 h-3.5" />
              <span>Papan Kanban Personal</span>
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Tasks & Board
            </h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-xl">
              Alur manajemen tugas individual sederhana. Susun alur kerjamu dari Todo, In Progress, hingga Done.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs hover:bg-primary-hover transition-all shadow-xs active:scale-95 self-start md:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Task Baru</span>
          </button>
        </div>

        {/* Add Task Modal / Form Drawer */}
        {isAdding && (
          <form
            onSubmit={handleCreate}
            className="mt-6 p-4 rounded-2xl bg-muted/40 border-2 border-border space-y-3 animate-in fade-in duration-200"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Judul task baru..."
                className="flex-1 px-4 py-2.5 bg-white border-2 border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                autoFocus
              />
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="px-3 py-2.5 bg-white border-2 border-border rounded-xl text-xs font-black focus:outline-none focus:border-primary"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-4 py-2 rounded-xl text-xs font-black bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
              >
                Simpan Task
              </button>
            </div>
          </form>
        )}

        {/* Filter and Search Bar */}
        <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari task..."
              className="w-full pl-9 pr-4 py-2 bg-muted/40 border-2 border-border rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-bold">
            <span className="text-muted-foreground mr-1 text-[11px]">Prioritas:</span>
            {['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                  priorityFilter === p
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: TODO */}
        <div className="bg-muted/30 p-5 rounded-3xl border-2 border-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <h3 className="font-black text-sm text-foreground uppercase tracking-wider">
                To Do
              </h3>
            </div>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white border border-border">
              {todoTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {todoTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-12">
                Tidak ada task di antrean To Do
              </p>
            ) : (
              todoTasks.map(renderTaskCard)
            )}
          </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div className="bg-blue-50/40 p-5 rounded-3xl border-2 border-blue-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <h3 className="font-black text-sm text-blue-900 uppercase tracking-wider">
                In Progress
              </h3>
            </div>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white border border-blue-200 text-blue-900">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {inProgressTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-12">
                Belum ada task yang sedang dikerjakan
              </p>
            ) : (
              inProgressTasks.map(renderTaskCard)
            )}
          </div>
        </div>

        {/* Column 3: DONE */}
        <div className="bg-emerald-50/40 p-5 rounded-3xl border-2 border-emerald-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-600" />
              <h3 className="font-black text-sm text-emerald-900 uppercase tracking-wider">
                Done
              </h3>
            </div>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-900">
              {doneTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {doneTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-12">
                Selesaikan task untuk mencatat progres di sini
              </p>
            ) : (
              doneTasks.map(renderTaskCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
