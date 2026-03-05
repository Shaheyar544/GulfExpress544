import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import logger from "./utils/logger";
import cookieParser from "cookie-parser";
import session from "express-session";
import csurf from "csurf";
import compression from "compression";
import authRoutes from "./routes/auth";

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // Keep the process alive to log the error, or exit gracefully
  // process.exit(1); 
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});


const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// 1. Basic Security & Optimization (Run First)
app.disable("x-powered-by");
// Disable CSP in development to allow Vite's inline scripts
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false
}));
app.use(compression());

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter);

// 3. CORS — open for all /api/* routes (external apps + internal)
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key, Authorization");
    if (req.method === "OPTIONS") return res.status(200).end();
    return next();
  }
  // Restrictive CORS for non-API routes (web pages)
  cors({
    origin: process.env.NODE_ENV === "production"
      ? "https://gulfexpress.org"
      : ["http://localhost:5000", "http://127.0.0.1:5000", "https://gulfexpress.org"],
    credentials: true,
  })(req, res, next);
});


// 4. Body Parsers
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

// 5. Session & Cookies (Required for CSRF)
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super_secret_key_change_in_production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? 'strict' : 'lax',
      httpOnly: true,
    },
  })
);

// 6. CSRF Protection — ALL /api/* routes are exempt (they use X-API-Key or session auth)
// CSRF only protects web form submissions from browsers
const csrfProtection = csurf({ cookie: true });
app.use((req, res, next) => {
  // Skip CSRF for every /api/* route — secured by other means (API key, session)
  if (req.path.startsWith("/api/")) {
    return next();
  }
  return (csrfProtection as any)(req, res, next);
});

// 7. Routes (CSRF Token & Auth)
// NOTE: /csrf-token is NOT under /api/ so it correctly goes through csrfProtection
app.get("/csrf-token", csrfProtection as any, (req, res) => {
  res.json({ csrfToken: (req as any).csrfToken() });
});
app.use(authRoutes);

export function log(message: string, source = "express") {
  logger.info(`[${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  // 8. CSRF Error Handler — must be AFTER registerRoutes so it only
  // catches errors from non-API routes that actually use csrfProtection
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.code === "EBADCSRFTOKEN") {
      return res.status(403).json({ error: "Invalid or missing CSRF token" });
    }
    next(err);
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });

  httpServer.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      log(`Port ${port} is busy, trying ${port + 1}...`);
      httpServer.listen(port + 1, "0.0.0.0");
    } else {
      console.error(err);
    }
  });
})();
