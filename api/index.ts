import express from "express";
import apiRouter from "./api-router";

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRouter);

export default app;

