import express, { type Express } from "express";
import cors, { type CorsOptions } from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ---------------------------------------------------------------------------
// CORS
// In production, restrict to the origins listed in ALLOWED_ORIGINS (CSV).
// In development, allow everything so local tooling works without extra setup.
// ---------------------------------------------------------------------------
const isProduction = process.env.NODE_ENV === "production";
const rawAllowedOrigins = process.env.ALLOWED_ORIGINS ?? "";
const allowedOrigins = rawAllowedOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = isProduction
  ? {
      origin: (origin, callback) => {
        // Allow server-to-server requests (no Origin header) only in non-strict mode.
        // For a public API you may want to require an origin; adjust as needed.
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin "${origin}" not allowed by CORS policy`));
        }
      },
      credentials: true,
    }
  : {};

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
