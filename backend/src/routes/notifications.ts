import { Router } from "express";
import prisma from "../lib/prisma";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const notifications = await prisma.notification.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    res.json({ notifications });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    await prisma.notification.updateMany({ where: { userId: user.userId, isRead: false }, data: { isRead: true } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
