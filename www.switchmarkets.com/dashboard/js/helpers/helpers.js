import { GET_AUTHENTICATION_CONFIG, TIME_OUT_SEC } from "./config.js";

const timeout = function (sec){
    return new Promise(function(_,reject){
        setTimeout(() => {
            reject(new Error("Slow internet try reloading. :)"))
        }, sec * 1000);
    })
}

export const getJson = async function(url){
   try {
       

        const req =await Promise.race([
            fetch(url, GET_AUTHENTICATION_CONFIG),
            timeout(TIME_OUT_SEC)
        ])

        const data = await req.json();
        if(data?.detail) throw new Error("User with id "+data.detail);
        
        return data;
       
   } catch (error) {
       throw error;
   }
}