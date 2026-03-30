export interface SavingEntry {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  startDate: string;
  targetDate: string;
  savings: SavingEntry[];
  createdAt: string;
  emoji?: string;
}

export interface GoalStats {
  totalSaved: number;
  remaining: number;
  percentage: number;
  daysLeft: number;
  dailyNeeded: number;
  weeklyNeeded: number;
  monthlyNeeded: number;
  isCompleted: boolean;
  isOnTrack: boolean;
}

export type ReminderFrequency = 'daily' | 'weekly' | 'monthly';

export interface ReminderSettings {
  enabled: boolean;
  frequency: ReminderFrequency;
}

export type ThemeMode = 'light' | 'dark';
export type Language = 'en' | 'ar';

// ─── SMS / Auto-Allocation Types ────────────────────────────────────────────

export type AllocationPriority =
  | 'lowest_target_first'
  | 'highest_target_first'
  | 'oldest_goal_first'
  | 'newest_goal_first'
  | 'nearest_deadline_first';

export interface SmsKeywords {
  deposit: string[];
  withdrawal: string[];
}

export interface GoalAllocation {
  goalId: string;
  goalName: string;
  amount: number;
}

export interface SmsTransaction {
  id: string;
  /** original SMS address + date hash used for dedup */
  smsFingerprint: string;
  sender: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  rawMessage: string;
  processedAt: string;
  /** Unix ms timestamp of the original SMS (for display) */
  smsDate: number;
  allocations: GoalAllocation[];
}

export const DEFAULT_DEPOSIT_KEYWORDS: string[] = [
  'credited',
  'deposited',
  'received',
  'added',
  'credit',
  'deposit',
  'received from',
  'payment received',
  'refund',
];

export const DEFAULT_WITHDRAWAL_KEYWORDS: string[] = [
  'debited',
  'withdrawn',
  'deducted',
  'charged',
  'debit',
  'withdrawal',
  'spend',
  'spent',
  'purchase',
  'paid',
  'sent',
];

// ─── Expense Types ────────────────────────────────────────────────────────────

export type ExpenseCategory = 'Bills' | 'Entertainment' | 'Food' | 'Transport' | 'Donations' | 'Shopping' | 'Health' | 'Education' | 'Tech' | 'Subscriptions' | 'Insurance' | 'Other';

// Sub-categories for each category
export type SubscriptionSubCategory = 'bein' | 'Netflix' | 'YouTube' | 'Spotify' | 'Apple Music' | 'Disney+' | 'Amazon Prime' | 'Facebook' | 'Discord' | 'WatchIt' | 'Shahid' | 'Anghami' | 'OSN+' | 'Club Membership' | 'Other Subs';
export type TransportSubCategory = 'Uber' | 'Careem' | 'InDrive' | 'Didi' | 'Taxi' | 'Motorcycle' | 'Bus' | 'Train' | 'Metro' | 'Flight' | 'Ship' | 'Other Transport';
export type FoodSubCategory = 'Restaurant' | 'Cafe' | 'Groceries' | 'Snacks' | 'Delivery' | 'Bakery';
export type EntertainmentSubCategory = 'Movie' | 'Theater' | 'Concert' | 'Gaming' | 'Sports' | 'Music' | 'Show';
export type DonationsSubCategory = 'Charity' | 'NGO' | 'Gifts' | 'Hospital' | 'Mosque' | 'Church' | 'Other Donations';
export type ShoppingSubCategory = 'Clothes' | 'Shoes' | 'Accessories' | 'Home' | 'Beauty';
export type HealthSubCategory = 'Medication' | 'Doctor' | 'Dentist' | 'Gym' | 'Mental Health';
export type EducationSubCategory = 'Tuition' | 'Books' | 'Course' | 'Training';
export type TechSubCategory = 'Software' | 'Hardware' | 'Gadgets' | 'Apps';
export type BillsSubCategory = 'Vodafone' | 'Orange' | 'e&' | 'WE' | 'Electricity' | 'Water' | 'Gas' | 'Internet';
export type InsuranceSubCategory = 'Medical Insurance' | 'Car Insurance' | 'Life Insurance'  | 'Travel Insurance'  | 'Property Insurance'  | 'Mobile Insurance'  | 'Other Insurance';

export type ExpenseSubCategory = 
  | SubscriptionSubCategory 
  | TransportSubCategory 
  | FoodSubCategory 
  | EntertainmentSubCategory 
  | DonationsSubCategory 
  | ShoppingSubCategory 
  | HealthSubCategory 
  | EducationSubCategory 
  | TechSubCategory
  | BillsSubCategory
  | InsuranceSubCategory;

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  subcategory?: ExpenseSubCategory;
  note?: string;
  date: string; // ISO string
  createdAt: string; // ISO string
}

export interface ExpenseStats {
  todayTotal: number;
  monthTotal: number;
  categoryTotals: Record<ExpenseCategory, number>;
  categoryPercentages: Record<ExpenseCategory, number>;
  highestCategory: ExpenseCategory | null;
  averageDailySpend: number;
}

