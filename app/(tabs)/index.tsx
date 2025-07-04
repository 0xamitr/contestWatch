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
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  useEffect(()=>{
    const init = async() => {
      const granted = await requestNotificationPermissions()
      scheduleDailyMemoNotification()
      registerBackgroundTaskAsync()
    }
    init()
  }, [])
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
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
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
