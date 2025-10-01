import { differenceInDays, parseISO } from 'date-fns';
import type { Todo } from '~/types/todo';

export function calculatePriority(task: Todo): number {
  const importanceScore = task.importance * 0.6;
  const urgencyScore = task.urgency * 0.4;

  let dueDateFactor = 0;
  if (task.due_date) {
    const daysUntilDue = differenceInDays(parseISO(task.due_date), new Date());
    if (daysUntilDue < 0) dueDateFactor = 20;
    else if (daysUntilDue <= 1) dueDateFactor = 15;
    else if (daysUntilDue <= 3) dueDateFactor = 10;
    else if (daysUntilDue <= 7) dueDateFactor = 5;
  }

  return importanceScore + urgencyScore + dueDateFactor;
}

export function sortByPriority(a: Todo, b: Todo): number {
  return calculatePriority(b) - calculatePriority(a);
}