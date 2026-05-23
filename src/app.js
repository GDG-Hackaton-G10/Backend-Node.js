import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import pharmacyRoutes from './routes/pharmacyRoutes.js';
import pharmacyAdminRoutes from './routes/pharmacyAdminRoutes.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/v1/pharmacy', pharmacyAdminRoutes);
app.use('/api/pharmacy', pharmacyAdminRoutes);
app.use('/api/v1/medicines', medicineRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/v1/pharmacies', pharmacyRoutes);
app.use('/api/pharmacies', pharmacyRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
