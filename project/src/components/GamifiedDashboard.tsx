import { Coins, Zap, Trophy, Flame, BarChart3, Lock, Gift, CalendarCheck } from 'lucide-react';
import type { HouseholdMember, Streak, TaskPreference, WorkOrder } from '../types';
import { discreteAdjustedWinner, calculateFairnessScore } from '../lib/fairDivision';
import { FAMILY_HYGIENE_STREAK, HOUSE_CHEST } from '../data/mockData';

interface GamifiedDashboardProps {
  members: HouseholdMember[];
  streaks: Streak[];
  preferences: TaskPreference[];
  workOrders: WorkOrder[];
}

function getLevelColor(level: number): string {
  if (level >= 8) return 'from-amber-400 to-orange-500';
  if (level >= 6) return 'from-blue-400 to-cyan-500';
  if (level >= 4) return 'from-emerald-400 to-teal-500';
  return 'from-gray-400 to-gray-500';
}

function getXpForNextLevel(level: number): number {
  return level * 200;
}

function getXpProgress(member: HouseholdMember): number {
  const nextLevel = getXpForNextLevel(member.level);
  const prevLevel = (member.level - 1) * 200;
  return Math.min(100, ((member.xp_points - prevLevel) / (nextLevel - prevLevel)) * 100);
}

export function GamifiedDashboard({
  members,
  streaks,
  preferences,
  workOrders,
}: GamifiedDashboardProps) {
  const pendingTasks = workOrders.filter((w) => w.status === 'pending');
  const fairResult = discreteAdjustedWinner(pendingTasks, members, preferences);
  const fairnessScore = calculateFairnessScore(fairResult.totalDisutility, members);

  const maxDesutility = Math.max(...Object.values(fairResult.totalDisutility), 1);

  const memberLoads = members.map((m) => ({
    ...m,
    desutility: fairResult.totalDisutility[m.id] || 0,
    streak: streaks.find((s) => s.member_id === m.id),
  }));

  const chestProgress = (HOUSE_CHEST.tasksCompleted / HOUSE_CHEST.tasksRequired) * 100;
  const chestUnlocked = HOUSE_CHEST.tasksCompleted >= HOUSE_CHEST.tasksRequired;

  return (
    <div className="space-y-4">
      {/* Fairness Score - Desutility Based */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-800">Carga Asumida (Desutilidad)</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              fairnessScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
              fairnessScore >= 50 ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {fairnessScore}% justo
            </span>
            {fairResult.isEF1 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                EF1
              </span>
            )}
            {fairResult.isParetoOptimal && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Pareto
              </span>
            )}
          </div>
        </div>
        <p className="text-[10px] text-gray-400 mb-3">
          Puntos de desutilidad por miembro. Barras equilibradas = distribución matemáticamente justa.
        </p>

        {/* Desutility Bar Chart */}
        <div className="space-y-2">
          {memberLoads.map((m) => (
            <div key={m.id} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                style={{ backgroundColor: m.avatar_color }}
              >
                {m.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-600 truncate">{m.name}</span>
                  <span className="text-[10px] font-semibold text-gray-500">
                    {m.desutility} pts desutilidad
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: maxDesutility > 0 ? `${(m.desutility / maxDesutility) * 100}%` : '0%',
                      backgroundColor: m.avatar_color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Family Hygiene Streak */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarCheck className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-gray-800">Racha de Higiene Familiar</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 14 }).map((_, i) => {
              const day = i + 1;
              const completed = day <= FAMILY_HYGIENE_STREAK;
              const isToday = day === FAMILY_HYGIENE_STREAK + 1;
              return (
                <div
                  key={day}
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold transition-all ${
                    completed
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : isToday
                        ? 'bg-amber-100 text-amber-700 border-2 border-amber-400 border-dashed'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {completed ? '✓' : day}
                </div>
              );
            })}
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="flex items-center gap-1 justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-gray-800">{FAMILY_HYGIENE_STREAK}</span>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">días seguidos</p>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 mt-2">
          {FAMILY_HYGIENE_STREAK > 0
            ? `La familia ha cumplido rutinas críticas ${FAMILY_HYGIENE_STREAK} días consecutivos. No rompan la racha!`
            : 'Completa las rutinas críticas diarias para iniciar la racha.'}
        </p>
      </div>

      {/* House Chest */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-800">El Cofre de la Casa</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500 ${
            chestUnlocked
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200 animate-pulse-subtle'
              : 'bg-gray-100 border-2 border-gray-200'
          }`}>
            {chestUnlocked ? (
              <Gift className="w-7 h-7 text-white" />
            ) : (
              <Lock className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-700">
                {chestUnlocked ? 'Desbloqueado!' : `${HOUSE_CHEST.tasksRequired - HOUSE_CHEST.tasksCompleted} tareas más`}
              </span>
              <span className="text-[10px] text-gray-400">
                {HOUSE_CHEST.tasksCompleted}/{HOUSE_CHEST.tasksRequired}
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  chestUnlocked
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                    : 'bg-amber-400'
                }`}
                style={{ width: `${chestProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              {chestUnlocked
                ? 'Recompensa aleatoria disponible!'
                : `Completa ${HOUSE_CHEST.tasksRequired - HOUSE_CHEST.tasksCompleted} tareas comunitarias más para desbloquear una recompensa aleatoria.`}
            </p>
            {!chestUnlocked && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {HOUSE_CHEST.possibleRewards.slice(0, 3).map((r) => (
                  <span key={r} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-400 border border-gray-100">
                    {r}
                  </span>
                ))}
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-400 border border-gray-100">
                  +{HOUSE_CHEST.possibleRewards.length - 3} más
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Leaderboard */}
      <div className="grid grid-cols-1 gap-2">
        {memberLoads
          .sort((a, b) => b.xp_points - a.xp_points)
          .map((m, idx) => (
            <div
              key={m.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-3"
            >
              <div className="flex-shrink-0 w-6 text-center">
                {idx === 0 ? (
                  <Trophy className="w-5 h-5 text-amber-400 mx-auto" />
                ) : (
                  <span className="text-xs font-bold text-gray-400">{idx + 1}</span>
                )}
              </div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
                style={{ backgroundColor: m.avatar_color }}
              >
                {m.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-800 truncate">{m.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white bg-gradient-to-r ${getLevelColor(m.level)}`}>
                    Nv.{m.level}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r transition-all duration-500"
                    style={{
                      width: `${getXpProgress(m)}%`,
                      backgroundImage: `linear-gradient(to right, ${m.avatar_color}, ${m.avatar_color}dd)`,
                    }}
                  />
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-3">
                <div className="flex items-center gap-1" title="XP">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-gray-700">{m.xp_points}</span>
                </div>
                <div className="flex items-center gap-1" title="Monedas del Hogar">
                  <Coins className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs font-semibold text-gray-700">{m.home_coins}</span>
                </div>
                {m.streak && m.streak.current_count > 0 && (
                  <div className="flex items-center gap-1" title="Racha">
                    <Flame className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs font-semibold text-gray-700">{m.streak.current_count}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
