import { Expense, ExpenseChartView, ExpenseChartData } from '../constants/types';

/**
 * Get expenses grouped by day
 */
export function groupExpensesByDay(expenses: Expense[]): Record<string, Expense[]> {
  const grouped: Record<string, Expense[]> = {};

  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format

    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
    }
    grouped[dateStr].push(expense);
  });

  // Sort each day's expenses by time (latest first)
  Object.keys(grouped).forEach(day => {
    grouped[day].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  return grouped;
}

/**
 * Get expenses grouped by month
 */
export function groupExpensesByMonth(expenses: Expense[]): Record<string, Expense[]> {
  const grouped: Record<string, Expense[]> = {};

  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format

    if (!grouped[monthStr]) {
      grouped[monthStr] = [];
    }
    grouped[monthStr].push(expense);
  });

  // Sort expenses within each month by date (latest first)
  Object.keys(grouped).forEach(month => {
    grouped[month].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  return grouped;
}

/**
 * Get total expenses for a given day
 */
export function getDayTotal(expenses: Expense[], date: Date): number {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  return expenses
    .filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= dayStart && expenseDate < dayEnd;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Format date for display (e.g., "Today", "Yesterday", "Jan 15")
 */
export function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateToCompare = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayToCompare = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayToCompare = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (dateToCompare.getTime() === todayToCompare.getTime()) {
    return 'Today';
  }

  if (dateToCompare.getTime() === yesterdayToCompare.getTime()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Get chart data based on view (daily, weekly, monthly, yearly)
 */
export function getChartData(expenses: Expense[], view: ExpenseChartView, monthsBack: number = 12): ExpenseChartData[] {
  const now = new Date();
  const data: ExpenseChartData[] = [];

  if (view === 'daily') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayTotal = getDayTotal(expenses, date);
      data.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: dayTotal,
        date: dateStr,
      });
    }
  } else if (view === 'weekly') {
    // Last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);

      const weekEndStr = weekEnd.toISOString().split('T')[0];

      const weekTotal = expenses
        .filter(e => {
          const expenseDate = new Date(e.date);
          return expenseDate >= weekStart && expenseDate <= weekEnd;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      const label = `Week ${4 - i}`;

      data.push({
        label,
        value: weekTotal,
        date: weekEndStr,
      });
    }
  } else if (view === 'monthly') {
    // Last N months
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);

      const monthTotal = expenses
        .filter(e => {
            const d = new Date(e.date);
            return (
              d.getFullYear() === date.getFullYear() &&
              d.getMonth() === date.getMonth()
            );
        })
        .reduce((sum, e) => sum + e.amount, 0);

      data.push({
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: monthTotal,
        date: monthStr,
      });
    }
  } else if (view === 'yearly') {
    // Last 5 years
    for (let i = 4; i >= 0; i--) {
      const year = now.getFullYear() - i;
      const yearStr = year.toString();

      const yearTotal = expenses
        .filter(e => e.date.startsWith(yearStr))
        .reduce((sum, e) => sum + e.amount, 0);

      data.push({
        label: yearStr,
        value: yearTotal,
        date: yearStr,
      });
    }
  }

  return data;
}

/**
 * Get month range in format YYYY-MM
 */
export function getMonthRange(monthsBack: number = 12): string[] {
  const months: string[] = [];
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toISOString().slice(0, 7));
  }

  return months;
}

/**
 * Format number as currency
 */
export function formatCurrency(amount: number, currency: string = '$'): string {
  return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Get color intensity for spending value (darker = more spending)
 */
export function getSpendingIntesity(value: number, min: number, max: number): number {
  if (max === 0) return 0.3;
  return 0.3 + 0.7 * ((value - min) / (max - min));
}
