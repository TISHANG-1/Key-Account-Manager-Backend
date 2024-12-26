import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import bodyParser from "body-parser";

import { router as userRouter } from "./routes/user.js";
import { router as leadRouter } from "./routes/leads.js";
import { router as contactRouter } from "./routes/contact.js";
import { router as interactionRouter } from "./routes/interaction.js";
import { router as callScheduleRouter } from "./routes/callSchedule.js";
import { router as performanceRouter } from "./routes/performance.js";

const app = express();

dotenv.config({});
app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use("/users", userRouter);
app.use("/leads", leadRouter);
app.use("/contacts", contactRouter);
app.use("/interactions", interactionRouter);
app.use("/call-schedules", callScheduleRouter);
app.use("/performance", performanceRouter);

app.listen(process.env.PORT, () => {
  try {
    console.log("server up and running http://localhost:8080");
  } catch (err) {
    console.error("status: [500] server crashed with error: ", err);
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  console.error(err.stack);

  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
export default app;
