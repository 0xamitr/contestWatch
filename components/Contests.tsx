import fetchContets from '@/hooks/fetchContests';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
type Conteststype = {
    title: string,
    duration: number,
    start: number,
}

export default function Contests(){
    const [contests, setContests] = useState<Conteststype[]>([])
    useEffect(()=>{
        const init = async()=>{
            const lastUpdated = await AsyncStorage.getItem('lastUpdated')
            let storedcontests = await AsyncStorage.getItem('contests')
            if(!lastUpdated){
                storedcontests = await fetchContets()
                AsyncStorage.setItem('lastUpdated', Date.now().toString())
                AsyncStorage.setItem('contests', JSON.stringify(storedcontests))
            }
            else{
                if(Date.now() - new Date(lastUpdated).getTime() > 1000*60*60*24){
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
            console.log(storedcontests)
        }
        init()
    }, [])
    return (
        <ThemedView>
            {contests.length > 0 && contests.map((contest, index) => (
            <ThemedView key={index}>
                <ThemedText>Title: {contest.title}</ThemedText>
                <ThemedText>Duration: {contest.duration}</ThemedText>
                <ThemedText>Start: {contest.start}</ThemedText>
            </ThemedView>
            ))}

        </ThemedView>
    )
}