import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import {
  validateAnthropicKey,
  validateOpenAIKey,
  validateElevenLabsKey,
  ValidationResult,
} from '../cloud/providers/keyValidation';
import { setKey, getKey, clearKey, ProviderKeyName } from '../cloud/keyStore';
import { useCompanionStore } from '../../stores/useCompanionStore';

export type ProviderKind = 'anthropic' | 'openai' | 'elevenlabs';

interface Props {
  visible: boolean;
  provider: ProviderKind;
  onClose: () => void;
}

interface ProviderMeta {
  title: string;
  blurb: string;
  consoleUrl: string;
  consoleLabel: string;
  keyName: ProviderKeyName;
  keyPlaceholder: string;
  brand: string;
  storeFlag: (v: boolean) => void;
}

export function ConnectProviderModal({ visible, provider, onClose }: Props) {
  const setAnthropic = useCompanionStore((s) => s.setAnthropicConnected);
  const setOpenAI = useCompanionStore((s) => s.setOpenAIConnected);
  const setEleven = useCompanionStore((s) => s.setElevenLabsConnected);

  const meta = providerMeta(provider, { setAnthropic, setOpenAI, setEleven });

  const [key, setKeyValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const onSave = async () => {
    if (!key.trim()) return;
    setStatus('testing');
    setMessage('');
    const validator = pickValidator(provider);
    const result: ValidationResult = await validator(key.trim());
    if (!result.ok) {
      setStatus('error');
      setMessage(result.message);
      return;
    }
    await setKey(meta.keyName, key.trim());
    meta.storeFlag(true);
    setStatus('ok');
    setMessage(result.identity ?? 'Connected.');
  };

  const onDisconnect = async () => {
    await clearKey(meta.keyName);
    meta.storeFlag(false);
    setKeyValue('');
    setStatus('idle');
    setMessage('');
  };

  const onCloseInternal = () => {
    setKeyValue('');
    setStatus('idle');
    setMessage('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onCloseInternal}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Connect {meta.title}</Text>
            <TouchableOpacity onPress={onCloseInternal} hitSlop={12}>
              <Feather name="x" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.blurb}>{meta.blurb}</Text>

          <View style={styles.stepCard}>
            <Text style={styles.stepLabel}>STEP 1</Text>
            <Text style={styles.stepBody}>
              Get an API key from your {meta.title} account.
            </Text>
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => Linking.openURL(meta.consoleUrl)}
              activeOpacity={0.7}
            >
              <Feather name="external-link" size={14} color={colors.phase.menstrual} />
              <Text style={styles.linkText}>{meta.consoleLabel}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepLabel}>STEP 2</Text>
            <Text style={styles.stepBody}>Paste it here. We store it in your phone's keychain.</Text>
            <TextInput
              style={styles.input}
              value={key}
              onChangeText={setKeyValue}
              placeholder={meta.keyPlaceholder}
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              spellCheck={false}
            />
          </View>

          {status === 'ok' ? (
            <View style={[styles.banner, styles.bannerOk]}>
              <Feather name="check-circle" size={16} color="#1f6b3a" />
              <Text style={styles.bannerOkText}>{message}</Text>
            </View>
          ) : null}

          {status === 'error' ? (
            <View style={[styles.banner, styles.bannerError]}>
              <Feather name="alert-triangle" size={16} color={colors.error} />
              <Text style={styles.bannerErrorText}>{message}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.primary, !key.trim() && styles.primaryDisabled]}
            onPress={onSave}
            disabled={!key.trim() || status === 'testing'}
            activeOpacity={0.7}
          >
            {status === 'testing' ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <>
                <Feather name="link" size={16} color={colors.text.inverse} />
                <Text style={styles.primaryText}>
                  {status === 'ok' ? 'Update key' : `Connect with ${meta.title}`}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondary} onPress={onDisconnect} activeOpacity={0.7}>
            <Text style={styles.secondaryText}>Disconnect</Text>
          </TouchableOpacity>

          <Text style={styles.footnote}>
            Your key never leaves this device except to talk to {meta.title}. It's stored in the OS
            keychain and erased by "Delete All Data."
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

function pickValidator(provider: ProviderKind) {
  switch (provider) {
    case 'anthropic':
      return validateAnthropicKey;
    case 'openai':
      return validateOpenAIKey;
    case 'elevenlabs':
      return validateElevenLabsKey;
  }
}

function providerMeta(
  provider: ProviderKind,
  flags: {
    setAnthropic: (v: boolean) => void;
    setOpenAI: (v: boolean) => void;
    setEleven: (v: boolean) => void;
  }
): ProviderMeta {
  switch (provider) {
    case 'anthropic':
      return {
        title: 'Claude',
        blurb:
          'Use Anthropic Claude as the brain behind Dadi. Best-in-class refusal patterns for health conversations.',
        consoleUrl: 'https://console.anthropic.com/account/keys',
        consoleLabel: 'Open Anthropic Console',
        keyName: 'anthropic',
        keyPlaceholder: 'sk-ant-...',
        brand: '#d97757',
        storeFlag: flags.setAnthropic,
      };
    case 'openai':
      return {
        title: 'ChatGPT',
        blurb: 'Use OpenAI (GPT-4o or any model on your account) as the brain behind Dadi.',
        consoleUrl: 'https://platform.openai.com/api-keys',
        consoleLabel: 'Open OpenAI Platform',
        keyName: 'openai',
        keyPlaceholder: 'sk-...',
        brand: '#10a37f',
        storeFlag: flags.setOpenAI,
      };
    case 'elevenlabs':
      return {
        title: 'ElevenLabs',
        blurb:
          'Use ElevenLabs for a warm, multilingual elder-woman voice. Without this, voice falls back to your phone\'s built-in TTS.',
        consoleUrl: 'https://elevenlabs.io/app/settings/api-keys',
        consoleLabel: 'Open ElevenLabs Settings',
        keyName: 'elevenlabs',
        keyPlaceholder: 'el_...',
        brand: '#000000',
        storeFlag: flags.setEleven,
      };
  }
}

// Helper for Settings to read keys without importing keyStore directly.
export async function loadProviderKeys(): Promise<{
  anthropic: string | null;
  openai: string | null;
  elevenlabs: string | null;
}> {
  const [a, o, e] = await Promise.all([
    getKey('anthropic'),
    getKey('openai'),
    getKey('elevenlabs'),
  ]);
  return { anthropic: a, openai: o, elevenlabs: e };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 80 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { ...typography.h1, color: colors.text.primary },
  blurb: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  stepCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  stepLabel: {
    ...typography.label,
    color: colors.text.secondary,
    fontSize: 11,
    letterSpacing: 1,
  },
  stepBody: { ...typography.body, color: colors.text.primary },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  linkText: { ...typography.bodySmall, color: colors.phase.menstrual },
  input: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  } as any,
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  bannerOk: { backgroundColor: '#e5f3e4' },
  bannerOkText: { ...typography.bodySmall, color: '#1f6b3a', flex: 1 },
  bannerError: { backgroundColor: '#fde2e2' },
  bannerErrorText: { ...typography.bodySmall, color: colors.error, flex: 1 },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.phase.menstrual,
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
  },
  primaryDisabled: { opacity: 0.4 },
  primaryText: { ...typography.label, color: colors.text.inverse, fontSize: 15 },
  secondary: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  secondaryText: { ...typography.bodySmall, color: colors.text.tertiary },
  footnote: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.md,
  },
});