export type ExpenseChartView = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ExpenseChartData {
  label: string;
  value: number;
  date: string; // For reference
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Bills', 'Donations', 'Education', 'Entertainment', 'Food', 'Health', 'Insurance', 'Shopping', 'Subscriptions', 'Tech', 'Transport', 'Other'];

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Bills: 'faFileInvoiceDollar',
  Donations: 'faHandHoldingHeart',
  Education: 'faBook',
  Entertainment: 'faFilm',
  Food: 'faUtensils',
  Health: 'faHeartPulse',
  Insurance: 'faShieldHalved',
  Shopping: 'faShoppingBag',
  Subscriptions: 'faReceipt',
  Tech: 'faLaptop',
  Transport: 'faCar',
  Other: 'faEllipsis',
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Bills: '#1A73E8',         // Blue
  Donations: '#E55039',     // Dark Orange-Red
  Education: '#6C5CE7',     // Purple
  Entertainment: '#FF9F43', // Orange
  Food: '#FF6B6B',          // Red
  Health: '#00B894',        // Green
  Insurance: '#c94aff',     // Violet
  Shopping: '#E84393',      // Pink
  Subscriptions: '#FDCB6E', // Yellow
  Tech: '#0984E3',          // Bright Blue
  Transport: '#4ECDC4',     // Teal
  Other: '#636E72',         // Gray
};

export const SUBCATEGORIES: Record<ExpenseCategory, ExpenseSubCategory[]> = {
  Subscriptions: ['bein', 'Netflix', 'YouTube', 'Spotify', 'Apple Music', 'Disney+', 'Amazon Prime', 'Shahid', 'WatchIt', 'Anghami', 'OSN+', 'Facebook', 'Discord', 'Club Membership', 'Other Subs'],
  Transport: ['Uber', 'Careem', 'InDrive', 'Didi', 'Taxi', 'Motorcycle', 'Bus', 'Train', 'Metro', 'Flight', 'Ship', 'Other Transport'],
  Food: ['Restaurant', 'Cafe', 'Groceries', 'Snacks', 'Delivery', 'Bakery'],
  Entertainment: ['Movie', 'Theater', 'Concert', 'Gaming', 'Sports', 'Music', 'Show'],
  Donations: ['Charity', 'NGO', 'Gifts', 'Hospital', 'Mosque', 'Church', 'Other Donations'],
  Shopping: ['Clothes', 'Shoes', 'Accessories', 'Home', 'Beauty'],
  Health: ['Medication', 'Doctor', 'Dentist', 'Gym', 'Mental Health'],
  Education: ['Tuition', 'Books', 'Course', 'Training'],
  Tech: ['Software', 'Hardware', 'Gadgets', 'Apps'],
  Bills: ['Vodafone', 'Orange', 'e&', 'WE', 'Electricity', 'Water', 'Gas', 'Internet'],
  Insurance: ['Medical Insurance', 'Car Insurance', 'Life Insurance', 'Travel Insurance', 'Property Insurance', 'Mobile Insurance', 'Other Insurance'],
  Other: [],
};

export const DEFAULT_ALLOCATION_PRIORITY: AllocationPriority = 'lowest_target_first';

// ─── SMS Poll Interval ───────────────────────────────────────────────────────

/** Interval in milliseconds between automatic inbox polls */
export type PollInterval =
  | 30_000
  | 60_000
  | 120_000
  | 300_000
  | 600_000
  | 900_000
  | 1_800_000
  | 3_600_000;

export const DEFAULT_POLL_INTERVAL: PollInterval = 60_000; // 1 min

export const POLL_INTERVAL_OPTIONS: Array<{ value: PollInterval; label: string }> = [
  { value: 30_000,     label: '30 seconds' },
  { value: 60_000,     label: '1 minute'   },
  { value: 120_000,    label: '2 minutes'  },
  { value: 300_000,    label: '5 minutes'  },
  { value: 600_000,    label: '10 minutes' },
  { value: 900_000,    label: '15 minutes' },
  { value: 1_800_000,  label: '30 minutes' },
  { value: 3_600_000,  label: '1 hour'     },
];

export const ALLOCATION_PRIORITY_OPTIONS: Array<{
  key: AllocationPriority;
  label: Record<string, string>;
  description: Record<string, string>;
}> = [
  {
    key: 'lowest_target_first',
    label: {
      en: 'Lowest Target First',
      ar: 'الأهداف الأصغر أولاً',
    },
    description: {
      en: 'Fill the smallest goal before moving on',
      ar: 'املأ الأهداف الأصغر قبل الانتقال إلى الأخرى',
    },
  },
  {
    key: 'highest_target_first',
    label: {
      en: 'Highest Target First',
      ar: 'الأهداف الأكبر أولاً',
    },
    description: {
      en: 'Fill the largest goal before moving on',
      ar: 'املأ الأهداف الأكبر قبل الانتقال إلى الأخرى',
    },
  },
  {
    key: 'oldest_goal_first',
    label: {
      en: 'Oldest Goal First',
      ar: 'الأهداف الأقدم أولاً',
    },
    description: {
      en: 'Allocate to the earliest created goal',
      ar: 'املأ الأهداف الأقدم أولاً',
    },
  },
  {
    key: 'newest_goal_first',
    label: {
      en: 'Newest Goal First',
      ar: 'الأهداف الأحدث أولاً',
    },
    description: {
      en: 'Allocate to the most recently created goal',
      ar: 'املأ الأهداف الأحدث أولاً',
    },
  },
  {
    key: 'nearest_deadline_first',
    label: {
      en: 'Nearest Deadline First',
      ar: 'الأهداف الأقرب للنهاية أولاً',
    },
    description: {
      en: 'Allocate to the goal with the closest deadline',
      ar: 'املأ الأهداف الأقرب للنهاية أولاً',
    },
  },
];
