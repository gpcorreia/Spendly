import "dotenv/config";

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import usersRoutes from "./routes/users";
import webhooks from "./routes/whatsapp";

const app = express();

app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  // const allowedOrigins = [
  //   "https://portfolify.com",
  //   "192.168.1.15:62133/"
  // ];

  const origin = req.headers.origin;

  // if (origin && allowedOrigins.includes(origin)) {
  //   res.setHeader("Access-Control-Allow-Origin", origin);
  // }

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", usersRoutes);
app.use("/meta", webhooks);


// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new Error("Not found.") as Error & { status?: number };
  err.status = 404;
  next(err);
});

// error handler
app.use((err: Error & { status?: number }, req: Request, res: Response, next: NextFunction) => {
  const status = err.status ?? 500;
  res.status(status).json({
    message: "Error not found! Status: " + status,
  });
});

export default app;
