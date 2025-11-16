import express from "express";
import cors from "cors";
import riverRoute from "./routes/river";

const app = express();
app.use(cors());
app.use(express.json());

// API health check
app.get("/", (req, res) => {
  res.json({ status: "Backend running" });
});

// Load routes
app.use("/api/river", riverRoute);

// PORT (Render/Netlify uses process.env.PORT)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
