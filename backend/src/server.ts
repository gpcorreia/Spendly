import "dotenv/config";
import app from "./app";

const port = process.env.PORT || 8080;
const domain = process.env.DOMAIN || `http://localhost:${port}`;

app.listen(port, () => {
  console.log(`Spendly backend running at ${domain}`);
});
