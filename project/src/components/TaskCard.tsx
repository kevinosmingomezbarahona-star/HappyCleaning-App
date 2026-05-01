import {
  Clock,
  Star,
  Droplets,
  Wind,
  Trash2,
  ShoppingBasket,
  Cat,
  Flame,
  Wrench,
  Sparkles,
  Lock,
  ChevronRight,
} from 'lucide-react';
import type { WorkOrder } from '../types';
import { WATER_DEPENDENT_CATEGORIES } from '../data/mockData';

interface TaskCardProps {
  task: WorkOrder;
  waterCutActive: boolean;
  assigneeName?: string;
  onClick: (task: WorkOrder) => void;
}

/** Maps a task category to a Lucide icon component and a colour palette. */
function getCategoryMeta(category: string): {
  Icon: React.ElementType;
  bg: string;
  iconColor: string;
  border: string;
} {
  switch (category) {
    case 'kitchen':
      return { Icon: ShoppingBasket, bg: 'bg-orange-50', iconColor: 'text-orange-500', border: 'border-orange-100' };
    case 'bathroom':
      return { Icon: Droplets, bg: 'bg-blue-50', iconColor: 'text-blue-500', border: 'border-blue-100' };
    case 'litter':
      return { Icon: Cat, bg: 'bg-purple-50', iconColor: 'text-purple-500', border: 'border-purple-100' };
    case 'cats':
      return { Icon: Cat, bg: 'bg-pink-50', iconColor: 'text-pink-500', border: 'border-pink-100' };
    case 'cleaning':
      return { Icon: Sparkles, bg: 'bg-emerald-50', iconColor: 'text-emerald-500', border: 'border-emerald-100' };
    case 'general':
      return { Icon: Trash2, bg: 'bg-gray-50', iconColor: 'text-gray-500', border: 'border-gray-100' };
    case 'laundry':
      return { Icon: Wind, bg: 'bg-sky-50', iconColor: 'text-sky-500', border: 'border-sky-100' };
    default:
      return { Icon: Wrench, bg: 'bg-slate-50', iconColor: 'text-slate-500', border: 'border-slate-100' };
  }
}

const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-500',
};

const PRIORITY_LABEL: Record<string, string> = {
  critical: '🔴 Crítica',
  high: '🟠 Alta',
  medium: '🟡 Media',
  low: '⚪ Baja',
};

export function TaskCard({ task, waterCutActive, assigneeName, onClick }: TaskCardProps) {
  const isBlocked = waterCutActive && WATER_DEPENDENT_CATEGORIES.includes(task.category);
  const { Icon, bg, iconColor, border } = getCategoryMeta(task.category);

  return (
    <button
      id={`task-card-${task.id}`}
      disabled={isBlocked}
      onClick={() => onClick(task)}
      className={`
        w-full text-left rounded-2xl border p-4 transition-all duration-200 active:scale-[0.98]
        ${isBlocked
          ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
          : `${bg} ${border} shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer`
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Big category icon */}
        <div className={`
          w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
          ${isBlocked ? 'bg-gray-200' : 'bg-white shadow-sm'}
        `}>
          {isBlocked
            ? <Lock className="w-7 h-7 text-gray-400" />
            : <Icon className={`w-7 h-7 ${iconColor}`} />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_BADGE[task.priority] ?? 'bg-gray-100 text-gray-500'}`}>
              {PRIORITY_LABEL[task.priority] ?? task.priority}
            </span>
            {isBlocked && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                🔒 UMAPS
              </span>
            )}
          </div>

          <h3 className={`font-bold text-base leading-snug ${isBlocked ? 'text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </h3>

          {assigneeName && (
            <p className="text-xs text-gray-400 mt-0.5">Asignada a: {assigneeName}</p>
          )}

          {/* Footer meta */}
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              {task.estimated_duration} min
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
              <Star className="w-3.5 h-3.5" />
              +{task.xp_reward} XP
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              +{task.coin_reward} 🪙
            </span>
          </div>
        </div>

        {/* Chevron */}
        {!isBlocked && (
          <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" />
        )}
      </div>
    </button>
  );
}
