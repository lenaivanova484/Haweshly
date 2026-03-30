import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { resolveIcon } from '../constants/icons';

interface DatePickerInputProps {
  label: string;
  value: string; // ISO date string YYYY-MM-DD
  onChange: (date: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder = 'Select date',
  required = false,
  textAlign = 'left',
}) => {
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );

  const handleDateChange = (_: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
      onChange(dateString);
    }
    setShowPicker(false);
    onBlur?.();
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return placeholder;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return placeholder;
    }
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <View style={[styles.labelRow, { flexDirection: textAlign === 'right' ? 'row-reverse' : 'row' }]}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </Text>
        {required && <Text style={styles.required}> *</Text>}
      </View>

      {/* Date Button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            flexDirection: textAlign === 'right' ? 'row-reverse' : 'row',
            backgroundColor: theme.inputBg,
            borderColor: error ? COLORS.error : theme.cardBorder,
          },
        ]}
        onPress={() => setShowPicker(true)}
      >
        <FontAwesomeIcon
          icon={resolveIcon('faCalendar')}
          size={16}
          color={COLORS.accent}
        />
        <Text style={[styles.buttonText, { color: value ? theme.text : theme.textMuted, textAlign }]}>
          {formatDisplayDate(value)}
        </Text>
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <Text style={[styles.error, { textAlign: textAlign, color: COLORS.error }]}>
          {error}
        </Text>
      )}

      {/* Date Picker Modal */}
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  labelRow: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  required: {
    color: COLORS.error,
    fontSize: FONT_SIZE.md,
  },
  button: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.md,
  },
  buttonText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
  },
  error: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});
