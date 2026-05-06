import path from "path";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import paymentsRoutes from "./routes/payments";

const app = express();

app.use(cors());

app.use((request: Request, response: Response, next: NextFunction) => {
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (request.method === "OPTIONS") {
    response.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    return response.status(200).json({});
  }

  next();
});

app.use(paymentsRoutes);
app.use(express.static(path.join(process.cwd(), "public")));

app.use((_request: Request, response: Response) => {
  response.status(404).json({ message: "Not found." });
});

export default app;
