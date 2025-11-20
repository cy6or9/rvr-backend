import cors from "cors";

export const corsMiddleware = cors({
  origin: [
    "https://rivervalleyreport.com",
    "https://www.rivervalleyreport.com",
    "http://localhost:5173",
    "http://localhost:4173"
  ],
  credentials: true
});
