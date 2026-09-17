import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import orderRouter from "./routes/orderRouter.js";
import fileRouter from "./routes/fileRouter.js";
import authRouter from "./routes/authRouter.js";
import workRouter from "./routes/workRouter.js";
import aiRouter from "./routes/aiRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
import errorHandler from "./middlewares/errorHandler.js";
import ensureSchema from "./prisma/ensureSchema.js";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://bfs-mission6.vercel.app",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.get("/", (req, res) => {
  res.json({ ok: true, service: "backend-route" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, status: "ok" });
});

app.get("/debug-db", (req, res) => {
  const raw = process.env.DATABASE_URL || "";
  const url = raw
    .trim()
    .replace(/^DATABASE_URL\s*=\s*/i, "")
    .replace(/^["']|["']$/g, "");
  let host = null;
  let user = null;
  let port = null;
  try {
    const parsed = new URL(
      url.replace(/^postgresql:/, "http:").replace(/^postgres:/, "http:"),
    );
    host = parsed.hostname;
    user = decodeURIComponent(parsed.username);
    port = parsed.port;
  } catch {
    host = "parse-failed";
  }
  res.json({
    hasDatabaseUrl: Boolean(raw),
    length: raw.length,
    startsWithPostgres: url.startsWith("postgresql://") || url.startsWith("postgres://"),
    host,
    user,
    port,
  });
});

// 인증/작업/결제 라우트 진입 전에 스키마가 준비됐는지 보장 (1회만 실제 실행)
app.use(["/auth", "/works", "/payments"], (req, res, next) => {
  ensureSchema().then(() => next(), next);
});

app.use("/auth", authRouter);
app.use("/payments", paymentRouter);
app.use("/works", workRouter);
app.use("/ai", aiRouter);
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
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
