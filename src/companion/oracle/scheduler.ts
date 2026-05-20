import * as Notifications from 'expo-notifications';

const BRIEF_TITLE = 'Dadi has something for you';

export async function scheduleMorningBrief(opts: {
  hour: number;
  minute: number;
  body?: string;
}): Promise<string | null> {
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of existing) {
    if (n.content.title === BRIEF_TITLE) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: BRIEF_TITLE,
      body: opts.body ?? 'Tap to hear your morning.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: opts.hour,
      minute: opts.minute,
    },
  });
}

export async function cancelMorningBrief(): Promise<void> {
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of existing) {
    if (n.content.title === BRIEF_TITLE) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

export function minutesToHM(minutes: number): { hour: number; minute: number } {
  return { hour: Math.floor(minutes / 60), minute: minutes % 60 };
}
