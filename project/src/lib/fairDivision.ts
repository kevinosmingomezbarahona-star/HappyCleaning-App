import type { HouseholdMember, TaskPreference, WorkOrder } from '../types';

interface TaskWithDisutility extends WorkOrder {
  disutility: Record<string, number>;
}

interface Assignment {
  taskId: string;
  taskTitle: string;
  memberId: string;
  memberName: string;
  disutility: number;
}

interface FairDivisionResult {
  assignments: Assignment[];
  totalDisutility: Record<string, number>;
  isEF1: boolean;
  isParetoOptimal: boolean;
  loadBalance: Record<string, number>;
}

function getDisutility(
  preferences: TaskPreference[],
  memberId: string,
  category: string
): number {
  const pref = preferences.find(
    (p) => p.member_id === memberId && p.task_category === category
  );
  return pref ? pref.preference_level : 2;
}

export function discreteAdjustedWinner(
  tasks: WorkOrder[],
  members: HouseholdMember[],
  preferences: TaskPreference[]
): FairDivisionResult {
  const tasksWithDisutility: TaskWithDisutility[] = tasks.map((task) => {
    const disutility: Record<string, number> = {};
    members.forEach((m) => {
      disutility[m.id] = getDisutility(preferences, m.id, task.category);
    });
    return { ...task, disutility };
  });

  const sortedTasks = [...tasksWithDisutility].sort((a, b) => {
    const maxA = Math.max(...Object.values(a.disutility));
    const maxB = Math.max(...Object.values(b.disutility));
    return maxB - maxA;
  });

  const memberLoad: Record<string, number> = {};
  const memberTaskCount: Record<string, number> = {};
  members.forEach((m) => {
    memberLoad[m.id] = 0;
    memberTaskCount[m.id] = 0;
  });

  const assignments: Assignment[] = [];

  for (const task of sortedTasks) {
    const candidates = members
      .map((m) => ({
        memberId: m.id,
        memberName: m.name,
        disutility: task.disutility[m.id],
        adjustedCost:
          task.disutility[m.id] * (1 + memberTaskCount[m.id] * 0.3) +
          memberLoad[m.id] * 0.2,
      }))
      .sort((a, b) => a.adjustedCost - b.adjustedCost);

    const best = candidates[0];
    assignments.push({
      taskId: task.id,
      taskTitle: task.title,
      memberId: best.memberId,
      memberName: best.memberName,
      disutility: best.disutility,
    });

    memberLoad[best.memberId] += best.disutility;
    memberTaskCount[best.memberId] += 1;
  }

  const totalDisutility: Record<string, number> = {};
  members.forEach((m) => {
    totalDisutility[m.id] = assignments
      .filter((a) => a.memberId === m.id)
      .reduce((sum, a) => sum + a.disutility, 0);
  });

  const loads = Object.values(totalDisutility);
  const maxLoad = Math.max(...loads);
  const minLoad = Math.min(...loads);
  const isEF1 = maxLoad - minLoad <= 1;

  const isParetoOptimal = checkParetoOptimality(
    assignments,
    members,
    tasksWithDisutility
  );

  const loadBalance: Record<string, number> = {};
  members.forEach((m) => {
    loadBalance[m.id] = memberTaskCount[m.id];
  });

  return {
    assignments,
    totalDisutility,
    isEF1,
    isParetoOptimal,
    loadBalance,
  };
}

function checkParetoOptimality(
  assignments: Assignment[],
  members: HouseholdMember[],
  tasks: TaskWithDisutility[]
): boolean {
  const memberAssignments: Record<string, Assignment[]> = {};
  members.forEach((m) => {
    memberAssignments[m.id] = assignments.filter((a) => a.memberId === m.id);
  });

  for (const member of members) {
    for (const assignment of memberAssignments[member.id]) {
      const task = tasks.find((t) => t.id === assignment.taskId);
      if (!task) continue;

      for (const otherMember of members) {
        if (otherMember.id === member.id) continue;
        if (task.disutility[otherMember.id] < assignment.disutility) {
          const otherMemberTasks = memberAssignments[otherMember.id];
          for (const otherAssignment of otherMemberTasks) {
            const otherTask = tasks.find((t) => t.id === otherAssignment.taskId);
            if (!otherTask) continue;
            if (
              otherTask.disutility[member.id] < otherAssignment.disutility &&
              task.disutility[otherMember.id] < assignment.disutility
            ) {
              return false;
            }
          }
        }
      }
    }
  }

  return true;
}

export function calculateFairnessScore(
  totalDisutility: Record<string, number>,
  members: HouseholdMember[]
): number {
  const loads = members.map((m) => totalDisutility[m.id] || 0);
  if (loads.length === 0) return 100;
  const maxLoad = Math.max(...loads);
  if (maxLoad === 0) return 100;
  const gini = (2 * loads.reduce((sum, l) => sum + l, 0)) / (loads.length * maxLoad) - (loads.length + 1) / loads.length;
  return Math.max(0, Math.min(100, Math.round((1 - Math.abs(gini)) * 100)));
}
