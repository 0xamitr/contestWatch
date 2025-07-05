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
  // Ensure permissions are granted before scheduling
  const permissionsGranted = await requestNotificationPermissions();
  if (!permissionsGranted) {
    console.warn('Cannot schedule notification: permissions not granted.');
    return;
  }

  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  console.log("schedules", scheduledNotifications)
  const isDailyMemoScheduled = scheduledNotifications.some(
    (notification) => notification.identifier === DAILY_MEMO_NOTIFICATION_IDENTIFIER
  );

  if (isDailyMemoScheduled) {
    console.log('Daily memo notification is already scheduled. Skipping re-scheduling.');
    return; // Exit if already scheduled
  }

  // Clear any existing scheduled notification with this ID to prevent duplicates
  await Notifications.cancelScheduledNotificationAsync(DAILY_MEMO_NOTIFICATION_IDENTIFIER);

  // Get data from persistent storage (e.g., AsyncStorage)
  let contestsToday = 0;
  try {
    const storedData = await AsyncStorage.getItem('contests'); // Use a consistent key
    if (storedData) {
      JSON.parse(storedData).forEach((contest:any, index:number)=>{
        const d1 = new Date(contest.start)
        const d2 = new Date()
        if (d2.getHours() > 7){
          d2.setDate(d2.getDate() + 1);
        }
        if( d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()){
          contestsToday += 1
        }
      })
    }
  } catch (error) {
    console.error('Error reading data from AsyncStorage for notification:', error);
    contestsToday = 0;
  }

  // Schedule the new notification
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_MEMO_NOTIFICATION_IDENTIFIER,
    content: {
      title: "Your Daily Memo! 🧠",
      body: `contests_Today: ${contestsToday}`,
      data: {
        type: 'daily_memo_reminder', // Custom data for identifying the notification
        timestamp: Date.now(),
        memoContent: contestsToday,
      },
    },
    trigger: {
      hour: 7,
      minute: 0,
      repeats: true
    } as Notifications.CalendarTriggerInput
  });

  console.log('Daily memo notification scheduled for 7 AM with data:', contestsToday);
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