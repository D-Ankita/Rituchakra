import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { Canvas, Path, Skia, LinearGradient, vec, Circle } from '@shopify/react-native-skia';
import { Card } from '../../src/components/common/Card';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { useCycleStore } from '../../src/stores/useCycleStore';
import { generateHormoneCurve, HormonePoint } from '../../src/engine/hormoneEstimator';
import { PHASE_LABELS } from '../../src/types/phase';
import { Phase } from '../../src/types/phase';
import { generateInsightPatterns, Pattern } from '../../src/engine/PatternCorrelation';
import { getAllLogs } from '../../src/db/helpers/dailyLogHelpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CHART_HEIGHT = 220;
const CHART_PADDING = 20;

function buildSmoothPath(
  points: { x: number; y: number }[],
  width: number,
  height: number
): string {
  if (points.length < 2) return '';

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }

  return d;
}

function buildFilledPath(
  points: { x: number; y: number }[],
  height: number
): string {
  const curvePath = buildSmoothPath(points, 0, height);
  if (!curvePath) return '';
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  return `${curvePath} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`;
}

function HormoneCurveChart({
  cycleLength,
  currentDay,
}: {
  cycleLength: number;
  currentDay: number;
}) {
  const data = generateHormoneCurve(cycleLength);

  const toCanvasPoints = (
    points: HormonePoint[],
    key: keyof Omit<HormonePoint, 'day'>
  ) =>
    points.map((p) => ({
      x:
        CHART_PADDING +
        ((p.day - 1) / (cycleLength - 1)) *
          (CHART_WIDTH - CHART_PADDING * 2),
      y:
        CHART_HEIGHT -
        CHART_PADDING -
        p[key] * (CHART_HEIGHT - CHART_PADDING * 2),
    }));

  const estrogenPoints = toCanvasPoints(data, 'estrogen');
  const progesteronePoints = toCanvasPoints(data, 'progesterone');
  const energyPoints = toCanvasPoints(data, 'energy');

  const estrogenFilled = Skia.Path.MakeFromSVGString(
    buildFilledPath(estrogenPoints, CHART_HEIGHT)
  );
  const estrogenLine = Skia.Path.MakeFromSVGString(
    buildSmoothPath(estrogenPoints, CHART_WIDTH, CHART_HEIGHT)
  );
  const progesteroneFilled = Skia.Path.MakeFromSVGString(
    buildFilledPath(progesteronePoints, CHART_HEIGHT)
  );
  const progesteroneLine = Skia.Path.MakeFromSVGString(
    buildSmoothPath(progesteronePoints, CHART_WIDTH, CHART_HEIGHT)
  );
  const energyLine = Skia.Path.MakeFromSVGString(
    buildSmoothPath(energyPoints, CHART_WIDTH, CHART_HEIGHT)
  );

  const markerX =
    CHART_PADDING +
    ((currentDay - 1) / (cycleLength - 1)) *
      (CHART_WIDTH - CHART_PADDING * 2);

  // Find energy at current day
  const currentEnergy = data.find((d) => d.day === currentDay);
  const markerY = currentEnergy
    ? CHART_HEIGHT -
      CHART_PADDING -
      currentEnergy.energy * (CHART_HEIGHT - CHART_PADDING * 2)
    : CHART_HEIGHT / 2;

  return (
    <Canvas style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
      {/* Estrogen fill */}
      {estrogenFilled && (
        <Path path={estrogenFilled} style="fill">
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, CHART_HEIGHT)}
            colors={['rgba(199, 85, 111, 0.25)', 'rgba(199, 85, 111, 0.0)']}
          />
        </Path>
      )}
      {/* Estrogen line */}
      {estrogenLine && (
        <Path
          path={estrogenLine}
          style="stroke"
          strokeWidth={2.5}
          color={colors.hormone.estrogen}
        />
      )}

      {/* Progesterone fill */}
      {progesteroneFilled && (
        <Path path={progesteroneFilled} style="fill">
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, CHART_HEIGHT)}
            colors={['rgba(123, 158, 107, 0.25)', 'rgba(123, 158, 107, 0.0)']}
          />
        </Path>
      )}
      {/* Progesterone line */}
      {progesteroneLine && (
        <Path
          path={progesteroneLine}
          style="stroke"
          strokeWidth={2.5}
          color={colors.hormone.progesterone}
        />
      )}

      {/* Energy line (dashed) */}
      {energyLine && (
        <Path
          path={energyLine}
          style="stroke"
          strokeWidth={1.5}
          color={colors.hormone.energy}
          strokeCap="round"
        />
      )}

      {/* Current day marker */}
      <Circle cx={markerX} cy={markerY} r={6} color={colors.phase.menstrual} />
      <Circle cx={markerX} cy={markerY} r={3} color="white" />
    </Canvas>
  );
}

