import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, ExpenseStats, ExpenseCategory, EXPENSE_CATEGORIES } from '../constants/types';

interface ExpensesContextType {
  expenses: Expense[];
  stats: ExpenseStats;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpensesByDateRange: (startDate: string, endDate: string) => Expense[];
  getExpensesByCategory: (category: ExpenseCategory) => Expense[];
  reload: () => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextType>({} as ExpensesContextType);

const EXPENSES_KEY = 'haweshly_expenses';

function calculateStats(expenses: Expense[]): ExpenseStats {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayTotal = expenses
    .filter(e => new Date(e.date) >= todayStart)
    .reduce((sum, e) => sum + e.amount, 0);

  const monthTotal = expenses
    .filter(e => new Date(e.date) >= monthStart)
    .reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals: Record<ExpenseCategory, number> = {} as Record<ExpenseCategory, number>;
  const categoryExpenseCount: Record<ExpenseCategory, number> = {} as Record<ExpenseCategory, number>;

  // Initialize all categories
  EXPENSE_CATEGORIES.forEach(cat => {
    categoryTotals[cat] = 0;
    categoryExpenseCount[cat] = 0;
  });

  // Calculate category totals for current month
  expenses
    .filter(e => new Date(e.date) >= monthStart)
    .forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      categoryExpenseCount[e.category] = (categoryExpenseCount[e.category] || 0) + 1;
    });

  const totalMonthExpenses = monthTotal;
  const categoryPercentages: Record<ExpenseCategory, number> = {} as Record<ExpenseCategory, number>;

  EXPENSE_CATEGORIES.forEach(cat => {
    categoryPercentages[cat] = totalMonthExpenses > 0 ? (categoryTotals[cat] / totalMonthExpenses) * 100 : 0;
  });

  let highestCategory: ExpenseCategory | null = null;
  let highestAmount = 0;

  EXPENSE_CATEGORIES.forEach(cat => {
    if (categoryTotals[cat] > highestAmount) {
      highestAmount = categoryTotals[cat];
      highestCategory = cat;
    }
  });

  // Calculate average daily spend for the month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const averageDailySpend = monthTotal / daysInMonth;

  return {
    todayTotal,
    monthTotal,
    categoryTotals,
    categoryPercentages,
    highestCategory,
    averageDailySpend,
  };
}

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats>({
    todayTotal: 0,
    monthTotal: 0,
    categoryTotals: {} as Record<ExpenseCategory, number>,
    categoryPercentages: {} as Record<ExpenseCategory, number>,
    highestCategory: null,
    averageDailySpend: 0,
  });

  // Load expenses from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(EXPENSES_KEY).then(v => {
      if (v) {
        const loaded = JSON.parse(v);
        setExpenses(loaded);
      }
    });
  }, []);

  // Persist expenses to storage whenever they change
  useEffect(() => {
    AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }, [expenses]);

  // Update stats whenever expenses change
  useEffect(() => {
    setStats(calculateStats(expenses));
  }, [expenses]);

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const getExpensesByDateRange = useCallback((startDate: string, endDate: string): Expense[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= start && expenseDate <= end;
    });
  }, [expenses]);

  const getExpensesByCategory = useCallback((category: ExpenseCategory): Expense[] => {
    return expenses.filter(e => e.category === category);
  }, [expenses]);

  const reload = useCallback(async () => {
    const data = await AsyncStorage.getItem(EXPENSES_KEY);
    if (data) {
      setExpenses(JSON.parse(data));
    }
  }, []);

  // Memoize the context value to avoid recreating on every render
  const contextValue = useMemo(
    () => ({
      expenses,
      stats,
      addExpense,
      updateExpense,
      deleteExpense,
      getExpensesByDateRange,
      getExpensesByCategory,
      reload,
    }),
    [expenses, stats, addExpense, updateExpense, deleteExpense, getExpensesByDateRange, getExpensesByCategory, reload]
  );

  return (
    <ExpensesContext.Provider value={contextValue}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpensesProvider');
  }
  return context;
}
