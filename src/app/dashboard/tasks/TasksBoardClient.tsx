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
  GripVertical,
  Zap,
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
import { useTheme } from '@/app/context/ThemeContext';

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
  const { themeStyle, accentColor } = useTheme();
  const isRetro = themeStyle === 'retro';
  const isOrange = accentColor === 'orange';

  // Priority configuration: Retro playful vs Minimalist clean
  const priorityConfig = isRetro
    ? {
        URGENT: {
          bg: 'bg-[#ff7eb6] text-[#1a2e1f] border-2 border-[#1a2e1f] shadow-[1.5px_1.5px_0px_#1a2e1f]',
          label: 'URGENT',
        },
        HIGH: {
          bg: 'bg-[#ff7a2f] text-white border-2 border-[#1a2e1f] shadow-[1.5px_1.5px_0px_#1a2e1f]',
          label: 'HIGH',
        },
        MEDIUM: {
          bg: 'bg-[#ffc93c] text-[#1a2e1f] border-2 border-[#1a2e1f] shadow-[1.5px_1.5px_0px_#1a2e1f]',
          label: 'MED',
        },
        LOW: {
          bg: 'bg-[#fbf3e0] text-[#1a2e1f] border-2 border-[#1a2e1f] shadow-[1.5px_1.5px_0px_#1a2e1f]',
          label: 'LOW',
        },
      }[task.priority || 'MEDIUM']
    : {
        URGENT: {
          bg: 'bg-rose-50 text-rose-700 border border-rose-200',
          label: 'URGENT',
        },
        HIGH: {
          bg: 'bg-orange-50 text-orange-700 border border-orange-200',
          label: 'HIGH',
        },
        MEDIUM: {
          bg: 'bg-amber-50 text-amber-700 border border-amber-200',
          label: 'MED',
        },
        LOW: {
          bg: 'bg-slate-50 text-slate-600 border border-slate-200',
          label: 'LOW',
        },
      }[task.priority || 'MEDIUM'];

  if (isDragging) {
    return (
      <div
        className={`${
          isRetro
            ? 'bg-[#1a2e1f]/5 rounded-[22px] border-[3px] border-dashed border-[#1a2e1f]/40'
            : 'bg-slate-100 rounded-xl border border-dashed border-slate-300'
        } h-[105px] opacity-40 shadow-inner`}
      />
    );
  }

  const cardClasses = isRetro
    ? `bg-white p-4 rounded-[22px] border-[3px] border-[#1a2e1f] transition-all space-y-3 group select-none ${
        isOverlay
          ? 'shadow-[10px_10px_0px_#1a2e1f] rotate-2 scale-105 cursor-grabbing z-50'
          : 'shadow-[4px_4px_0px_#1a2e1f] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#1a2e1f] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#1a2e1f]'
      }`
    : `bg-white p-4 rounded-xl border border-slate-200 transition-all space-y-3 group select-none ${
        isOverlay
          ? 'shadow-xl rotate-1 scale-105 cursor-grabbing z-50'
          : 'shadow-xs hover:shadow-md hover:border-slate-300'
      }`;

  return (
    <div className={cardClasses}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            {...dragHandleProps}
            className={`cursor-grab active:cursor-grabbing p-1.5 -m-1 rounded-lg transition-all ${
              isRetro
                ? 'text-[#1a2e1f]/40 group-hover:text-[#1a2e1f] hover:bg-[#fbf3e0] border border-transparent hover:border-[#1a2e1f]'
                : 'text-slate-400 group-hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Tahan dan geser (atau gunakan Spasi/Enter untuk navigasi keyboard)"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <span
            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${priorityConfig.bg}`}
          >
            {priorityConfig.label}
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
            className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50"
            title="Hapus task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <p
        className={`text-sm font-extrabold tracking-tight leading-snug ${
          task.status === 'DONE'
            ? 'line-through text-slate-400'
            : isRetro
            ? 'text-[#1a2e1f]'
            : 'text-slate-800'
        }`}
      >
        {task.title}
      </p>

      {/* Manual Status Buttons */}
      {onMoveStatus && (
        <div
          className={`pt-2.5 flex items-center justify-between text-xs ${
            isRetro
              ? 'border-t-2 border-[#1a2e1f]/15'
              : 'border-t border-slate-100'
          }`}
        >
          {task.status !== 'TODO' && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onMoveStatus(task.id, task.status === 'DONE' ? 'IN_PROGRESS' : 'TODO');
              }}
              className={`inline-flex items-center gap-1 font-black px-2.5 py-1 text-[11px] transition-all ${
                isRetro
                  ? 'text-[#1a2e1f] bg-[#fbf3e0] hover:bg-white border-[2px] border-[#1a2e1f] shadow-[1.5px_1.5px_0px_#1a2e1f] rounded-full hover:-translate-y-0.5 active:translate-y-0.5'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg'
              }`}
              title="Kembalikan ke status sebelumnya"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
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
              className={`inline-flex items-center gap-1 font-black text-xs px-3.5 py-1 ml-auto transition-all ${
                isRetro
                  ? `rounded-full border-[2px] border-[#1a2e1f] shadow-[2px_2px_0px_#1a2e1f] hover:-translate-y-0.5 active:translate-y-0.5 ${
                      task.status === 'TODO'
                        ? 'bg-[#ffc93c] hover:bg-[#ffbe1a] text-[#1a2e1f]'
                        : isOrange
                        ? 'bg-[#ff7a2f] hover:bg-[#e5651f] text-white'
                        : 'bg-[#1f4d2b] hover:bg-[#173e21] text-white'
                    }`
                  : `rounded-lg shadow-xs ${
                      task.status === 'TODO'
                        ? isOrange
                          ? 'bg-orange-100 text-[#ff7a2f] hover:bg-orange-200'
                          : 'bg-emerald-100 text-[#1f4d2b] hover:bg-emerald-200'
                        : isOrange
                        ? 'bg-[#ff7a2f] text-white hover:bg-[#e5651f]'
                        : 'bg-[#1f4d2b] text-white hover:bg-[#173e21]'
                    }`
              }`}
            >
              <span>{task.status === 'TODO' ? 'Mulai Kerja' : 'Selesaikan'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          ) : (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-black px-3 py-0.5 ml-auto ${
                isRetro
                  ? 'text-[#2d6a3e] bg-[#dcfce7] border-[2px] border-[#1a2e1f] shadow-[1.5px_1.5px_0px_#1a2e1f] rounded-full'
                  : 'text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
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
      className="cursor-grab active:cursor-grabbing focus:outline-none rounded-[22px]"
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
  const { themeStyle, accentColor } = useTheme();
  const isRetro = themeStyle === 'retro';
  const isOrange = accentColor === 'orange';

  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'Column',
      columnId: id,
    },
  });

  const columnConfig = isRetro
    ? {
        TODO: {
          dot: 'bg-[#ffc93c] border-2 border-[#1a2e1f]',
          defaultBg: 'bg-[#fff9ed]',
          highlightBg: 'bg-[#fff3db] ring-2 ring-[#ff7a2f] shadow-[8px_8px_0px_#ff7a2f]',
          emptyText: 'Tidak ada task di antrean To Do',
          dropPrompt: 'Lepaskan task di To Do',
          emptyIcon: Clock,
          emptyBadgeColor: 'bg-[#ffc93c] text-[#1a2e1f]',
        },
        IN_PROGRESS: {
          dot: 'bg-[#0a93c7] border-2 border-[#1a2e1f]',
          defaultBg: 'bg-[#e6f4fa]',
          highlightBg: 'bg-[#d2edf7] ring-2 ring-[#0a93c7] shadow-[8px_8px_0px_#0a93c7]',
          emptyText: 'Belum ada task yang sedang dikerjakan',
          dropPrompt: 'Lepaskan task di In Progress',
          emptyIcon: Zap,
          emptyBadgeColor: 'bg-[#bfe3f0] text-[#0a93c7]',
        },
        DONE: {
          dot: 'bg-[#2d6a3e] border-2 border-[#1a2e1f]',
          defaultBg: 'bg-[#e8f7ec]',
          highlightBg: 'bg-[#d6f2dc] ring-2 ring-[#2d6a3e] shadow-[8px_8px_0px_#2d6a3e]',
          emptyText: 'Selesaikan task untuk mencatat progres di sini',
          dropPrompt: 'Lepaskan task di Done',
          emptyIcon: CheckCircle2,
          emptyBadgeColor: 'bg-[#dcfce7] text-[#2d6a3e]',
        },
      }[id]
    : {
        TODO: {
          dot: isOrange ? 'bg-[#ff7a2f]' : 'bg-emerald-600',
          defaultBg: 'bg-slate-50/80',
          highlightBg: 'bg-blue-50/70 ring-2 ring-blue-500 shadow-md',
          emptyText: 'Tidak ada task di antrean To Do',
          dropPrompt: 'Lepaskan task di To Do',
          emptyIcon: Clock,
          emptyBadgeColor: 'bg-slate-200 text-slate-700',
        },
        IN_PROGRESS: {
          dot: 'bg-sky-500',
          defaultBg: 'bg-sky-50/50',
          highlightBg: 'bg-sky-100/70 ring-2 ring-sky-500 shadow-md',
          emptyText: 'Belum ada task yang sedang dikerjakan',
          dropPrompt: 'Lepaskan task di In Progress',
          emptyIcon: Zap,
          emptyBadgeColor: 'bg-sky-100 text-sky-700',
        },
        DONE: {
          dot: 'bg-emerald-500',
          defaultBg: 'bg-emerald-50/50',
          highlightBg: 'bg-emerald-100/70 ring-2 ring-emerald-500 shadow-md',
          emptyText: 'Selesaikan task untuk mencatat progres di sini',
          dropPrompt: 'Lepaskan task di Done',
          emptyIcon: CheckCircle2,
          emptyBadgeColor: 'bg-emerald-100 text-emerald-700',
        },
      }[id];

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
  const EmptyIcon = columnConfig.emptyIcon;

  const colClasses = isRetro
    ? `p-5 sm:p-6 rounded-[28px] border-[3.5px] border-[#1a2e1f] transition-all space-y-4 flex flex-col min-h-[480px] ${
        isHighlighted
          ? columnConfig.highlightBg
          : `${columnConfig.defaultBg} shadow-[6px_6px_0px_#1a2e1f]`
      }`
    : `p-5 sm:p-6 rounded-2xl border border-slate-200 transition-all space-y-4 flex flex-col min-h-[480px] font-sans ${
        isHighlighted
          ? columnConfig.highlightBg
          : `${columnConfig.defaultBg} shadow-xs`
      }`;

  return (
    <div ref={setNodeRef} className={colClasses}>
      {/* Column Header */}
      <div
        className={`flex items-center justify-between pb-3.5 ${
          isRetro
            ? 'border-b-[2.5px] border-[#1a2e1f]/20'
            : 'border-b border-slate-200/80'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-3.5 h-3.5 rounded-full ${columnConfig.dot}`} />
          <h3
            className={`text-base uppercase tracking-wider font-black ${
              isRetro
                ? "font-['Fraunces',serif] text-[#1a2e1f]"
                : 'text-slate-800 font-sans'
            }`}
          >
            {title}
          </h3>
        </div>
        <span
          className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
            isRetro
              ? 'bg-white border-2 border-[#1a2e1f] shadow-[2px_2px_0px_#1a2e1f] text-[#1a2e1f]'
              : 'bg-white border border-slate-200 shadow-xs text-slate-700'
          }`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <div className="space-y-3 flex-1 flex flex-col">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div
              className={`flex-1 flex flex-col items-center justify-center p-8 border-dashed transition-all text-center space-y-2 ${
                isRetro
                  ? `rounded-[22px] border-[2.5px] ${
                      isHighlighted
                        ? 'border-[#1a2e1f] bg-[#ffeed0] text-[#1a2e1f] font-black animate-pulse'
                        : 'border-[#1a2e1f]/35 bg-white/40 text-[#1a2e1f]/70'
                    }`
                  : `rounded-xl border ${
                      isHighlighted
                        ? 'border-blue-400 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-300 bg-white/50 text-slate-500'
                    }`
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                  isRetro
                    ? `border-2 border-[#1a2e1f] shadow-[2px_2px_0px_#1a2e1f] ${columnConfig.emptyBadgeColor}`
                    : `${columnConfig.emptyBadgeColor} shadow-xs`
                }`}
              >
                <EmptyIcon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <p className="text-xs font-bold leading-relaxed max-w-[200px]">
                {isHighlighted ? columnConfig.dropPrompt : columnConfig.emptyText}
              </p>
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
            </>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export default function TasksBoardClient({ initialTasks }: TasksBoardClientProps) {
  const { themeStyle, accentColor } = useTheme();
  const isRetro = themeStyle === 'retro';
  const isOrange = accentColor === 'orange';

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [hoveredColumnId, setHoveredColumnId] = useState<'TODO' | 'IN_PROGRESS' | 'DONE' | null>(null);
  const [mounted, setMounted] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      return matchesSearch && matchesPriority;
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

    if (original.status !== destinationColumn) {
      setTasks((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, status: destinationColumn } : t))
      );

      try {
        await updateTaskStatus(activeId, destinationColumn);
      } catch (err) {
        console.error('Failed to update task status in database', err);
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

  const headerContainerClasses = isRetro
    ? 'bg-[#fff9ed] p-6 sm:p-8 rounded-[28px] border-[3.5px] border-[#1a2e1f] shadow-[6px_6px_0px_#1a2e1f]'
    : 'bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs font-sans';

  return (
    <div
      className={`space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ${
        isRetro ? "font-['Alegreya_Sans',sans-serif]" : 'font-sans'
      }`}
    >
      {/* Header Container */}
      <div className={headerContainerClasses}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black mb-3 ${
                isRetro
                  ? 'bg-[#ffc93c] text-[#1a2e1f] border-[2px] border-[#1a2e1f] shadow-[2px_2px_0px_#1a2e1f]'
                  : isOrange
                  ? 'bg-orange-100 text-[#ff7a2f] border border-orange-200'
                  : 'bg-emerald-100 text-[#1f4d2b] border border-emerald-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Papan Kanban Personal</span>
            </div>
            <h1
              className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${
                isRetro
                  ? "font-['Fraunces',serif] text-[#1a2e1f]"
                  : 'text-slate-900 font-sans'
              }`}
            >
              Tasks & Board
            </h1>
            <p
              className={`text-sm sm:text-base mt-1.5 max-w-xl leading-relaxed ${
                isRetro ? 'text-[#1a2e1f]/75 font-medium' : 'text-slate-500'
              }`}
            >
              Alur manajemen tugas individual. Geser dan letakkan (drag & drop) kartu task antar kolom Todo, In Progress, dan Done, atau atur ulang urutan kartu.
            </p>
          </div>

          {/* CTA Button "+ Task Baru" */}
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className={`inline-flex items-center justify-center gap-2 font-black transition-all cursor-pointer self-start md:self-auto ${
              isRetro
                ? `px-6 py-3.5 rounded-full text-sm text-white border-[3px] border-[#1a2e1f] shadow-[4px_4px_0px_#1a2e1f] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#1a2e1f] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#1a2e1f] ${
                    isOrange ? 'bg-[#ff7a2f]' : 'bg-[#1f4d2b]'
                  }`
                : `px-5 py-3 rounded-xl text-xs text-white shadow-xs hover:opacity-95 ${
                    isOrange ? 'bg-[#ff7a2f]' : 'bg-[#1f4d2b]'
                  }`
            }`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Task Baru</span>
          </button>
        </div>

        {/* Add Task Drawer Form */}
        {isAdding && (
          <form
            onSubmit={handleCreate}
            className={`mt-6 p-5 space-y-3.5 animate-in fade-in duration-200 ${
              isRetro
                ? 'rounded-[22px] bg-[#ffeed0] border-[3px] border-[#1a2e1f] shadow-[4px_4px_0px_#1a2e1f]'
                : 'rounded-xl bg-slate-50 border border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Judul task baru..."
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold focus:outline-none ${
                  isRetro
                    ? 'bg-white border-[2.5px] border-[#1a2e1f] text-[#1a2e1f] placeholder:text-[#1a2e1f]/40'
                    : 'bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400'
                }`}
                autoFocus
              />
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-black focus:outline-none ${
                  isRetro
                    ? 'bg-white border-[2.5px] border-[#1a2e1f] text-[#1a2e1f]'
                    : 'bg-white border border-slate-200 text-slate-800'
                }`}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className={`px-4 py-2 text-xs font-bold transition-colors ${
                  isRetro
                    ? 'rounded-full border-2 border-[#1a2e1f] bg-white text-[#1a2e1f] hover:bg-gray-100'
                    : 'rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className={`px-5 py-2 text-xs font-black transition-all disabled:opacity-50 ${
                  isRetro
                    ? `rounded-full border-[2.5px] border-[#1a2e1f] text-white shadow-[3px_3px_0px_#1a2e1f] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1a2e1f] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1a2e1f] ${
                        isOrange ? 'bg-[#ff7a2f]' : 'bg-[#1f4d2b]'
                      }`
                    : `rounded-lg text-white shadow-xs ${
                        isOrange ? 'bg-[#ff7a2f] hover:bg-[#e5651f]' : 'bg-[#1f4d2b] hover:bg-[#173e21]'
                      }`
                }`}
              >
                Simpan Task
              </button>
            </div>
          </form>
        )}

        {/* Filter and Search Bar */}
        <div
          className={`mt-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3.5 ${
            isRetro ? 'border-t-2 border-[#1a2e1f]/15' : 'border-t border-slate-100'
          }`}
        >
          <div className="relative w-full sm:w-72">
            <Search
              className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                isRetro ? 'text-[#1a2e1f]/50' : 'text-slate-400'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari task..."
              className={`w-full pl-9 pr-4 py-2 text-xs font-bold focus:outline-none ${
                isRetro
                  ? 'bg-white border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f] rounded-full text-[#1a2e1f] placeholder:text-[#1a2e1f]/40'
                  : 'bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 shadow-xs'
              }`}
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-black flex-wrap">
            <span
              className={`mr-1 text-[11px] uppercase tracking-wider ${
                isRetro ? 'text-[#1a2e1f]/70' : 'text-slate-400 font-semibold'
              }`}
            >
              Prioritas:
            </span>
            {['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((p) => {
              const isSelected = priorityFilter === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1 text-xs font-black transition-all ${
                    isRetro
                      ? `rounded-full border-[2px] border-[#1a2e1f] ${
                          isSelected
                            ? 'bg-[#ffc93c] text-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f] -translate-y-0.5'
                            : 'bg-white text-[#1a2e1f]/70 hover:bg-[#fff9ed] hover:text-[#1a2e1f] hover:shadow-[2px_2px_0px_#1a2e1f]'
                        }`
                      : `rounded-lg ${
                          isSelected
                            ? isOrange
                              ? 'bg-[#ff7a2f] text-white shadow-xs'
                              : 'bg-[#1f4d2b] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`
                  }`}
                >
                  {p}
                </button>
              );
            })}
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
