import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import router from "./routes";

const app: Express = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger (no worker threads — safe for serverless)
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

const toolUseLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many tool uses. Please slow down." },
});

app.use("/api", generalLimiter);
app.use("/api/tools/:id/use", toolUseLimiter);
app.use("/api", router);

export default app;
