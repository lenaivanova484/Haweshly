import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useExpenses } from '../contexts/ExpensesContext';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { ExpenseChartView, ExpenseCategory, CATEGORY_COLORS } from '../constants/types';
import { getChartData, formatCurrency } from '../utils/expenseUtils';
import { LineChart, PieChart } from '../components/Charts';
import Card from '../components/Card';
import IconButton from '../components/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { resolveIcon } from '../constants/icons';
import { useLanguage } from '../contexts/LanguageContext';

export default function ExpenseAnalyticsScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const { expenses, stats, reload } = useExpenses();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeView, setSelectedTimeView] = useState<ExpenseChartView>('daily');
  const [selectedCategoryView, setSelectedCategoryView] = useState<'chart' | 'list'>('chart');
  const [timeChartData, setTimeChartData] = useState<any[]>([]);
  const [categoryChartData, setCategoryChartData] = useState<any[]>([]);

  const CHART_TABS: Array<{ label: string; value: ExpenseChartView }> = [
    { label: t.daily, value: 'daily' },
    { label: t.weekly, value: 'weekly' },
    { label: t.monthly, value: 'monthly' },
    { label: t.yearly, value: 'yearly' },
  ];

  // Reload on screen focus
  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload]),
  );

  // Update chart data when expenses or view changes
  useEffect(() => {
    const timeData = getChartData(expenses, selectedTimeView);
    setTimeChartData(timeData);

    // Prepare category data for pie chart
    const categoryData = (Object.entries(stats.categoryTotals) as Array<[ExpenseCategory, number]>)
      .filter(([, value]) => value > 0)
      .map(([category, value]) => ({
        name: category,
        value,
        color: CATEGORY_COLORS[category],
      }))
      .sort((a, b) => b.value - a.value);

    setCategoryChartData(categoryData);
  }, [expenses, selectedTimeView, stats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const categoryDataList = (Object.entries(stats.categoryTotals) as Array<[ExpenseCategory, number]>)
    .filter(([, value]) => value > 0)
    .map(([category, value]) => ({
      category,
      amount: value,
      percentage: stats.categoryPercentages[category],
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: theme.cardBorder}]}>
            <IconButton
                icon={isRTL ? 'faChevronRight' : 'faChevronLeft'}
                onPress={() => navigation.goBack()}
                color={theme.text}
                backgroundColor={theme.card}
            />
            <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.title, { color: theme.text }]}>{t.analytics}</Text>
            </View> 
        </View>
        

        {/* Time-Based Chart Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left', color: theme.text }]}>{t.spendingOverTime}</Text>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tabsContainer, {flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
            {(isRTL ? CHART_TABS.slice().reverse() : CHART_TABS).map(tab => (
              <TouchableOpacity
                key={tab.value}
                style={[
                  styles.tab,
                  {
                    backgroundColor: selectedTimeView === tab.value ? COLORS.accent : theme.card,
                    borderColor: selectedTimeView === tab.value ? COLORS.accent : theme.cardBorder,
                  },
                ]}
                onPress={() => setSelectedTimeView(tab.value)}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: selectedTimeView === tab.value ? '#FFFFFF' : theme.text,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Chart */}
          {timeChartData.length > 0 ? (
            <Card style={styles.chartContainer}>
              <LineChart data={timeChartData} color={COLORS.accent} />
            </Card>
          ) : (
            <Card style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { color: theme.textMuted }]}>No data for this period</Text>
            </Card>
          )}

          {/* Stats */}
          {timeChartData.length > 0 && (
            <View style={[{flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
              <Card style={{ flex: 1 }}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t.total}</Text>
                  <Text style={[styles.statValue, { color: COLORS.accent }]}>
                    {formatCurrency(timeChartData.reduce((sum, d) => sum + (d.value || 0), 0), t.currency)}
                  </Text>
                </View>
              </Card>

              <Card style={{ flex: 1, marginLeft: isRTL ? 0 : SPACING.md, marginRight: isRTL ? SPACING.md : 0 }}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t.average}</Text>
                  <Text style={[styles.statValue, { color: COLORS.info }]}>
                    {formatCurrency(
                      timeChartData.reduce((sum, d) => sum + (d.value || 0), 0) / Math.max(timeChartData.length, 1), t.currency
                    )}
                  </Text>
                </View>
              </Card>
            </View>
          )}
        </View>

        {/* Category-Based Chart Section */}
        <View style={[styles.section, { marginTop: SPACING.sm }]}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left', color: theme.text }]}>{t.spendingByCategory}</Text>

          {/* View Toggle */}
          <View style={[styles.viewToggle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                {
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  backgroundColor: selectedCategoryView === 'chart' ? COLORS.accent : theme.card,
                  borderColor: selectedCategoryView === 'chart' ? COLORS.accent : theme.cardBorder,
                },
              ]}
              onPress={() => setSelectedCategoryView('chart')}
            >
              <FontAwesomeIcon
                icon={resolveIcon('faChartPie')}
                size={16}
                color={selectedCategoryView === 'chart' ? '#FFFFFF' : theme.text}
              />
              <Text
                style={[
                  styles.viewToggleText,
                  {
                    color: selectedCategoryView === 'chart' ? '#FFFFFF' : theme.text,
                  },
                ]}
              >
                {t.chart}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                {
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  backgroundColor: selectedCategoryView === 'list' ? COLORS.accent : theme.card,
                  borderColor: selectedCategoryView === 'list' ? COLORS.accent : theme.cardBorder,
                },
              ]}
              onPress={() => setSelectedCategoryView('list')}
            >
              <FontAwesomeIcon
                icon={resolveIcon('faList')}
                size={16}
                color={selectedCategoryView === 'list' ? '#FFFFFF' : theme.text}
              />
              <Text
                style={[
                  styles.viewToggleText,
                  {
                    color: selectedCategoryView === 'list' ? '#FFFFFF' : theme.text,
                  },
                ]}
              >
                {t.list}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chart View */}
          {selectedCategoryView === 'chart' ? (
            categoryChartData.length > 0 ? (
              <Card style={styles.chartContainerCenter}>
                <PieChart data={categoryChartData} size={220} />
              </Card>
            ) : (
              <Card style={styles.noDataContainer}>
                <Text style={[styles.noDataText, { color: theme.textMuted }]}>
                  No category data yet
                </Text>
              </Card>
            )
          ) : (
            /* List View */
            <Card>
              {categoryDataList.length > 0 ? (
                categoryDataList.map((item, idx) => (
                  <View
                    key={item.category}
                    style={[
                      styles.categoryItem,
                      {
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        borderBottomColor: theme.cardBorder,
                        borderBottomWidth: idx < categoryDataList.length - 1 ? 1 : 0,
                      },
                    ]}
                  >
                    <View style={[styles.categoryItemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <View
                        style={[
                          styles.categoryDot,
                          { marginRight: isRTL ? 0 : SPACING.md, marginLeft: isRTL ? SPACING.md : 0, backgroundColor: CATEGORY_COLORS[item.category] },
                        ]}
                      />
                      <View>
                        <Text style={[styles.categoryName, { textAlign: isRTL ? 'right' : 'left', color: theme.text }]}>
                          {item.category}
                        </Text>
                        <Text style={[styles.categoryPercentage, { textAlign: isRTL ? 'right' : 'left', color: theme.textSecondary }]}>
                          {item.percentage.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.categoryAmount, { textAlign: isRTL ? 'right' : 'left', color: theme.text }]}>
                      {formatCurrency(item.amount, t.currency)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.noDataText, { color: theme.textMuted }]}>
                  No category data yet
                </Text>
              )}
            </Card>
          )}
        </View>

        {/* Insights */}
        {stats.monthTotal > 0 && (
          <View style={[styles.section, { marginVertical: SPACING.xs, marginBottom: SPACING.lg }]}>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left', color: theme.text }]}>{t.insights}</Text>
            <Card>
              <View style={[styles.insightItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <FontAwesomeIcon
                  icon={resolveIcon('faLightbulb')}
                  size={24}
                  color={COLORS.warning}
                />
                <View style={{ flex: 1, marginLeft: isRTL ? 0 : SPACING.md, marginRight: isRTL ? SPACING.md : 0 }}>
                  <Text style={[styles.insightTitle, { textAlign: isRTL ? 'right' : 'left', color: theme.text }]}>{t.monthlyOverview}</Text>
                  <Text style={[styles.insightText, { textAlign: isRTL ? 'right' : 'left', color: theme.textSecondary }]}>
                    {isRTL ? 'أنت أنفقت ' : 'You spent '}
                    {formatCurrency(stats.monthTotal, t.currency)} 
                    {isRTL ? ' هذا الشهر.\n' : ' this month.\n'}
                    {stats.highestCategory && (
                      <>
                        {isRTL ? 'تصنيفك الأعلى هو' : 'Your top category is'}
                        {' '}<Text style={{ fontWeight: '600', color: theme.text }}>{stats.highestCategory}</Text>{' '}
                        {isRTL ? 'بإجمالي ' : 'with '} 
                        {formatCurrency(stats.categoryTotals[stats.highestCategory], t.currency)}
                      </>
                    )}
                    .
                  </Text>
                </View>
              </View>
            </Card>

            {stats.averageDailySpend > 0 && (
              <Card style={{ marginTop: SPACING.md }}>
                <View style={[styles.insightItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <FontAwesomeIcon
                    icon={resolveIcon('faChartLine')}
                    size={24}
                    color={COLORS.info}
                  />
                  <View style={{ flex: 1, marginLeft: isRTL ? 0 : SPACING.md, marginRight: isRTL ? SPACING.md : 0 }}>
                    <Text style={[styles.insightTitle, { textAlign: isRTL ? 'right' : 'left', color: theme.text }]}>{t.dailyAverage}</Text>
                    <Text style={[styles.insightText, { textAlign: isRTL ? 'right' : 'left', color: theme.textSecondary }]}>
                      {isRTL ? 'أنت أنفقت في المتوسط ' : 'You spend an average of '} 
                      {formatCurrency(stats.averageDailySpend, t.currency)} 
                      {isRTL ? ' يومياً' : ' per day'}
                    </Text>
                  </View>
                </View>
              </Card>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    alignItems: 'center',
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  tabsContainer: {
    marginBottom: SPACING.md,
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginRight: SPACING.sm,
    minWidth: 70,
    alignItems: 'center',
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  chartContainer: {
    marginVertical: SPACING.md,
    paddingVertical: SPACING.xs,
    overflow: 'hidden',
  },
  chartContainerCenter: {
    marginVertical: SPACING.sm,
    overflow: 'hidden',
    alignItems: 'center',
  },
  noDataContainer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  viewToggle: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  viewToggleButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  viewToggleText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  categoryItem: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  categoryItemLeft: {
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  categoryPercentage: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs / 2,
  },
  categoryAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  insightTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  insightText: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
});
