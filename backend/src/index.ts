import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import internshipRoutes from "./routes/internships";
import studentRoutes from "./routes/student";
import companyRoutes from "./routes/company";
import applicationRoutes from "./routes/applications";
import notificationRoutes from "./routes/notifications";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`Backend running on http://0.0.0.0:${PORT}`));
