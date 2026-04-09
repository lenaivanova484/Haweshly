import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Text,
  Keyboard,
  TextInput as RNTextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, SUBCATEGORIES, ExpenseSubCategory } from '../constants/types';
import { SUBCATEGORY_ICONS, IconComponent } from '../constants/subcategoryIcons';
import TextInput from './TextInput';
import Button from './Button';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { resolveIcon } from '../constants/icons';
import { useLanguage } from '../contexts/LanguageContext';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onUpdateExpense?: (id: string, expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  editingExpense?: Expense | null;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
  onAddExpense,
  onUpdateExpense,
  editingExpense,
}) => {
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const isEditing = !!editingExpense;
  const categoryScrollRef = React.useRef<ScrollView>(null);
  const subcategoryScrollRef = React.useRef<ScrollView>(null);

  const [amount, setAmount] = useState(editingExpense?.amount.toString() || '');
  const [category, setCategory] = useState<ExpenseCategory>(editingExpense?.category || 'Bills');
  const [subcategory, setSubcategory] = useState<ExpenseSubCategory | undefined>(editingExpense?.subcategory);
  const [note, setNote] = useState(editingExpense?.note || '');
  const [date, setDate] = useState(editingExpense ? new Date(editingExpense.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  React.useEffect(() => {
    if (isRTL && visible && categoryScrollRef.current) {
      setTimeout(() => categoryScrollRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [isRTL, visible]);

  React.useEffect(() => {
    if (isRTL && visible && subcategoryScrollRef.current && SUBCATEGORIES[category]?.length > 0) {
      setTimeout(() => subcategoryScrollRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [isRTL, visible, category]);

  React.useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setSubcategory(editingExpense.subcategory);
      setNote(editingExpense.note || '');
      setDate(new Date(editingExpense.date));
    }
  }, [editingExpense]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (pickerMode === 'date') {
        // User selected a date, now show time picker
        setDate(selectedDate);
        setPickerMode('time');
      } else {
        // User selected time, close picker
        setDate(selectedDate);
        setShowDatePicker(false);
        setPickerMode('date');
      }
    }
  };

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      // Invalid amount
      return;
    }

    const expenseData: Omit<Expense, 'id' | 'createdAt'> = {
      amount: parseFloat(amount),
      category,
      subcategory,
      note: note.trim() || undefined,
      date: date.toISOString(),
    };

    if (isEditing && onUpdateExpense && editingExpense) {
      onUpdateExpense(editingExpense.id, expenseData);
    } else {
      onAddExpense(expenseData);
    }

    handleClose();
  };

  const handleClose = () => {
    setAmount('');
    setCategory('Bills');
    setSubcategory(undefined);
    setNote('');
    setDate(new Date());
    setShowDatePicker(false);
    setPickerMode('date');
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose} transparent={false}>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {/* Header */}
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row', borderBottomColor: theme.cardBorder }]}>
          <TouchableOpacity onPress={handleClose} style={styles.headerLeft}>
            <Text style={[styles.headerButtonText, { color: COLORS.accent }]}>{t.cancel}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {isEditing ? t.editExpense : t.addExpense}
          </Text>
          <TouchableOpacity
            style={styles.headerRight}
            onPress={handleSave}
          >
            <Text style={[styles.headerButtonText, { color: COLORS.accent }]}>{t.save}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Amount */}
          <View style={styles.section}>
            <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left', color: theme.text }]}>{t.amount}</Text>
            <View style={[styles.amountInput, { borderColor: theme.cardBorder, backgroundColor: theme.inputBg }]}>
              <Text style={[styles.currencySymbol, { color: COLORS.accent }]}>{t.currency}</Text>
              <RNTextInput
                placeholder="0.00"
                value={amount}
                onChangeText={v => setAmount(v.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                style={[styles.amountInputField, { color: theme.text }]}
                placeholderTextColor={theme.textMuted}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left', color: theme.text }]}>{t.category}</Text>
            <ScrollView
              ref={categoryScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={[styles.categoryScroll]}
              contentContainerStyle={{flexDirection: isRTL ? 'row-reverse' : 'row', paddingHorizontal: SPACING.sm }}
            >
              {(EXPENSE_CATEGORIES).map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    {
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                      backgroundColor: category === cat ? CATEGORY_COLORS[cat] : theme.card,
                      borderColor: category === cat ? CATEGORY_COLORS[cat] : theme.cardBorder,
                      marginRight: isRTL ? 0 : SPACING.xs,
                      marginLeft: isRTL ? SPACING.xs : 0,
                    },
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setSubcategory(undefined);
                  }}
                >
                  <FontAwesomeIcon
                    icon={resolveIcon(CATEGORY_ICONS[cat])}
                    size={16}
                    color={category === cat ? '#FFFFFF' : theme.text}
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      { color: category === cat ? '#FFFFFF' : theme.text, marginLeft: isRTL ? 0 : SPACING.sm, marginRight: isRTL ? SPACING.sm : 0 },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Sub-Category */}
          {SUBCATEGORIES[category]?.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left', color: theme.text }]}>Sub-Category</Text>
              <ScrollView
                ref={subcategoryScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={[styles.subcategoryScroll]}
                contentContainerStyle={{flexDirection: isRTL ? 'row-reverse' : 'row', paddingHorizontal: SPACING.sm }}
              >
                {SUBCATEGORIES[category].map(subcat => (
                  <TouchableOpacity
                    key={subcat}
                    style={[
                      styles.subcategoryButton,
                      {
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        backgroundColor: subcategory === subcat ? CATEGORY_COLORS[category] : theme.card,
                        borderColor: subcategory === subcat ? CATEGORY_COLORS[category] : theme.cardBorder,
                        marginRight: isRTL ? 0 : SPACING.xs,
                        marginLeft: isRTL ? SPACING.xs : 0,
                      },
                    ]}
                    onPress={() => setSubcategory(subcat)}
                  >
                    <IconComponent
                      icon={SUBCATEGORY_ICONS[subcat]}
                      size={16}
                      color={subcategory === subcat ? '#FFFFFF' : theme.text}
                    />
                    <Text
                      style={[
                        styles.subcategoryButtonText,
                        { color: subcategory === subcat ? '#FFFFFF' : theme.text, marginLeft: isRTL ? 0 : SPACING.sm, marginRight: isRTL ? SPACING.sm : 0 },
                      ]}
                    >
                      {subcat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Date & Time */}
          <View style={styles.section}>
            <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left', color: theme.text }]}>{t.dateAndTime}</Text>
            <TouchableOpacity
              style={[styles.dateButton, { flexDirection: isRTL ? 'row-reverse' : 'row', borderColor: theme.cardBorder, backgroundColor: theme.card }]}
              onPress={() => setShowDatePicker(true)}
            >
              <FontAwesomeIcon
                icon={resolveIcon('faCalendar')}
                size={16}
                color={COLORS.accent}
              />
              <Text style={[styles.dateButtonText, { color: theme.text, marginLeft: isRTL ? 0 : SPACING.md, marginRight: isRTL ? SPACING.md : 0 }]}>
                {date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode={pickerMode}
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left', color: theme.text }]}>{t.note} ({t.optional})</Text>
            <TextInput
              label={isRTL ? "أضف ملاحظة..." : "Add a note..."}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              maxLength={200}
              textAlign={ isRTL ? 'right' : 'left' }
            />
          </View>

          {/* Save Button */}
          <Button
            label={isEditing ? t.editExpense : t.addExpense}
            onPress={handleSave}
            style={{ marginVertical: SPACING.lg }}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

interface ExpenseItemProps {
  expense: Expense;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onEdit, onDelete }) => {
  const { theme, isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const categoryColor = CATEGORY_COLORS[expense.category];

  return (
    <View style={[styles.expenseItem, { flexDirection: isRTL ? 'row-reverse' : 'row', backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={[styles.expenseIconContainer, { marginRight: isRTL ? 0 : SPACING.md, marginLeft: isRTL ? SPACING.md : 0, backgroundColor: expense.subcategory ? (typeof SUBCATEGORY_ICONS[expense.subcategory] != 'string' && isDark ? '#ffffff' + '30' : categoryColor + '20') : categoryColor + '20' }]}>
        {expense.subcategory ? (
          <IconComponent
            icon={SUBCATEGORY_ICONS[expense.subcategory]}
            size={20}
            color={categoryColor}
          />
        ) : (
          <FontAwesomeIcon
            icon={resolveIcon(CATEGORY_ICONS[expense.category])}
            size={20}
            color={categoryColor}
          />
        )}
      </View>

      <View style={styles.expenseContent}>
        <Text style={[styles.expenseCategory, { textAlign: isRTL ? 'right' : 'left', color: theme.text }]}>
          {expense.subcategory 
            ? `${expense.category} - ${expense.subcategory}` 
            : expense.category}
        </Text>
        {expense.note && (
          <Text style={[styles.expenseNote, { textAlign: isRTL ? 'right' : 'left', color: theme.textMuted }]} numberOfLines={1}>
            {expense.note}
          </Text>
        )}
        <Text style={[styles.expenseTime, { textAlign: isRTL ? 'right' : 'left', color: theme.textSecondary }]}>
          {new Date(expense.date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <View style={[{ alignItems: isRTL ? 'flex-start' : 'flex-end', marginLeft: isRTL ? 0 : SPACING.md, marginRight: isRTL ? SPACING.md : 0 }]}>
        <Text style={[styles.expenseAmount, { color: categoryColor }]}>
          {expense.amount.toFixed(2)} {t.currency}
        </Text>
        <View style={[styles.expenseButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.expenseButton}>
              <FontAwesomeIcon
                icon={resolveIcon('faPencil')}
                size={14}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.expenseButton}>
              <FontAwesomeIcon
                icon={resolveIcon('faTrash')}
                size={14}
                color={COLORS.error}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    marginTop: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerLeft: {
    paddingHorizontal: SPACING.md,
  },
  headerRight: {
    paddingHorizontal: SPACING.md,
  },
  headerButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  saveButtonPlaceholder: {
    flex: 0.25,
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
  },
  saveButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  section: {
    marginTop: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
  },
  currencySymbol: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginRight: SPACING.xs,
  },
  amountInputField: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  categoryScroll: {
    marginHorizontal: SPACING.xs,
  },
  categoryButton: {
    // flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    minWidth: 80,
  },
  categoryButtonText: {
    fontSize: FONT_SIZE.xs,
    // marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  subcategoryScroll: {
    marginHorizontal: SPACING.xs,
  },
  subcategoryButton: {
    // flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    minWidth: 70,
  },
  subcategoryButtonText: {
    fontSize: FONT_SIZE.xs,
    // marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  dateButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  dateButtonText: {
    fontSize: FONT_SIZE.md,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    marginVertical: SPACING.xs,
    borderWidth: 1,
  },
  expenseIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: SPACING.md,
  },
  expenseContent: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  expenseNote: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs / 2,
  },
  expenseTime: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs / 2,
  },
  expenseAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  expenseButtons: {
    gap: SPACING.sm,
  },
  expenseButton: {
    padding: SPACING.xs,
  },
});
