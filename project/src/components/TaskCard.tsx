import {
  Clock,
  Star,
  Droplets,
  Wind,
  Trash2,
  ShoppingBasket,
  Cat,
  Sparkles,
  Wrench,
  Lock,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import type { WorkOrder, HouseholdMember } from '../types';
import { WATER_DEPENDENT_CATEGORIES } from '../data/mockData';
import { sounds } from '../lib/sounds';

interface TaskCardProps {
  task: WorkOrder;
  waterCutActive: boolean;
  assignee?: HouseholdMember;
  onClick: (task: WorkOrder) => void;
}

/** Maps a task category to a Lucide icon component and a colour palette. */
function getCategoryMeta(category: string): {
  Icon: React.ElementType;
  bg: string;
  iconColor: string;
  border: string;
  accent: string;
} {
  switch (category) {
    case 'kitchen':
      return { Icon: ShoppingBasket, bg: 'bg-orange-50', iconColor: 'text-orange-500', border: 'border-orange-100', accent: 'from-orange-400 to-amber-300' };
    case 'bathroom':
      return { Icon: Droplets, bg: 'bg-blue-50', iconColor: 'text-blue-500', border: 'border-blue-100', accent: 'from-blue-400 to-sky-300' };
    case 'litter':
      return { Icon: Cat, bg: 'bg-purple-50', iconColor: 'text-purple-500', border: 'border-purple-100', accent: 'from-purple-500 to-violet-400' };
    case 'cats':
      return { Icon: Cat, bg: 'bg-pink-50', iconColor: 'text-pink-500', border: 'border-pink-100', accent: 'from-pink-400 to-rose-300' };
    case 'cleaning':
      return { Icon: Sparkles, bg: 'bg-emerald-50', iconColor: 'text-emerald-500', border: 'border-emerald-100', accent: 'from-emerald-400 to-teal-300' };
    case 'general':
      return { Icon: Trash2, bg: 'bg-gray-50', iconColor: 'text-gray-500', border: 'border-gray-200', accent: 'from-gray-400 to-slate-300' };
    case 'laundry':
      return { Icon: Wind, bg: 'bg-sky-50', iconColor: 'text-sky-500', border: 'border-sky-100', accent: 'from-sky-400 to-cyan-300' };
    default:
      return { Icon: Wrench, bg: 'bg-slate-50', iconColor: 'text-slate-500', border: 'border-slate-200', accent: 'from-slate-400 to-gray-300' };
  }
}

const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  high: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-500',
};

const PRIORITY_LABEL: Record<string, string> = {
  critical: '🔴 Crítica',
  high: '🟠 Alta',
  medium: '🟡 Media',
  low: '⚪ Baja',
};

/** Small circle avatar — shows photo if avatarUrl present, else initial + color */
function MemberAvatar({
  member,
  size = 'sm',
  grayscale = false,
}: {
  member: HouseholdMember;
  size?: 'sm' | 'md';
  grayscale?: boolean;
}) {
  const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';

  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt={member.name}
        title={member.name}
        className={`${dim} rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0 ${grayscale ? 'grayscale' : ''}`}
      />
    );
  }

  return (
    <div
      title={member.name}
      className={`
        ${dim} rounded-full flex items-center justify-center
        font-bold text-white ring-2 ring-white shadow-sm flex-shrink-0
        ${grayscale ? 'grayscale' : ''}
      `}
      style={{ backgroundColor: member.avatar_color }}
    >
      {member.name[0].toUpperCase()}
    </div>
  );
}

export function TaskCard({ task, waterCutActive, assignee, onClick }: TaskCardProps) {
  const isBlocked = waterCutActive && WATER_DEPENDENT_CATEGORIES.includes(task.category);
  const isCompleted = task.status === 'completed';
  const { Icon, bg, iconColor, border, accent } = getCategoryMeta(task.category);

  return (
    <button
      id={`task-card-${task.id}`}
      disabled={isBlocked}
      onClick={() => {
        sounds.play('click');
        onClick(task);
      }}
      className={`
        group w-full text-left rounded-[2rem] border overflow-hidden
        transition-all duration-300
        active:scale-[0.96]
        ${isBlocked
          ? 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-200'
          : isCompleted
            ? 'bg-white border-emerald-100 shadow-sm cursor-default'
            : `${bg} ${border} shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] cursor-pointer`
        }
      `}
    >
      {/* Top accent bar */}
      {!isBlocked && !isCompleted && (
        <div className={`h-1.5 w-full bg-gradient-to-r ${accent} opacity-80`} />
      )}
      {isCompleted && (
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-300" />
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Big category icon */}
          <div
            className={`
              w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-inner
              transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110
              ${isBlocked ? 'bg-gray-200' : isCompleted ? 'bg-emerald-50' : 'bg-white/80 backdrop-blur-sm'}
            `}
          >
            {isBlocked ? (
              <Lock className="w-8 h-8 text-gray-400" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            ) : (
              <Icon className={`w-9 h-9 ${iconColor}`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center justify-between mb-2">
              {/* Priority + status badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {!isCompleted && (
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg ${
                      PRIORITY_BADGE[task.priority] ?? 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {PRIORITY_LABEL[task.priority] ?? task.priority}
                  </span>
                )}
                {isCompleted && (
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700">
                    ✓ Hecha
                  </span>
                )}
              </div>

              {/* Time indicator (hidden on completed) */}
              {!isCompleted && !isBlocked && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  {task.estimated_duration}m
                </span>
              )}
            </div>

            <h3
              className={`font-black text-xl leading-tight mb-2 tracking-tight ${
                isBlocked ? 'text-gray-400' : isCompleted ? 'text-gray-500 line-through decoration-emerald-400/50' : 'text-gray-900'
              }`}
            >
              {task.title}
            </h3>

            {/* Description preview */}
            {!isCompleted && (
              <p className="text-sm text-gray-500/80 mt-1 line-clamp-2 leading-relaxed font-medium">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-4 border-t border-black/5">
              {/* Assignee avatar */}
              {assignee ? (
                <div className="flex items-center gap-2">
                  <MemberAvatar member={assignee} size="sm" grayscale={isCompleted} />
                  <span className={`text-xs font-semibold ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                    {assignee.name}
                  </span>
                </div>
              ) : !isCompleted && !isBlocked && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-[10px] text-gray-400">?</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-400 italic">Sin asignar</span>
                </div>
              )}

              {/* Rewards */}
              {!isCompleted && !isBlocked && (
                <div className="flex items-center gap-3 ml-auto">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {task.xp_reward}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    <span className="text-sm">🪙</span>
                    {task.coin_reward}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chevron (only for actionable tasks) */}
          {!isBlocked && !isCompleted && (
            <div className="hidden sm:flex items-center self-center justify-center w-10 h-10 rounded-full bg-white/50 group-hover:bg-white transition-colors">
              <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
