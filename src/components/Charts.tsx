import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, {
  Rect,
  G,
  Text as SvgText,
  Line,
  Circle,
  Path,
} from 'react-native-svg';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { ExpenseChartData } from '../constants/types';

const CHART_WIDTH = 325;
const CHART_HEIGHT = 275;
const PADDING = SPACING.lg;
const Y_LABEL_WIDTH = 24;
const BAR_RADIUS = 8;

/**
 * Format a Y-axis number into a readable string.
 * Whole numbers stay as-is; large values are abbreviated (1K, 10K, etc.)
 */
function formatYLabel(value: number): string {
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(Math.round(value));
}

/**
 * Compute a clean Y-axis scale.
 * Always returns integer step/max values so labels are never decimals.
 * Falls back to 0-10 / step-2 when all data is zero.
 */
function computeYScale(dataMax: number): { max: number; step: number } {
  if (dataMax <= 0) {
    return { max: 10, step: 2 };
  }
  const targetSteps = 5;
  const rawStep = dataMax / targetSteps;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = Math.max(1, Math.ceil(rawStep / magnitude) * magnitude);
  const max = Math.ceil(dataMax / step) * step;
  return { max, step };
}

/**
 * Decide which X-axis indices to show labels for so they never overlap.
 */
function visibleXIndices(total: number, maxLabels: number): Set<number> {
  if (total <= maxLabels) {
    return new Set(Array.from({ length: total }, (_, i) => i));
  }
  const indices = new Set<number>();
  indices.add(0);
  indices.add(total - 1);
  const step = Math.ceil((total - 1) / (maxLabels - 1));
  for (let i = step; i < total - 1; i += step) {
    indices.add(i);
  }
  return indices;
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

interface BarChartProps {
  data: ExpenseChartData[];
  maxValue?: number;
  animate?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({ data, maxValue }) => {
  const { theme } = useTheme();

  const chartLeft = PADDING + Y_LABEL_WIDTH;
  const chartRight = CHART_WIDTH - PADDING;
  const chartTop = PADDING;
  const chartBottom = CHART_HEIGHT - PADDING - 40;
  const chartAreaWidth = chartRight - chartLeft;
  const chartAreaHeight = chartBottom - chartTop;

  if (data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No data available</Text>
      </View>
    );
  }

  const dataMax = maxValue ?? Math.max(...data.map(d => d.value), 0);
  const { max, step } = computeYScale(dataMax);
  const barWidth = chartAreaWidth / data.length - 4;

  const ySteps: number[] = [];
  for (let val = 0; val <= max; val += step) {
    ySteps.push(Math.round(val));
  }

  const maxLabels = Math.floor(chartAreaWidth / 28);
  const visibleX = visibleXIndices(data.length, maxLabels);

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartBottom} stroke={theme.cardBorder} strokeWidth={1} />
        <Line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom} stroke={theme.cardBorder} strokeWidth={1} />

        {ySteps.map((value, idx) => {
          const ratio = value / max;
          const y = chartBottom - chartAreaHeight * ratio;
          return (
            <G key={`grid-${idx}`}>
              <Line x1={chartLeft} y1={y} x2={chartRight} y2={y} stroke={theme.cardBorder} strokeWidth={0.5} opacity={0.3} />
              <SvgText x={chartLeft - 6} y={y} fontSize={FONT_SIZE.xs} fill={theme.textSecondary} textAnchor="end" dy=".3em">
                {formatYLabel(value)}
              </SvgText>
            </G>
          );
        })}

        {data.map((item, idx) => {
          const barHeight = (item.value / max) * chartAreaHeight;
          const x = chartLeft + idx * (barWidth + 4) + 2;
          const y = chartBottom - barHeight;
          return (
            <G key={`bar-${idx}`}>
              <Rect x={x} y={y} width={barWidth} height={barHeight} fill={COLORS.accent} rx={BAR_RADIUS} ry={BAR_RADIUS} opacity={0.8} />
              {visibleX.has(idx) && (
                <SvgText x={x + barWidth / 2} y={chartBottom + 20} fontSize={FONT_SIZE.xs} fill={theme.textSecondary} textAnchor="middle">
                  {item.label}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

// ─── Pie Chart ────────────────────────────────────────────────────────────────

interface PieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  size?: number;
}

export const PieChart: React.FC<PieChartProps> = ({ data, size = 200 }) => {
  const { theme } = useTheme();
  const radius = size / 2;
  const centerX = (size + 20) / 2;
  const centerY = (size + 20) / 2;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0 || total === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No data available</Text>
      </View>
    );
  }

  // ✅ Single item — draw a full circle instead of Arc
  if (data.length === 1) {
    return (
      <View style={[styles.pieWrapper, { backgroundColor: theme.card }]}>
        <Svg width={size + 20} height={size + 20} viewBox={`0 0 ${size + 20} ${size + 20}`}>
          <Circle cx={centerX} cy={centerY} r={radius} fill={data[0].color} />
          <SvgText
            x={centerX}
            y={centerY}
            fontSize={FONT_SIZE.sm}
            fill="white"
            fontWeight="bold"
            textAnchor="middle"
            dy=".3em"
          >
            100%
          </SvgText>
        </Svg>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: data[0].color }]} />
            <Text style={[styles.legendLabel, { color: theme.text }]} numberOfLines={1}>
              {data[0].name}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Multiple items — normal Arc slices
  let currentAngle = -90;

  const slices = data.map((item, idx) => {
    const percentage = (item.value / total) * 100;
    const sliceAngle = (item.value / total) * 360;
    const endAngle = currentAngle + sliceAngle;

    const startRad = (currentAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = `
      M ${centerX} ${centerY}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      Z
    `;

    const labelAngle = currentAngle + sliceAngle / 2;
    const labelRad = (labelAngle * Math.PI) / 180;
    const labelRadius = radius * 0.65;
    const labelX = centerX + labelRadius * Math.cos(labelRad);
    const labelY = centerY + labelRadius * Math.sin(labelRad);

    currentAngle = endAngle;

    return (
      <G key={`slice-${idx}`}>
        <Path d={pathData} fill={item.color} />
        {percentage > 10 && (
          <SvgText
            x={labelX}
            y={labelY}
            fontSize={FONT_SIZE.sm}
            fill="white"
            fontWeight="bold"
            textAnchor="middle"
            dy=".3em"
          >
            {percentage.toFixed(0)}%
          </SvgText>
        )}
      </G>
    );
  });

  return (
    <View style={[styles.pieWrapper, { backgroundColor: theme.card }]}>
      <Svg width={size + 20} height={size + 20} viewBox={`0 0 ${size + 20} ${size + 20}`}>
        {slices}
      </Svg>
      <View style={styles.legend}>
        {data.map((item, idx) => (
          <View key={`legend-${idx}`} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendLabel, { color: theme.text }]} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Line Chart ───────────────────────────────────────────────────────────────

interface LineChartProps {
  data: ExpenseChartData[];
  maxValue?: number;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  maxValue,
  color = COLORS.accent,
}) => {
  const { theme } = useTheme();

  const chartLeft = PADDING + Y_LABEL_WIDTH;
  const chartRight = CHART_WIDTH - PADDING;
  const chartTop = PADDING;
  const chartBottom = CHART_HEIGHT - PADDING - 40;
  const chartAreaWidth = chartRight - chartLeft;
  const chartAreaHeight = chartBottom - chartTop;

  if (data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No data available</Text>
      </View>
    );
  }

  const dataMax = maxValue ?? Math.max(...data.map(d => d.value), 0);
  const { max, step } = computeYScale(dataMax);
  const xStep = chartAreaWidth / (data.length - 1 || 1);
  const scale = chartAreaHeight / max;

  const ySteps: number[] = [];
  for (let val = 0; val <= max; val += step) {
    ySteps.push(Math.round(val));
  }

  const maxLabels = Math.floor(chartAreaWidth / 28);
  const visibleX = visibleXIndices(data.length, maxLabels);

  const points = data.map((item, idx) => ({
    x: chartLeft + idx * xStep,
    y: chartBottom - item.value * scale,
  }));

  let pathData = '';
  points.forEach((point, idx) => {
    pathData += idx === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`;
  });

  let areaPathData = `M ${points[0].x} ${points[0].y}`;
  points.forEach((point, idx) => {
    if (idx > 0) areaPathData += ` L ${point.x} ${point.y}`;
  });
  areaPathData += ` L ${points[points.length - 1].x} ${chartBottom}`;
  areaPathData += ` L ${points[0].x} ${chartBottom} Z`;

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartBottom} stroke={theme.cardBorder} strokeWidth={1} />
        <Line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom} stroke={theme.cardBorder} strokeWidth={1} />

        <Path d={areaPathData} fill={color} opacity={0.1} />
        <Path d={pathData} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((point, idx) => (
          <Circle key={`dot-${idx}`} cx={point.x} cy={point.y} r={3.5} fill={color} />
        ))}

        {data.map((item, idx) =>
          visibleX.has(idx) ? (
            <SvgText key={`xlabel-${idx}`} x={points[idx].x} y={chartBottom + 20} fontSize={FONT_SIZE.xs} fill={theme.text} textAnchor="middle">
              {item.label}
            </SvgText>
          ) : null
        )}

        {ySteps.map((value, idx) => {
          const ratio = value / max;
          const y = chartBottom - chartAreaHeight * ratio;
          return (
            <SvgText key={`ylabel-${idx}`} x={chartLeft - 6} y={y} fontSize={FONT_SIZE.xs} fill={theme.textSecondary} textAnchor="end" dy=".3em">
              {formatYLabel(value)}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    alignItems: 'center',
  },
  pieWrapper: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    marginVertical: SPACING.lg,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    alignContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    minWidth: 80,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.full,
  },
  legendLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
    flexShrink: 1,
  },
});