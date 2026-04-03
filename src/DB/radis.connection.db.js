import {createClient} from "redis"
import { RUDIS_URI } from "../../config/config.service.js"

export const radisClient = createClient({
  url:RUDIS_URI
})

export const connectRadis = async ()=>{
  try {
    await radisClient.connect()
    console.log(`RADIS_DB is connected 🚀❤️`);
    
  } catch (error) {
    console.log(`fail to connect on RADIS_DB `);
    
  }
}