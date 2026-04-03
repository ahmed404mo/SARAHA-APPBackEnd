import { radisClient } from "../../DB/radis.connection.db.js";

export const baseRevokTokenKey = ({userId, jti})=>{
  return `RevokeToken::${userId}`
}
export const revokeTokenKey = ({userId, jti})=>{
  return `${baseRevokTokenKey(userId)}::${jti}`
}
export const set = async ({
key,
value,
ttl
}={})=>{
  try {
    let data = typeof value === 'string' ? value : JSON.stringify(value)
    return ttl ? await radisClient.set(key, data, {EX:ttl}) :  await radisClient.set(key, data)
  } catch (error) {
    console.log(`Fail in radis set operation ${error}`);
  }
}

export const update = async ({
key,
value,
ttl
}={})=>{
  try {
    if (! await radisClient.exists(key)) return 0
    return set({key, value, ttl})
} catch (error) {
    console.log(`Fail in radis update operation ${error}`);
  }
}

export const increment = async (key)=>{
  try {
    if (! await radisClient.exists(key)) return 0
    return radisClient.incr(key)
} catch (error) {
    console.log(`Fail in radis update operation ${error}`);
  }
}

export const get = async (key)=>{
  try {
    try {
      return JSON.parse(await radisClient.get(key))
    } catch (error) {
      return await radisClient.get(key)
      
    }
} catch (error) {
    console.log(`Fail in radis get operation ${error}`);
  }
}
export const ttl = async (key)=>{
  try {
      return await radisClient.ttl(key)
      
    
} catch (error) {
    console.log(`Fail in radis ttl operation ${error}`);
  }
}
export const exists = async (key)=>{
  try {
      return await radisClient.exists(key)
      
    
} catch (error) {
    console.log(`Fail in radis exists operation ${error}`);
  }
}
export const expire = async ({key, ttl}={})=>{
  try {
      return await radisClient.expire(key,ttl)
      
    
} catch (error) {
    console.log(`Fail in radis add-expire operation ${error}`);
  }
}
export const mGet = async (keys=[])=>{
  try {
    if (!keys.length) {
      return 0
    }
      return await radisClient.mGet(keys)
      
    
} catch (error) {
    console.log(`Fail in radis mGet operation ${error}`);
  }
}

export const keys = async (prefix)=>{
  try {
      return await radisClient.keys(`${prefix}*`)
      
    
} catch (error) {
    console.log(`Fail in radis keys operation ${error}`);
  }
}

export const deleteKey = async (key)=>{
  try {
    if (!key.length) {
      return 0
    }
      return await radisClient.del(key)
      
    
} catch (error) {
    console.log(`Fail in radis dell operation ${error}`);
  }
}