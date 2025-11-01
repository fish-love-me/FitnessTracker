import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function registerForPushNotificationsAsync(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('Must use physical device for Push Notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return false;
  }

  // Get push token (optional, for remote notifications)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563eb',
    });
  }

  return true;
}

/**
 * Schedule a local notification for rest timer
 */
export async function scheduleRestTimerNotification(seconds: number, exerciseName: string): Promise<string | null> {
  try {
    const hasPermission = await registerForPushNotificationsAsync();
    if (!hasPermission) {
      return null;
    }

    // Cancel any existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rest Timer Complete!',
        body: `Time to continue with ${exerciseName}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
      } as Notifications.TimeIntervalTriggerInput,
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedule daily workout reminder
 */
export async function scheduleDailyReminder(hour: number = 18, minute: number = 0): Promise<string | null> {
  try {
    const hasPermission = await registerForPushNotificationsAsync();
    if (!hasPermission) {
      return null;
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to Workout! 💪',
        body: "Don't forget your daily training session",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      } as Notifications.CalendarTriggerInput,
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
    return null;
  }
}

