import type { GoalDifficulty } from '@/types/goals';

export function calculateMonthsToGoal(targetAmount: number, savedAmount: number, monthlyContribution: number) {
  const remaining = Math.max(targetAmount - savedAmount, 0);
  if (remaining === 0) return 0;
  if (monthlyContribution <= 0) return Infinity;
  return Math.ceil(remaining / monthlyContribution);
}

export function calculateGoalProgress(targetAmount: number, savedAmount: number) {
  if (targetAmount <= 0) return 0;
  return Math.min(Math.round((savedAmount / targetAmount) * 100), 100);
}

export function calculateGoalDifficulty(monthlyContribution: number, monthlyIncome: number): GoalDifficulty {
  if (monthlyIncome <= 0) return 'VERY_HARD';
  const ratio = monthlyContribution / monthlyIncome;

  if (ratio <= 0.1) return 'EASY';
  if (ratio <= 0.25) return 'MEDIUM';
  if (ratio <= 0.5) return 'HARD';
  return 'VERY_HARD';
}

export function goalDifficultyLabel(difficulty: GoalDifficulty) {
  const labels: Record<GoalDifficulty, string> = {
    EASY: 'Fácil',
    MEDIUM: 'Médio',
    HARD: 'Difícil',
    VERY_HARD: 'Muito difícil'
  };
  return labels[difficulty];
}
