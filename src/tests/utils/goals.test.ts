import {
  calculateGoalDifficulty,
  calculateGoalProgress,
  calculateMonthsToGoal,
  goalDifficultyLabel
} from '@/utils/goals';

describe('goal utilities', () => {
  it('calculates months needed with rounding up', () => {
    expect(calculateMonthsToGoal(10000, 2500, 500)).toBe(15);
    expect(calculateMonthsToGoal(10000, 10000, 500)).toBe(0);
    expect(calculateMonthsToGoal(10000, 1000, 0)).toBe(Infinity);
  });

  it('calculates capped progress', () => {
    expect(calculateGoalProgress(10000, 2500)).toBe(25);
    expect(calculateGoalProgress(10000, 15000)).toBe(100);
    expect(calculateGoalProgress(0, 100)).toBe(0);
  });

  it('classifies difficulty by income ratio', () => {
    expect(calculateGoalDifficulty(500, 5000)).toBe('EASY');
    expect(calculateGoalDifficulty(1000, 5000)).toBe('MEDIUM');
    expect(calculateGoalDifficulty(2000, 5000)).toBe('HARD');
    expect(calculateGoalDifficulty(3000, 5000)).toBe('VERY_HARD');
    expect(calculateGoalDifficulty(100, 0)).toBe('VERY_HARD');
  });

  it('returns localized difficulty labels', () => {
    expect(goalDifficultyLabel('VERY_HARD')).toBe('Muito difícil');
  });
});
