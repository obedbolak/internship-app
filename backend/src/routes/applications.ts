import { Router } from "express";
import prisma from "../lib/prisma";
import { requireAuth, requireCompany } from "../lib/auth";

const router = Router();

const VALID = ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"];

router.patch("/:id/status", requireCompany, async (req, res) => {
  try {
    const user = (req as any).user;
    const { status } = req.body;
    if (!VALID.includes(status)) { res.status(400).json({ error: `status must be one of ${VALID.join(", ")}` }); return; }

    const company = await prisma.company.findUnique({ where: { userId: user.userId } });
    if (!company) { res.status(404).json({ error: "Not found" }); return; }

    const existing = await prisma.application.findFirst({
      where: { id: req.params.id, internship: { companyId: company.id } },
    });
    if (!existing) { res.status(404).json({ error: "Application not found" }); return; }

    const application = await prisma.application.update({ where: { id: req.params.id }, data: { status } });

    const student = await prisma.student.findUnique({ where: { id: existing.studentId }, select: { userId: true } });
    if (student) {
      const internship = await prisma.internship.findUnique({ where: { id: existing.internshipId }, select: { title: true } });
      await prisma.notification.create({
        data: { userId: student.userId, title: `Application ${status.toLowerCase()}`, message: `Your application for "${internship?.title}" was ${status.toLowerCase()} by ${company.name}` },
      });
    }

    res.json({ application });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
