import express, { type Express } from "express";
import cors from "cors";
import type { IncomingMessage, ServerResponse } from "http";
import pinoHttp from "pino-http";
import { rateLimit } from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.set("trust proxy", 1);

const httpLogger = (pinoHttp as unknown as (opts: object) => express.RequestHandler)({
  logger,
  serializers: {
    req(req: IncomingMessage & { id?: unknown; url?: string; method?: string }) {
      return {
        id: req.id,
        method: req.method,
        url: req.url?.split("?")[0],
      };
    },
    res(res: ServerResponse) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});

app.use(httpLogger);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
