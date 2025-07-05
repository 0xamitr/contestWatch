// utils/notifications.ts

import AsyncStorage from '@react-native-async-storage/async-storage'; // Assuming you use AsyncStorage for your data
import * as Notifications from 'expo-notifications';

// 1. Set the notification handler
// This determines how notifications behave when your app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true, // Play a sound
    shouldSetBadge: false, // Don't modify the app badge
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// A unique identifier for your daily notification
const DAILY_MEMO_NOTIFICATION_IDENTIFIER = 'daily-7am-memory-notification';

// 2. Request Notification Permissions
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Permission to send notifications was denied!');
    return false; // Indicate that permission was not granted
  }
  return true; // Indicate that permission was granted
}

// 3. Schedule the Daily Memo Notification
export async function scheduleDailyMemoNotification() {
  console.log("⏰ Scheduling daily memo notification");

  const permissionsGranted = await requestNotificationPermissions();
  console.log("Permissions inside scheduler:", permissionsGranted);

  if (!permissionsGranted) {
    console.warn("Permission not granted inside scheduler");
    return;
  }

  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  console.log("Scheduled notifications:", scheduledNotifications);

  const isAlreadyScheduled = scheduledNotifications.some(
    (notification) => notification.identifier === DAILY_MEMO_NOTIFICATION_IDENTIFIER
  );

  if (isAlreadyScheduled) {
    console.log("Already scheduled. Skipping.");
    return;
  }

  console.log("Parsing contests from AsyncStorage...");
  let contestsToday = 0;
  try {
    const storedData = await AsyncStorage.getItem("contests");
    if (storedData) {
      JSON.parse(storedData).forEach((contest: any) => {
        const d1 = new Date(contest.start);
        const d2 = new Date();
        if (d2.getHours() > 7) {
          d2.setDate(d2.getDate() + 1);
        }
        if (
          d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate()
        ) {
          contestsToday += 1;
        }
      });
    }
  } catch (err) {
    console.error("Error reading contests:", err);
  }

  console.log("Contests today:", contestsToday);

  try {
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_MEMO_NOTIFICATION_IDENTIFIER,
    content: {
      title: "Your Daily Memo! 🧠",
      body: `contests_Today: ${contestsToday}`,
      data: {
        type: "daily_memo_reminder",
        timestamp: Date.now(),
        memoContent: contestsToday,
      },
    },
    trigger: {
      type: 'daily',
      hour: 7,
      minute: 0
    } as Notifications.DailyTriggerInput
  });

  console.log("✅ Daily memo notification scheduled!");
} catch (err) {
  console.error("❌ Failed to schedule notification", err);
}
}
