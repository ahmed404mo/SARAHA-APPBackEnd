import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { radisClient } from '../DB/radis.connection.db.js';
import geoip  from 'geoip-lite';

export const limiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    limit: function (req) {
        const geoData = geoip.lookup(req.ip)
        const country = geoData?.country || "US"
        return country == "EG"?5000:3
    },
    message: "lol no more request",
    statusCode: 400,
    legacyHeaders: true,
    standardHeaders: "draft-8",
    // skipSuccessfulRequests: true,
    skipFailedRequests:true,
    handler: (req, res, next) => {
        return res.status(429).json({ message: "TOO many Request" })
    },
keyGenerator: function (req, res, next) {
    console.log({ ip: req.ip, key: `${req.ip}-${req.path}` });
    const ipV6 = ipKeyGenerator(req.ip, 56)
    console.log({ ipV6 });
    return `${req.ip}-${req.path}`
},
// -------------------------REDIS
store: {
    async incr(key, cb) { // get called by keyGenerator
        try {
            const count = await radisClient.incr(key);
            if (count === 1) await radisClient.expire(key, 120); // 2 min TTL
            cb(null, count);
        } catch (err) {
            cb(err);
        }
    },
    async resetKey(key) {  // called by  await limiter.store.resetKey(key)
        await radisClient.del(key);
    },
    async decrement(key) { // called by kipFailedRequests:true ,  skipSuccessfulRequests:true,
        await radisClient.decr(key);
    },
},
})

export const limiterLogin = rateLimit({
    windowMs: 2 * 60 * 1000,
    limit: function (req) {
        const geoData = geoip.lookup(req.ip)
        const country = geoData?.country || "US"
        return country == "EG"?5000:3
    },

    skipSuccessfulRequests: true,
    skipFailedRequests:false,
    handler: (req, res, next) => {
        return res.status(429).json({ message: "TOO many login attempts Request" })
    },
keyGenerator: function (req, res, next) {
    console.log({ ip: req.ip, key: `${req.ip}-${req.path}` });
    const ipV6 = ipKeyGenerator(req.ip, 56)
    console.log({ ipV6 });
    return `${req.ip}-${req.path}`
},
// -------------------------REDIS
store: {
    async incr(key, cb) { // get called by keyGenerator
        try {
            const count = await radisClient.incr(key);
            if (count === 1) await radisClient.expire(key, 120); // 2 min TTL
            cb(null, count);
        } catch (err) {
            cb(err);
        }
    },
    // async resetKey(key) {  // called by  await limiter.store.resetKey(key)
    //     await radisClient.del(key);
    // },
    async decrement(key) { // called by kipFailedRequests:true ,  skipSuccessfulRequests:true,
      if (await radisClient.exists(key)) {
        await radisClient.decr(key)
      }
        await radisClient.decr(key);
    },
},
})

