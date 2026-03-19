import { Router } from "express";
import prisma from "../lib/prisma";
import { requireStudent } from "../lib/auth";

const router = Router();

router.get("/profile", requireStudent, async (req, res) => {
  try {
    const user = (req as any).user;
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ student });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/profile", requireStudent, async (req, res) => {
  try {
    const user = (req as any).user;
    const allowed = ["bio", "university", "fieldOfStudy"];
    const data: Record<string, string> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    const student = await prisma.student.update({ where: { userId: user.userId }, data });
    res.json({ student });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/applications", requireStudent, async (req, res) => {
  try {
    const user = (req as any).user;
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) { res.status(404).json({ error: "Not found" }); return; }

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: { internship: { include: { company: { select: { name: true, industry: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ applications });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/applications", requireStudent, async (req, res) => {
  try {
    const user = (req as any).user;
    const { internshipId, coverLetter } = req.body;
    if (!internshipId) { res.status(400).json({ error: "internshipId is required" }); return; }

    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) { res.status(404).json({ error: "Not found" }); return; }

    const existing = await prisma.application.findUnique({
      where: { studentId_internshipId: { studentId: student.id, internshipId } },
    });
    if (existing) { res.status(409).json({ error: "Already applied" }); return; }

    const application = await prisma.application.create({
      data: { studentId: student.id, internshipId, coverLetter },
      include: { internship: { include: { company: true } } },
    });

    const companyUser = await prisma.user.findFirst({ where: { company: { id: application.internship.companyId } } });
    if (companyUser) {
      await prisma.notification.create({
        data: { userId: companyUser.id, title: "New application", message: `${student.firstName} ${student.lastName} applied for "${application.internship.title}"` },
      });
    }

    res.status(201).json({ application });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
