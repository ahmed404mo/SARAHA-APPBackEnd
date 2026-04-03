import { authenticateDB, connectRadis } from "./DB/index.js";
import express from "express";
import { resolve } from "node:path";
import { config } from "dotenv";
import cors from 'cors'
import axios from "axios"
config({ path: resolve("./config/.env.dev") });

import {userRouter, authRouter, messageRouter } from "./modules/index.js"
import { globalErrorHandling } from "./common/utils/index.js";
import { ORIGINS } from "../config/config.service.js";
import helmet from "helmet";

// import { limiter } from "./middleware/limiter.js";



async function bootstrap() {
  const app = express();
  var corsOptions = {
  origin: ORIGINS,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
  const port = process.env.PORT ?? 3000;

  const fromWhere = async (ip) => {

    try {
        const response = await axios.get(`https://ipapi.co/${ip}/json`);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }

}

  // DB-connection
  await connectRadis()
await authenticateDB()

app.set("trust proxy", true)
  // convert buffer
  // app.use( cors(corsOptions),helmet(),limiter,express.json(),);
  app.use( cors(),helmet(),express.json(),);
  // welcome
  app.get("/", (req, res) => res.send("Hello World!"));

  // app.routing
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);

  app.use(globalErrorHandling);

  // invalid app routing method , url
  app.use("{/dummy}", (req, res, next) => {
    return res.status(404).json({ message: "invalid application routing" });
  });
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}

export default bootstrap;
