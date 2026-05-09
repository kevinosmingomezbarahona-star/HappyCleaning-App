import { useState } from 'react';
import { Flame, CheckCircle2 } from 'lucide-react';
import type { WorkOrder, HouseholdMember, ProductInventory } from '../types';
import { TaskCard } from './TaskCard';
import { TaskExecutionModal } from './TaskExecutionModal';

interface TaskFeedProps {
  workOrders: WorkOrder[];
  members: HouseholdMember[];
  inventory: ProductInventory[];
  waterCutActive: boolean;
  onCompleteTask: (taskId: string) => void;
}

type FilterState = 'all' | 'pending' | 'critical' | 'high' | 'litter' | 'completed';

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  litter: 2,
  medium: 3,
  low: 4,
};

export function TaskFeed({
  workOrders,
  members,
  inventory,
  waterCutActive,
  onCompleteTask,
}: TaskFeedProps) {
  const [selectedTask, setSelectedTask] = useState<WorkOrder | null>(null);
  const [filter, setFilter] = useState<FilterState>('all');

  // All tasks sorted by priority (active first, completed last)
  const sortedAll = [...workOrders].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;
    const pa = a.category === 'litter' ? PRIORITY_ORDER['litter'] : (PRIORITY_ORDER[a.priority] ?? 3);
    const pb = b.category === 'litter' ? PRIORITY_ORDER['litter'] : (PRIORITY_ORDER[b.priority] ?? 3);
    return pa - pb;
  });

  const activeTasks = sortedAll.filter((w) => w.status === 'pending' || w.status === 'in_progress');
  const completedTasks = sortedAll.filter((w) => w.status === 'completed');

  const filtered = sortedAll.filter((t) => {
    switch (filter) {
      case 'pending':  return t.status === 'pending' || t.status === 'in_progress';
      case 'completed': return t.status === 'completed';
      case 'critical': return t.priority === 'critical';
      case 'high':     return t.priority === 'high';
      case 'litter':   return t.category === 'litter';
      default:         return true;
    }
  });

  const completedCount = completedTasks.length;
  const totalCount = workOrders.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const FILTER_TABS: { id: FilterState; label: string }[] = [
    { id: 'all',       label: 'Todas' },
    { id: 'pending',   label: '⏳ Pendientes' },
    { id: 'critical',  label: '🔴 Críticas' },
    { id: 'high',      label: '🟠 Altas' },
    { id: 'litter',    label: '🐱 Arenero' },
    { id: 'completed', label: '✅ Hechas' },
  ];

  return (
    <>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Tareas del Hogar</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {completedCount}/{totalCount} completadas hoy
              </p>
            </div>
            {activeTasks.length > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-xl px-3 py-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-orange-600">{activeTasks.length} pendientes</span>
              </div>
            )}
          </div>

          {/* Animated progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Filter chips — horizontally scrollable */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                id={`filter-${tab.id}`}
                onClick={() => setFilter(tab.id)}
                className={`
                  flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold
                  transition-all duration-150
                  ${filter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task card list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-base font-bold text-gray-700">¡Todo al día!</p>
              <p className="text-sm text-gray-400 mt-1">No hay tareas en esta categoría.</p>
            </div>
          ) : (
            filtered.map((task) => {
              const assignee = task.assigned_to
                ? members.find((m) => m.id === task.assigned_to)
                : undefined;
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  waterCutActive={waterCutActive}
                  assignee={assignee}
                  onClick={(t) => {
                    // Don't open modal for completed tasks
                    if (t.status !== 'completed') setSelectedTask(t);
                  }}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Task execution modal */}
      {selectedTask && (
        <TaskExecutionModal
          task={selectedTask}
          inventory={inventory}
          onClose={() => setSelectedTask(null)}
          onComplete={(id) => {
            onCompleteTask(id);
            setSelectedTask(null);
          }}
        />
      )}
    </>
  );
}
