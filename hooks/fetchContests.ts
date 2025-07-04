export default async function fetchContets(){
    const API_URL = process.env.EXPO_PUBLIC_API_URL as URL | RequestInfo
    console.log(API_URL)
    try{
        const res = await fetch(API_URL)
        if(res.ok){
            const contests = res.json()
            console.log(contests, "ge")
            return contests
        }
    }
    catch(err){
        return err
    }
}