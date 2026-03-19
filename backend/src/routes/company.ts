import { Router } from "express";
import prisma from "../lib/prisma";
import { requireCompany } from "../lib/auth";

const router = Router();

router.get("/profile", requireCompany, async (req, res) => {
  try {
    const user = (req as any).user;
    const company = await prisma.company.findUnique({
      where: { userId: user.userId },
      include: { internships: { include: { _count: { select: { applications: true } } }, orderBy: { createdAt: "desc" } } },
    });
    if (!company) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ company });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/profile", requireCompany, async (req, res) => {
  try {
    const user = (req as any).user;
    const allowed = ["name", "industry", "description", "location", "website"];
    const data: Record<string, string> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    const company = await prisma.company.update({ where: { userId: user.userId }, data });
    res.json({ company });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/applications", requireCompany, async (req, res) => {
  try {
    const user = (req as any).user;
    const company = await prisma.company.findUnique({ where: { userId: user.userId } });
    if (!company) { res.status(404).json({ error: "Not found" }); return; }

    const applications = await prisma.application.findMany({
      where: { internship: { companyId: company.id } },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, university: true, fieldOfStudy: true } },
        internship: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ applications });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
