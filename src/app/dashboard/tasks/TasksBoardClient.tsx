'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  GripVertical
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

interface TaskCardViewProps {
  task: Task;
  isDragging?: boolean;
  isOverlay?: boolean;
  onDelete?: (id: string) => void;
  onMoveStatus?: (id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => void;
  dragHandleProps?: Record<string, any>;
}

function TaskCardView({
  task,
  isDragging = false,
  isOverlay = false,
  onDelete,
  onMoveStatus,
  dragHandleProps,
}: TaskCardViewProps) {
  const priorityColor = {
    LOW: 'bg-gray-100 text-gray-700 border-gray-200',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
    URGENT: 'bg-red-50 text-red-700 border-red-200',
  }[task.priority || 'MEDIUM'];

  if (isDragging) {
    return (
      <div className="bg-primary/5 rounded-2xl border-2 border-dashed border-primary/40 h-[105px] opacity-40 shadow-inner" />
    );
  }

  return (
    <div
      className={`bg-white p-4 rounded-2xl border-2 transition-all space-y-3 group select-none ${
        isOverlay
          ? 'border-primary ring-2 ring-primary/40 shadow-2xl rotate-1 scale-105 cursor-grabbing'
          : 'border-border shadow-2xs hover:border-primary/50 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-1 -m-1 rounded-md text-muted-foreground/40 group-hover:text-muted-foreground hover:bg-muted transition-colors"
            title="Tahan dan geser (atau gunakan Spasi/Enter untuk navigasi keyboard)"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${priorityColor}`}>
            {task.priority || 'MED'}
          </span>
        </div>

        {onDelete && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="text-muted-foreground/60 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded-md"
            title="Hapus task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className={`text-sm font-extrabold tracking-tight ${task.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {task.title}
      </p>

      {/* Manual Status Buttons as Accessible Fallback */}
      {onMoveStatus && (
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          {task.status !== 'TODO' && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onMoveStatus(task.id, task.status === 'DONE' ? 'IN_PROGRESS' : 'TODO');
              }}
              className="inline-flex items-center gap-1 font-bold hover:text-foreground transition-colors px-1 py-0.5 rounded"
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
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onMoveStatus(task.id, task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE');
              }}
              className="inline-flex items-center gap-1 font-black text-primary hover:text-primary-hover ml-auto transition-colors px-1 py-0.5 rounded"
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
      )}
    </div>
  );
}

