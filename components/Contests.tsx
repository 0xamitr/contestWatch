import fetchContets from '@/hooks/fetchContests';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatInTimeZone } from 'date-fns-tz';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Conteststype = {
    title: string,
    duration: number,
    start: number,
    type: string,
}

export default function Contests(){
    const [contests, setContests] = useState<Conteststype[]>([])
    useEffect(()=>{
        const init = async()=>{
            console.log(new Date(), "yp  ", new Date().getHours(), "ww")
            console.log(new Date("2025-07-19T20:05:00+05:30"))
            const lastUpdated = await AsyncStorage.getItem('lastUpdated')
            if(lastUpdated)
                console.log("last", (lastUpdated))
            let storedcontests = await AsyncStorage.getItem('contests')
            if(!lastUpdated){
                storedcontests = await fetchContets()
                AsyncStorage.setItem('lastUpdated', Date.now().toString())
                AsyncStorage.setItem('contests', JSON.stringify(storedcontests))
            }
            else{
                console.log("Aaaa", Date.now() - (new Date(parseInt(lastUpdated, 10)).getTime()));
                if(Date.now() - new Date(parseInt(lastUpdated, 10)).getTime() > 1000*60*60*24){
                    storedcontests = await fetchContets()
                    AsyncStorage.setItem('lastUpdated', Date.now().toString())
                    AsyncStorage.setItem('contests', JSON.stringify(storedcontests))
                }
            }
            if(storedcontests){
                if (typeof storedcontests === 'string')
                    setContests(JSON.parse(storedcontests))
                else 
                    setContests(storedcontests)
            }
        }
        init()
    }, [])
    return (
        <ThemedView>
            {contests.length > 0 && contests.map((contest, index) => (
            <ThemedView style={styles.contestContainer} lightColor='whie' darkColor='black' key={index}>
                <ThemedText type='subtitle'>[{contest.type}] {contest.title}</ThemedText>
                <ThemedText>{contest.duration} minutes</ThemedText>
                <ThemedText>{formatInTimeZone(new Date(contest.start), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a')}</ThemedText>            
            </ThemedView>
            ))}
        </ThemedView>
    )
}

const styles = StyleSheet.create({
  contestContainer: {
    borderWidth: 5,
    borderRadius: 20,
    marginBlockEnd: 10,
    padding: 10,
  },
});