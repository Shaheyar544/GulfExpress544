import type { Request, Response, NextFunction } from "express";

/**
 * API Key middleware for external app access (e.g. OrderFlow Pro).
 * The shared secret must be set as GULF_EXPRESS_API_KEY in the environment.
 * OrderFlow Pro sends it as the X-API-Key request header.
 */
export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = req.headers["x-api-key"] as string | undefined;
    const expectedKey = process.env.GULF_EXPRESS_API_KEY;

    if (!expectedKey) {
        console.error("[apiKeyMiddleware] GULF_EXPRESS_API_KEY is not set in environment.");
        return res.status(500).json({ error: "Server misconfiguration: API key not configured." });
    }

    if (!key || key !== expectedKey) {
        return res.status(401).json({ error: "Unauthorized: Invalid or missing API key." });
    }

    next();
}
