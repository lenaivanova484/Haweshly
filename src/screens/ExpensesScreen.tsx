import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useExpenses } from '../contexts/ExpensesContext';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { Expense } from '../constants/types';
import { groupExpensesByDay, formatDateLabel, getDayTotal, formatCurrency } from '../utils/expenseUtils';
import { AddExpenseModal, ExpenseItem } from '../components/ExpenseComponents';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { resolveIcon } from '../constants/icons';
import Card from '../components/Card';
import { useLanguage } from '../contexts/LanguageContext';

export default function ExpensesScreen() {
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const { expenses, stats, addExpense, updateExpense, deleteExpense, reload } = useExpenses();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [groupedExpenses, setGroupedExpenses] = useState<Record<string, Expense[]>>({});

  // Reload on screen focus
  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload]),
  );

  // Update grouped expenses when expenses change
  useEffect(() => {
    const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setGroupedExpenses(groupExpensesByDay(sorted));
  }, [expenses]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const handleAddExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    addExpense(expense);
    setModalVisible(false);
  };

  const handleUpdateExpense = (id: string, expense: Omit<Expense, 'id' | 'createdAt'>) => {
    updateExpense(id, expense);
    setEditingExpense(null);
    setModalVisible(false);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setModalVisible(true);
  };

  const handleDeleteExpense = (id: string) => {
    Alert.alert(
      t.deleteExpense,
      t.confirmDeleteExpense,
      [
        { text: t.cancel, onPress: () => {}, style: 'cancel' },
        {
          text: t.delete,
          onPress: () => deleteExpense(id),
          style: 'destructive',
        },
      ],
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingExpense(null);
  };

  const groupedKeys = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a));

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row', borderBottomColor: theme.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t.expenses}</Text>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('ExpenseAnalytics')}
          style={[styles.headerButton, { flexDirection: isRTL ? 'row-reverse' : 'row', borderColor: COLORS.accent }]}
        >
          <FontAwesomeIcon icon={resolveIcon('faChartLine')} size={16} color={COLORS.accent} />
          <Text style={[styles.headerButtonText, { color: COLORS.accent }]}>{t.analytics}</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.statsContainer, {flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t.today}</Text>
              <Text style={[styles.statValue, { color: COLORS.accent }]}>
                {formatCurrency(stats.todayTotal, t.currency)}
              </Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t.thisMonth}</Text>
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                {formatCurrency(stats.monthTotal, t.currency)}
              </Text>
            </View>
          </Card>
        </View>

        {/* Average Daily Spend */}
        {stats.monthTotal > 0 && (
          <Card style={[styles.insightCard, { marginTop: 0 }]}>
            <View style={[styles.insightRow, { flexDirection: !isRTL ? 'row-reverse' : 'row' }]}>
              <View>
                <Text style={[styles.insightLabel, { color: theme.textSecondary }]}>{t.dailyAverage}</Text>
                <Text style={[styles.insightValue, { color: theme.text }]}>
                  {formatCurrency(stats.averageDailySpend, t.currency)}
                </Text>
              </View>
              {stats.highestCategory && (
                <View style={[{ alignItems: !isRTL ? 'flex-start' : 'flex-end' }]}>
                  <Text style={[styles.insightLabel, { color: theme.textSecondary }]}>{t.topCategory}</Text>
                  <Text style={[styles.insightValue, { color: theme.text }]}>
                    {stats.highestCategory}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Expenses List */}
        {groupedKeys.length > 0 ? (
          <View style={styles.expensesSection}>
            {groupedKeys.map(dateKey => {
              const dayExpenses = groupedExpenses[dateKey];
              const dayTotal = getDayTotal(dayExpenses, new Date(dateKey));

              return (
                <View key={dateKey} style={styles.dayGroup}>
                  <View style={[styles.dayHeader, { flexDirection: isRTL ? 'row-reverse' : 'row', borderBottomColor: theme.cardBorder }]}>
                    <View>
                      <Text style={[styles.dayLabel, { color: theme.text }]}>
                        {formatDateLabel(dateKey)}
                      </Text>
                    </View>
                    <Text style={[styles.dayTotal, { color: COLORS.accent }]}>
                      {formatCurrency(dayTotal, t.currency)}
                    </Text>
                  </View>
                  {dayExpenses.map(expense => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      onEdit={() => handleEditExpense(expense)}
                      onDelete={() => handleDeleteExpense(expense.id)}
                    />
                  ))}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <FontAwesomeIcon
              icon={resolveIcon('faWallet')}
              size={48}
              color={theme.textMuted}
            />
            <Text style={[styles.emptyStateText, { color: theme.text }]}>
              {t.noExpenses}
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.textMuted }]}>
              {t.addExpense}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.fab, { left: isRTL ? SPACING.lg : undefined, right: isRTL ? undefined : SPACING.lg, backgroundColor: COLORS.accent }]}
        onPress={() => {
          setEditingExpense(null);
          setModalVisible(true);
        }}
      >
        <FontAwesomeIcon icon={resolveIcon('faPlus')} size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal */}
      <AddExpenseModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onAddExpense={handleAddExpense}
        onUpdateExpense={handleUpdateExpense}
        editingExpense={editingExpense}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
  },
  headerButton: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  headerButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  statValue: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  insightCard: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.xs,
  },
  insightRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightRight: {
    alignItems: 'flex-end',
  },
  insightLabel: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  insightValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  expensesSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  dayGroup: {
    marginVertical: SPACING.sm,
  },
  dayHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    marginBottom: SPACING.sm,
  },
  dayLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  dayTotal: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.sm,
  },
});
