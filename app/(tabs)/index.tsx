import Contests from '@/components/Contests';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  registerBackgroundTaskAsync
} from '@/hooks/backgroundTasts';
import {
  requestNotificationPermissions,
  scheduleDailyMemoNotification
} from '@/hooks/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  const [counter, setCounter] = useState<string>("")
  useEffect(() => {
    console.log("useEffect ran");
    
    const init = async () => {
      console.log("init started");
      const count = await AsyncStorage.getItem('counter')
        if(count)
            setCounter(count)
        else
            setCounter("0")

      const granted = await requestNotificationPermissions();
      console.log("permissions granted:", granted);

      await scheduleDailyMemoNotification();
      console.log("notification scheduled");

      await registerBackgroundTaskAsync();
      console.log("background task registered");
    };
    init();
}, []);
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/monke.jpeg')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedText>Counter: {counter} (ignore)</ThemedText>
      <Contests />
      <ThemedView style={styles.stepContainer}>
        
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: '100%',
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