export default function InsightsScreen() {
  const currentPhase = useCycleStore((s) => s.currentPhase);
  const currentCycleDay = useCycleStore((s) => s.currentCycleDay);
  const cycleLength = useCycleStore((s) => s.cycleLength);
  const completedCycleCount = useCycleStore((s) => s.completedCycleCount);

  const [patterns, setPatterns] = useState<Pattern[]>([]);

  useEffect(() => {
    async function loadPatterns() {
      if (completedCycleCount >= 3) {
        const rawLogs = await getAllLogs();
        // map flat string logs to strongly typed arrays
        const parsed = rawLogs.map((l: any) => ({
          ...l,
          symptoms: l.symptoms ? JSON.parse(l.symptoms) : [],
        }));
        const results = generateInsightPatterns(parsed, completedCycleCount);
        setPatterns(results);
      }
    }
    loadPatterns();
  }, [completedCycleCount]);

  const getIconForPattern = (type: string) => {
    switch(type) {
        case 'sleep': return 'moon';
        case 'energy': return 'zap';
        case 'symptom': return 'thermometer';
        default: return 'activity';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>Insights</Text>
          <Feather name="activity" size={22} color={colors.phase.menstrual} />
        </View>

        {/* Hormone Curves */}
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Hormone Patterns</Text>
          <Text style={styles.cardSubtitle}>
            Educational estimate based on your {cycleLength}-day cycle
          </Text>

          <HormoneCurveChart
            cycleLength={cycleLength}
            currentDay={currentCycleDay}
          />

          {/* Legend */}
          <View style={styles.chartLegend}>
            <View style={styles.legendRow}>
              <View
                style={[
                  styles.legendLine,
                  { backgroundColor: colors.hormone.estrogen },
                ]}
              />
              <Text style={styles.legendLabel}>Estrogen</Text>
            </View>
            <View style={styles.legendRow}>
              <View
                style={[
                  styles.legendLine,
                  { backgroundColor: colors.hormone.progesterone },
                ]}
              />
              <Text style={styles.legendLabel}>Progesterone</Text>
            </View>
            <View style={styles.legendRow}>
              <View
                style={[
                  styles.legendLineDashed,
                  { backgroundColor: colors.hormone.energy },
                ]}
              />
              <Text style={styles.legendLabel}>Energy</Text>
            </View>
          </View>
        </Card>

        {/* Phase Breakdown */}
        <Card>
          <Text style={styles.cardTitle}>Current Cycle</Text>
          <View style={styles.phaseBar}>
            {(['menstrual', 'follicular', 'ovulation', 'luteal'] as Phase[]).map(
              (phase) => {
                const isActive = phase === currentPhase;
                return (
                  <View
                    key={phase}
                    style={[
                      styles.phaseSegment,
                      {
                        backgroundColor: isActive
                          ? colors.phase[phase]
                          : colors.phaseLight[phase],
                        flex: phase === 'ovulation' ? 0.5 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.phaseSegmentText,
                        isActive && { color: colors.text.inverse },
                      ]}
                      numberOfLines={1}
                    >
                      {PHASE_LABELS[phase].slice(0, 4)}
                    </Text>
                  </View>
                );
              }
            )}
          </View>
          <Text style={styles.phaseInfo}>
            You're in the{' '}
            <Text style={{ fontWeight: '600', color: colors.phase[currentPhase] }}>
              {PHASE_LABELS[currentPhase]}
            </Text>{' '}
            phase (Day {currentCycleDay} of {cycleLength})
          </Text>
        </Card>

        {/* Personal Patterns */}
        {completedCycleCount >= 3 ? (
          <Card>
            <Text style={styles.cardTitle}>Personal Patterns</Text>
            <Text style={styles.patternText}>
              Based on {completedCycleCount} completed cycles, your patterns
              are becoming clearer. Keep tracking for deeper insights.
            </Text>
            
            <View style={styles.insightDivider} />
            
            {patterns.length > 0 ? (
                patterns.map((p, i) => (
                    <View key={i} style={styles.patternPoint}>
                       <Feather name={getIconForPattern(p.type)} size={16} color={colors.phase.follicular} style={styles.patternIcon} />
                       <Text style={styles.patternPointText}>{p.finding}</Text>
                    </View>
                ))
            ) : (
                <View style={styles.patternPoint}>
                   <Feather name="activity" size={16} color={colors.text.tertiary} style={styles.patternIcon} />
                   <Text style={[styles.patternPointText, { color: colors.text.secondary }]}>Gathering more pattern data. Your cycle is currently highly stable without deep deviations.</Text>
                </View>
            )}
          </Card>
        ) : (
          <Card>
            <Text style={styles.cardTitle}>Building Your Pattern</Text>
            <Text style={styles.patternText}>
              Track {3 - completedCycleCount} more complete cycle
              {3 - completedCycleCount > 1 ? 's' : ''} to unlock
              personalized pattern insights.
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { flex: completedCycleCount / 3 },
                ]}
              />
              <View
                style={[
                  styles.progressEmpty,
                  { flex: (3 - completedCycleCount) / 3 },
                ]}
              />
            </View>
            <Text style={styles.cycleCountText}>
              {completedCycleCount}/3 cycles
            </Text>
          </Card>
        )}

        {/* Phase-Based Lifestyle Suggestions */}
        <Card>
          <Text style={styles.cardTitle}>Lifestyle Sync</Text>
          <View style={styles.lifestyleRow}>
            <View style={[styles.lifestyleIconContainer, { backgroundColor: colors.phaseLight[currentPhase] }]}>
              <Feather name="coffee" size={18} color={colors.phase[currentPhase]} />
            </View>
            <View style={styles.lifestyleInfo}>
              <Text style={styles.lifestyleLabel}>Nutrition</Text>
              <Text style={styles.lifestyleDesc}>
                {currentPhase === 'menstrual' && 'Iron-rich foods (spinach, lentils) replenish needed minerals.'}
                {currentPhase === 'follicular' && 'Lighter, fresh foods complement rising energy levels.'}
                {currentPhase === 'ovulation' && 'Stay highly hydrated. Social energy peaks.'}
                {currentPhase === 'luteal' && 'Magnesium-rich foods (dark chocolate, nuts) can ease cramping.'}
              </Text>
            </View>
          </View>
          
          <View style={styles.lifestyleRow}>
            <View style={[styles.lifestyleIconContainer, { backgroundColor: colors.phaseLight[currentPhase] }]}>
              <Feather name="activity" size={18} color={colors.phase[currentPhase]} />
            </View>
            <View style={styles.lifestyleInfo}>
              <Text style={styles.lifestyleLabel}>Movement</Text>
              <Text style={styles.lifestyleDesc}>
                {currentPhase === 'menstrual' && 'Gentle stretch, restorative yoga, or slow walks.'}
                {currentPhase === 'follicular' && 'Strength training and trying new active hobbies.'}
                {currentPhase === 'ovulation' && 'High-intensity interval training, group classes.'}
                {currentPhase === 'luteal' && 'Pilates, walking, and winding down to lighter weights.'}
              </Text>
            </View>
          </View>
        </Card>


        {/* Disclaimer */}
        <Card style={styles.disclaimerCard}>
          <View style={styles.disclaimerRow}>
            <Feather name="info" size={14} color={colors.text.tertiary} style={styles.disclaimerIcon} />
            <Text style={styles.disclaimer}>
              These visualizations are educational estimates, not medical data.
              Actual hormone levels vary between individuals.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  chartCard: {
    paddingBottom: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 0,
  },
  cardTitle: {
    ...typography.label,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendLine: {
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  legendLineDashed: {
    width: 20,
    height: 2,
    borderRadius: 1,
    opacity: 0.8,
  },
  legendLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  phaseBar: {
    flexDirection: 'row',
    height: 36,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    gap: 3,
  },
  phaseSegment: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  phaseSegmentText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  phaseInfo: {
    ...typography.body,
    color: colors.text.secondary,
  },
  patternText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  insightDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  patternPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  patternIcon: {
    marginTop: 2,
    marginRight: spacing.sm,
  },
  patternPointText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  lifestyleRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  lifestyleIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  lifestyleInfo: {
    flex: 1,
  },
  lifestyleLabel: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  lifestyleDesc: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  progressBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.divider,
  },
  progressFill: {
    backgroundColor: colors.phase.menstrual,
    borderRadius: 4,
  },
  progressEmpty: {
    backgroundColor: colors.divider,
  },
  cycleCountText: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  disclaimerCard: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 0,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  disclaimerIcon: {
    marginTop: 1,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 18,
  },
});
