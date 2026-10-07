import { Router } from "express";
import userRoutes from "./user.route";
import authRoutes from "./auth.route";
const routes = Router();

routes.use("/users", userRoutes);
routes.use("/auth", authRoutes);

routes.get("/", (req, res) => {
  res.json({ message: "Store API - Node.js + Express + TypeScript" });
});

export default routes;