import {
  scheduleDailyMemoNotification
} from '@/hooks/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import fetchContets from './fetchContests';
export const TASK_NAME = 'BACKGROUND_FETCH_TASK';

TaskManager.defineTask(TASK_NAME, async () => {
  const value = await AsyncStorage.getItem('counter');
  const current = value ? parseInt(value, 10) : 0;
  const updated = current + 1;
  await AsyncStorage.setItem('counter', updated.toString());
  try {
    const now = Date.now();
    console.log(`Got background task call at date: ${new Date(now).toISOString()}`);
    const lastUpdated = await AsyncStorage.getItem('lastUpdated')
    if(!lastUpdated){
        const contests = await fetchContets()
        AsyncStorage.setItem('lastUpdated', Date.now().toString())
        AsyncStorage.setItem('contests', JSON.stringify(contests))
    }
    else{
        if(Date.now() - (new Date(parseInt(lastUpdated, 10)).getTime()) > 1000*60*60*24){
            const contests = await fetchContets()
            AsyncStorage.setItem('lastUpdated', Date.now().toString())
            AsyncStorage.setItem('contests', JSON.stringify(contests))
        }
    }
    scheduleDailyMemoNotification()
  } catch (error) {
    console.error('Failed to execute the background task:', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
  return BackgroundTask.BackgroundTaskResult.Success;
});


export async function registerBackgroundTaskAsync() {
  try {
    console.log("registering background task");
    return BackgroundTask.registerTaskAsync(TASK_NAME, {
      minimumInterval: 15,
    })
  } catch (err) {
    console.log("nai")
    console.error("Failed to register background task", err);
  }
}