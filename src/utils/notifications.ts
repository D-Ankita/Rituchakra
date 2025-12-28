import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function schedulePeriodReminder(predictedStart: Date) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const reminderDate = new Date(predictedStart);
  reminderDate.setDate(reminderDate.getDate() - 2);

  if (reminderDate <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your period may be approaching',
      body: 'Based on your cycle patterns, your period may start in about 2 days.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });
}

export async function scheduleDailyLogReminder(hour: number, minute: number) {
  const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const dailyReminders = existingNotifications.filter(
    (n) => n.content.title === 'How are you feeling today?'
  );
  for (const n of dailyReminders) {
    await Notifications.cancelScheduledNotificationAsync(n.identifier);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'How are you feeling today?',
      body: 'Take a moment to log your day.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
