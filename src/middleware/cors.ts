// src/middleware/cors.ts
import cors from "cors";

export const corsMiddleware = cors({
  origin: [
    "https://rivervalleyreport.com",
    "https://www.rivervalleyreport.com"
  ],
  credentials: true,
});
