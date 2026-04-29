const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const universityRoutes = require("./routes/universityRoutes");
const programRoutes = require("./routes/programRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contentRoutes = require("./routes/contentRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const parseAllowedOrigins = () => {
  const configuredOrigins = [process.env.CLIENT_URL, process.env.CLIENT_URLS]
    .filter(Boolean)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return new Set([
    ...configuredOrigins,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);
};

const allowedOrigins = parseAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve(process.cwd(), process.env.UPLOAD_DIR || "src/uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "study-birds-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/content", contentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
