import path from "path";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import paymentsRoutes from "./routes/payments";
import emailRoutes from "./routes/email";
import { Stripe } from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_missing");
const publicDir = path.join(process.cwd(), "public");
const siteUrl = (process.env.DOMAIN || "").replace(/\/$/, "");

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Missing STRIPE_SECRET_KEY. Add it to .env before taking payments.");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn("Missing STRIPE_WEBHOOK_SECRET. Stripe webhooks will fail without it.");
}


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
app.use("/webservice",emailRoutes);

app.get("/health", (_request: Request, response: Response) => {
  response.status(200).json({ status: "ok", service: "spendly-backend" });
});

app.get("/sitemap.xml", (_request: Request, response: Response) => {
  const baseUrl = siteUrl || "https://spendly-backend.onrender.com";
  response.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/success</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/cancel</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`);
});

app.get("/robots.txt", (_request: Request, response: Response) => {
  const baseUrl = siteUrl || "https://spendly-backend.onrender.com";
  response.type("text/plain").send(`User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`);
});

app.get("/success", (_request: Request, response: Response) => {
  response.sendFile(path.join(publicDir, "success.html"));
});

app.get("/cancel", (_request: Request, response: Response) => {
  response.sendFile(path.join(publicDir, "cancel.html"));
});

app.use(express.static(publicDir));

app.use((_request: Request, response: Response) => {
  response.status(404).json({ message: "Not found." });
});

export default app;
