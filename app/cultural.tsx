import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Card } from '../src/components/common/Card';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing, borderRadius } from '../src/theme/spacing';

export default function CulturalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cultural Intelligence</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heroText}>
          Real life requires real planning.
        </Text>
        <Text style={styles.heroSubtext}>
          These tools help you integrate your cycle awareness with cultural events, travel, fasting, and workplace demands.
        </Text>

        {/* Travel Planning */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Feather name="map" size={18} color="#1565C0" />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.cardTitle}>Period + Travel Planning</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
          </View>
          <Text style={styles.cardDesc}>
            Check phase-aware preparedness checklists and emergency comfort tips for jet lag and long travel days.
          </Text>
        </Card>

        {/* Fasting */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Feather name="sunrise" size={18} color="#E65100" />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.cardTitle}>Fasting Awareness</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
          </View>
          <Text style={styles.cardDesc}>
            Phase-aware safety nudges. Find hydration and electrolyte reminders to help support you during fasts.
          </Text>
        </Card>

        {/* Festival & Wedding */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#FCE4EC' }]}>
              <Feather name="heart" size={18} color="#C2185B" />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.cardTitle}>Festivals & Weddings</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
          </View>
          <Text style={styles.cardDesc}>
            Prepare for multi-day events with subtle energy management guidance and cycle stability preparation.
          </Text>
        </Card>

        {/* Workplace */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Feather name="briefcase" size={18} color="#2E7D32" />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.cardTitle}>Workplace Awareness</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
          </View>
          <Text style={styles.cardDesc}>
            Sync heavy meeting days and presentations with your energy peaks. Discreet workplace packs and tips.
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroText: {
    ...typography.h2,
    color: colors.phase.menstrual,
    marginBottom: spacing.xs,
  },
  heroSubtext: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontSize: 16,
  },
  cardDesc: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
