import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Card } from '../src/components/common/Card';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing, borderRadius } from '../src/theme/spacing';

const EDUCATION_MODULES = [
  {
    title: 'Understanding your 4 phases',
    description: 'The foundation of cycle intelligence. Learn what happens biologically in each phase.',
    icon: 'pie-chart',
    color: colors.phase.menstrual,
    bg: colors.phaseLight.menstrual,
  },
  {
    title: 'What is ovulation really?',
    description: 'The main event of the cycle, understood beyond fertility.',
    icon: 'sun',
    color: colors.phase.ovulation,
    bg: colors.phaseLight.ovulation,
  },
  {
    title: 'Stress and your hormones',
    description: 'How cortisol interactions affect progesterone and cycle length.',
    icon: 'activity',
    color: colors.phase.luteal,
    bg: colors.phaseLight.luteal,
  },
  {
    title: 'Traditional Wisdom: Ayurveda',
    description: 'Viewing the cycle through the lens of Vata, Pitta, and Kapha.',
    icon: 'wind',
    color: colors.phase.follicular,
    bg: colors.phaseLight.follicular,
  },
];

export default function LearnScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Education Library</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heroText}>
          Knowledge is body literacy.
        </Text>
        <Text style={styles.heroSubtext}>
          These modules are designed to help you understand your body without medical jargon. No claims, just science and context.
        </Text>

        {EDUCATION_MODULES.map((mod, index) => (
          <TouchableOpacity key={index} activeOpacity={0.8} style={styles.moduleWrapper}>
            <Card style={[styles.moduleCard, { borderLeftColor: mod.color, borderLeftWidth: 4 }]}>
              <View style={[styles.iconContainer, { backgroundColor: mod.bg }]}>
                <Feather name={mod.icon as any} size={20} color={mod.color} />
              </View>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleTitle}>{mod.title}</Text>
                <Text style={styles.moduleDesc}>{mod.description}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
            </Card>
          </TouchableOpacity>
        ))}

        {/* Mental Health Quick Tools */}
        <View style={styles.mentalHealthSection}>
          <Text style={styles.sectionTitle}>Mental Health & Support</Text>
          <Text style={styles.sectionSubtitle}>
            Cycle-linked emotional support. Not therapy, just gentle tools.
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            <Card style={styles.toolCard}>
              <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Feather name="wind" size={20} color="#1565C0" />
              </View>
              <Text style={styles.toolTitle}>Breathe</Text>
              <Text style={styles.toolDesc}>Box breathing for nervous system down-regulation</Text>
            </Card>

            <Card style={styles.toolCard}>
              <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                <Feather name="anchor" size={20} color="#7B1FA2" />
              </View>
              <Text style={styles.toolTitle}>Grounding</Text>
              <Text style={styles.toolDesc}>5-4-3-2-1 anxiety reduction technique</Text>
            </Card>

            <Card style={styles.toolCard}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF8E1' }]}>
                <Feather name="book-open" size={20} color="#F57F17" />
              </View>
              <Text style={styles.toolTitle}>Journal</Text>
              <Text style={styles.toolDesc}>Phase-specific prompts for difficult days</Text>
            </Card>
          </ScrollView>
        </View>

        <Text style={styles.disclaimer}>
          The content inside the library is for educational purposes and should not be taken as medical advice. Always consult a healthcare provider for medical concerns.
        </Text>
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
    color: colors.phase.luteal,
    marginBottom: spacing.xs,
  },
  heroSubtext: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  moduleWrapper: {
    marginBottom: spacing.md,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  moduleInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  moduleTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 2,
    fontSize: 16,
  },
  moduleDesc: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  mentalHealthSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  hScroll: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  toolCard: {
    width: 140,
    padding: spacing.md,
  },
  toolTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  toolDesc: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
    lineHeight: 16,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
});
