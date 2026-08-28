import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import orderRouter from "./routes/orderRouter.js";
import fileRouter from "./routes/fileRouter.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }),
);
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.get("/debug-db", (req, res) => {
  const raw = process.env.DATABASE_URL || "";
  const url = raw
    .trim()
    .replace(/^DATABASE_URL\s*=\s*/i, "")
    .replace(/^["']|["']$/g, "");
  let host = null;
  try {
    host = new URL(
      url.replace(/^postgresql:/, "http:").replace(/^postgres:/, "http:"),
    ).hostname;
  } catch {
    host = "parse-failed";
  }
  res.json({
    hasDatabaseUrl: Boolean(raw),
    length: raw.length,
    startsWithPostgres: url.startsWith("postgresql://") || url.startsWith("postgres://"),
    host,
  });
});

app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/orders", orderRouter);
app.use("/files", fileRouter);
app.use("/files", express.static("uploads", { index: false, redirect: false }));

app.use((err, req, res, next) => {
  console.error(err);
  errorHandler(err, req, res, next);
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
