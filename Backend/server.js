import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.js";
import menuRoutes from "./routes/menu.js";
import chefRoutes from "./routes/chef.js";
import orderRoutes from "./routes/order.js";
import addressRoutes from "./routes/address.routes.js";
import cartRoutes from "./routes/cart.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.js";

// Load env vars
dotenv.config(); 

// Connect to Database
connectDB();

const app = express();

/* ✅ FIRST: middleware */
app.use(
  cors({
    origin: ["http://localhost:8080", "https://campus-thali.vercel.app"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static("uploads"));

/* ✅ THEN: routes */
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/chefs", chefRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

app.get("/", (req, res) => {
  res.send("API Running");
});

/* ✅ LAST: error handler middleware */
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));