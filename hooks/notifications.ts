// utils/notifications.ts

import AsyncStorage from '@react-native-async-storage/async-storage'; // Assuming you use AsyncStorage for your data
import * as Notifications from 'expo-notifications';

// 1. Set the notification handler
// This determines how notifications behave when your app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Show the notification alert
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
  // Ensure permissions are granted before scheduling
  const permissionsGranted = await requestNotificationPermissions();
  if (!permissionsGranted) {
    console.warn('Cannot schedule notification: permissions not granted.');
    return;
  }

  // Clear any existing scheduled notification with this ID to prevent duplicates
  await Notifications.cancelScheduledNotificationAsync(DAILY_MEMO_NOTIFICATION_IDENTIFIER);

  // Get data from persistent storage (e.g., AsyncStorage)
  let dataFromMemory = 'No daily memo set yet.';
  try {
    const storedData = await AsyncStorage.getItem('myDailyMemo'); // Use a consistent key
    if (storedData) {
      dataFromMemory = storedData;
    }
  } catch (error) {
    console.error('Error reading data from AsyncStorage for notification:', error);
    dataFromMemory = 'Error loading your memo.';
  }

  // Schedule the new notification
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_MEMO_NOTIFICATION_IDENTIFIER,
    content: {
      title: "Your Daily Memo! 🧠",
      body: `Here's what you remembered: ${dataFromMemory}`,
      data: {
        type: 'daily_memo_reminder', // Custom data for identifying the notification
        timestamp: Date.now(),
        memoContent: dataFromMemory,
      },
    },
    trigger: {
      channelId: 'default', // Highly recommended for Android for reliable delivery
      // You specify the type of trigger as 'calendar' and then its properties
      // The `type` here refers to the literal string 'calendar' for CalendarTriggerInput
      // Make sure there are no other 'type' properties nested inside this.
      // This is the expected structure for a CalendarTriggerInput.
      hour: 22,
      minute: 38,
      repeats: true,
      // You might also consider specifying weekdays if needed, but not for simple daily
      // weekday: 1, // Example: Monday
    } as Notifications.CalendarTriggerInput,
  });

  console.log('Daily memo notification scheduled for 7 AM with data:', dataFromMemory);
}

// 4. Function to save/update the memo data
// This should also trigger a re-schedule of the notification to update its content
export async function saveAndScheduleMemo(memoText: string) {
  try {
    await AsyncStorage.setItem('myDailyMemo', memoText);
    console.log('Memo saved:', memoText);
    // After saving, immediately re-schedule the notification to reflect the new data
    await scheduleDailyMemoNotification();
  } catch (error) {
    console.error('Error saving memo to AsyncStorage:', error);
  }
}

// 5. Function to clear all scheduled notifications (optional, for cleanup/testing)
export async function clearAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('All scheduled notifications cleared.');
}

// 6. Listener for when the user taps on a notification
export function addNotificationTapListener(callback: (data: any) => void) {
  return Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification tapped!', response);
    callback(response.notification.request.content.data);
  });
}