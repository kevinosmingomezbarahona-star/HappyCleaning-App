import { Lock, Droplets, Wind, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { WorkOrder, HouseholdMember } from '../types';
import { WATER_DEPENDENT_CATEGORIES, DRY_CATEGORIES } from '../data/mockData';

interface UmapsTaskListProps {
  workOrders: WorkOrder[];
  members: HouseholdMember[];
  waterCutActive: boolean;
  onCompleteTask?: (taskId: string) => void;
}

export function UmapsTaskList({
  workOrders,
  members,
  waterCutActive,
  onCompleteTask,
}: UmapsTaskListProps) {
  const pendingTasks = workOrders.filter((w) => w.status === 'pending');

  const waterTasks = pendingTasks.filter(
    (w) => WATER_DEPENDENT_CATEGORIES.includes(w.category)
  );
  const dryTasks = pendingTasks.filter(
    (w) => DRY_CATEGORIES.includes(w.category)
  );
  const otherTasks = pendingTasks.filter(
    (w) => !WATER_DEPENDENT_CATEGORIES.includes(w.category) && !DRY_CATEGORIES.includes(w.category)
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Tareas del Hogar</h3>
        <span className="text-[10px] text-gray-400">
          {pendingTasks.length} pendiente{pendingTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Dry Tasks - Highlighted during UMAPS */}
      {dryTasks.length > 0 && (
        <div className="mb-3">
          {waterCutActive && (
            <div className="flex items-center gap-1.5 mb-2">
              <Wind className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">
                Limpieza en seco - Prioridad UMAPS
              </span>
            </div>
          )}
          <div className="space-y-1.5">
            {dryTasks.map((task) => {
              const assignee = task.assigned_to
                ? members.find((m) => m.id === task.assigned_to)
                : null;
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 p-2.5 rounded-xl transition-all duration-200 ${
                    waterCutActive
                      ? 'bg-emerald-50 border border-emerald-200 shadow-sm'
                      : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    waterCutActive ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}>
                    <Wind className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-gray-400">{task.estimated_duration} min</span>
                      {assignee && (
                        <span className="text-[9px] text-gray-500">{assignee.name}</span>
                      )}
                      <span className="text-[9px] text-amber-600 font-medium">+{task.xp_reward} XP</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onCompleteTask?.(task.id)}
                    className="flex-shrink-0 p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-600 transition-colors"
                    title="Completar tarea"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Water Tasks - Blocked during UMAPS */}
      {waterTasks.length > 0 && (
        <div className="mb-3">
          {waterCutActive && (
            <div className="flex items-center gap-1.5 mb-2">
              <Droplets className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wide">
                Bloqueadas - Consumo hídrico
              </span>
            </div>
          )}
          <div className="space-y-1.5">
            {waterTasks.map((task) => {
              const assignee = task.assigned_to
                ? members.find((m) => m.id === task.assigned_to)
                : null;
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 p-2.5 rounded-xl transition-all duration-200 ${
                    waterCutActive
                      ? 'bg-gray-50 border border-gray-200 opacity-50'
                      : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    waterCutActive ? 'bg-gray-300' : 'bg-blue-400'
                  }`}>
                    {waterCutActive ? (
                      <Lock className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Droplets className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${
                      waterCutActive ? 'text-gray-400 line-through' : 'text-gray-800'
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-gray-400">{task.estimated_duration} min</span>
                      {assignee && (
                        <span className="text-[9px] text-gray-500">{assignee.name}</span>
                      )}
                      <span className="text-[9px] text-amber-600 font-medium">+{task.xp_reward} XP</span>
                    </div>
                  </div>
                  {waterCutActive ? (
                    <div className="flex-shrink-0 p-1.5 rounded-lg bg-red-50 text-red-400" title="Bloqueada por UMAPS">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : (
                    <button
                      onClick={() => onCompleteTask?.(task.id)}
                      className="flex-shrink-0 p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                      title="Completar tarea"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Tasks */}
      {otherTasks.length > 0 && (
        <div className="space-y-1.5">
          {otherTasks.map((task) => {
            const assignee = task.assigned_to
              ? members.find((m) => m.id === task.assigned_to)
              : null;
            return (
              <div
                key={task.id}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-gray-400">{task.estimated_duration} min</span>
                    {assignee && (
                      <span className="text-[9px] text-gray-500">{assignee.name}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onCompleteTask?.(task.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                  title="Completar tarea"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
