export type GoalDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';

export type GoalView = {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  monthlyContribution: number;
  difficulty: GoalDifficulty;
};
