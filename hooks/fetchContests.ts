export default async function fetchContets(){
    const API_URL = process.env.EXPO_PUBLIC_API_URL as URL | RequestInfo
    console.log(API_URL)
    try{
        const res = await fetch(API_URL)
        if(res.ok){
            const contests = await res.json()
            console.log(contests, "ge")
            const sortedContests = contests.sort((d1:any, d2:any)=>{
                return (new Date(d1.start).getTime() - new Date(d2.start).getTime())
            })
            console.log(sortedContests)
            return sortedContests
        }
        else{
            console.log("what the fuck up", res)
        }
    }
    catch(err){
        console.log("err hey", err)
        return err
    }
}