function SortableTaskCard({
  task,
  onDelete,
  onMoveStatus,
}: {
  task: Task;
  onDelete: (id: string) => void;
  onMoveStatus: (id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-2xl"
    >
      <TaskCardView
        task={task}
        isDragging={isDragging}
        onDelete={onDelete}
        onMoveStatus={onMoveStatus}
      />
    </div>
  );
}

interface KanbanColumnProps {
  id: 'TODO' | 'IN_PROGRESS' | 'DONE';
  title: string;
  tasks: Task[];
  isHighlighted: boolean;
  onDelete: (id: string) => void;
  onMoveStatus: (id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => void;
}

function KanbanColumn({
  id,
  title,
  tasks,
  isHighlighted,
  onDelete,
  onMoveStatus,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'Column',
      columnId: id,
    },
  });

  const columnConfig = {
    TODO: {
      dot: 'bg-gray-400',
      titleColor: 'text-foreground',
      countBorder: 'border-border text-foreground',
      defaultBorder: 'border-border',
      defaultBg: 'bg-muted/30',
      activeBorder: 'border-primary ring-2 ring-primary/20 bg-primary/5',
      emptyText: 'Tidak ada task di antrean To Do',
      dropPrompt: 'Lepaskan task di To Do',
    },
    IN_PROGRESS: {
      dot: 'bg-blue-500 animate-pulse',
      titleColor: 'text-blue-900',
      countBorder: 'border-blue-200 text-blue-900',
      defaultBorder: 'border-blue-200/80',
      defaultBg: 'bg-blue-50/40',
      activeBorder: 'border-blue-500 ring-2 ring-blue-300/40 bg-blue-100/50',
      emptyText: 'Belum ada task yang sedang dikerjakan',
      dropPrompt: 'Lepaskan task di In Progress',
    },
    DONE: {
      dot: 'bg-emerald-600',
      titleColor: 'text-emerald-900',
      countBorder: 'border-emerald-200 text-emerald-900',
      defaultBorder: 'border-emerald-200/80',
      defaultBg: 'bg-emerald-50/40',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-300/40 bg-emerald-100/50',
      emptyText: 'Selesaikan task untuk mencatat progres di sini',
      dropPrompt: 'Lepaskan task di Done',
    },
  }[id];

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <div
      ref={setNodeRef}
      className={`p-5 rounded-3xl border-2 transition-all space-y-4 flex flex-col min-h-[460px] ${
        isHighlighted
          ? columnConfig.activeBorder
          : `${columnConfig.defaultBorder} ${columnConfig.defaultBg}`
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/80">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${columnConfig.dot}`} />
          <h3 className={`font-black text-sm uppercase tracking-wider ${columnConfig.titleColor}`}>
            {title}
          </h3>
        </div>
        <span className={`text-xs font-black px-2 py-0.5 rounded-full bg-white border ${columnConfig.countBorder}`}>
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <div className="space-y-3 flex-1 flex flex-col">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className={`flex-1 flex items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all text-xs text-center ${
              isHighlighted
                ? 'border-primary bg-primary/10 text-primary font-black animate-pulse'
                : 'border-border/60 text-muted-foreground'
            }`}>
              {isHighlighted ? columnConfig.dropPrompt : columnConfig.emptyText}
            </div>
          ) : (
            <>
              {tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onDelete={onDelete}
                  onMoveStatus={onMoveStatus}
                />
              ))}

              {isHighlighted && (
                <div className="border-2 border-dashed border-primary bg-primary/10 text-primary rounded-2xl p-4 flex items-center justify-center text-xs font-black animate-pulse mt-auto">
                  {columnConfig.dropPrompt}
                </div>
              )}
            </>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export default function TasksBoardClient({ initialTasks }: TasksBoardClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [hoveredColumnId, setHoveredColumnId] = useState<'TODO' | 'IN_PROGRESS' | 'DONE' | null>(null);
  const [mounted, setMounted] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px threshold to separate clicks from drag operations
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      return matchesQuery && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  const todoTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'TODO'), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'IN_PROGRESS'), [filteredTasks]);
  const doneTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'DONE'), [filteredTasks]);

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setHoveredColumnId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Detect target column
    let targetColumn: 'TODO' | 'IN_PROGRESS' | 'DONE' | null = null;
    if (overId === 'TODO' || overId === 'IN_PROGRESS' || overId === 'DONE') {
      targetColumn = overId;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask && overTask.status !== 'CANCELLED') {
        targetColumn = overTask.status;
      }
    }

    setHoveredColumnId(targetColumn);

    if (!targetColumn) return;

    const currentActiveTask = tasks.find((t) => t.id === activeId);
    if (!currentActiveTask) return;

    // Move task across columns dynamically during drag for live feedback
    if (currentActiveTask.status !== targetColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        if (activeIndex === -1) return prev;

        const overIndex = prev.findIndex((t) => t.id === overId);
        const newIndex = overIndex >= 0 ? overIndex : prev.length;

        const updated = [...prev];
        const [moved] = updated.splice(activeIndex, 1);
        const movedWithNewStatus: Task = { ...moved, status: targetColumn };
        updated.splice(newIndex, 0, movedWithNewStatus);
        return updated;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const original = activeTask;
    setActiveTask(null);
    setHoveredColumnId(null);

    if (!over || !original) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let destinationColumn: 'TODO' | 'IN_PROGRESS' | 'DONE' | null = null;
    if (overId === 'TODO' || overId === 'IN_PROGRESS' || overId === 'DONE') {
      destinationColumn = overId;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask && overTask.status !== 'CANCELLED') {
        destinationColumn = overTask.status;
      }
    }

    if (!destinationColumn) return;

    // Reorder within the same list if needed
    if (activeId !== overId && overId !== destinationColumn) {
      setTasks((prev) => {
        const oldIndex = prev.findIndex((t) => t.id === activeId);
        const newIndex = prev.findIndex((t) => t.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(prev, oldIndex, newIndex);
        }
        return prev;
      });
    }

    // Persist status change to database if moved to a different column
    if (original.status !== destinationColumn) {
      setTasks((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, status: destinationColumn } : t))
      );

      try {
        await updateTaskStatus(activeId, destinationColumn);
      } catch (err) {
        console.error('Failed to update task status in database', err);
        // Rollback on failure
        setTasks((prev) =>
          prev.map((t) => (t.id === activeId ? { ...t, status: original.status } : t))
        );
      }
    }
  };

  const handleDragCancel = () => {
    if (activeTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === activeTask.id ? { ...t, status: activeTask.status } : t))
      );
    }
    setActiveTask(null);
    setHoveredColumnId(null);
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
              Alur manajemen tugas individual. Geser dan letakkan (drag & drop) kartu task antar kolom Todo, In Progress, dan Done, atau atur ulang urutan kartu.
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

      {/* DndContext Kanban Board Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KanbanColumn
            id="TODO"
            title="To Do"
            tasks={todoTasks}
            isHighlighted={hoveredColumnId === 'TODO' && activeTask !== null}
            onDelete={handleDelete}
            onMoveStatus={handleMoveStatus}
          />
          <KanbanColumn
            id="IN_PROGRESS"
            title="In Progress"
            tasks={inProgressTasks}
            isHighlighted={hoveredColumnId === 'IN_PROGRESS' && activeTask !== null}
            onDelete={handleDelete}
            onMoveStatus={handleMoveStatus}
          />
          <KanbanColumn
            id="DONE"
            title="Done"
            tasks={doneTasks}
            isHighlighted={hoveredColumnId === 'DONE' && activeTask !== null}
            onDelete={handleDelete}
            onMoveStatus={handleMoveStatus}
          />
        </div>

        {/* Smooth Drag Overlay */}
        {mounted && (
          <DragOverlay
            dropAnimation={{
              duration: 250,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}
          >
            {activeTask ? (
              <TaskCardView task={activeTask} isOverlay />
            ) : null}
          </DragOverlay>
        )}
      </DndContext>
    </div>
  );
}
