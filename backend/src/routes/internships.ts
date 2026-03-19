import { Router } from "express";
import prisma from "../lib/prisma";
import { requireAuth, requireCompany } from "../lib/auth";

const router = Router();

const FIELD_MAP: Record<string, string[]> = {
  "1": ["Engineering", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering"],
  "2": ["Business", "Finance", "Marketing", "Management", "Accounting"],
  "3": ["Information Technology", "Computer Science", "Software Engineering", "IT"],
  "4": ["Health Sciences", "Medicine", "Nursing", "Pharmacy", "Public Health"],
  "5": ["Law", "Legal Studies"],
  "6": ["Arts & Design", "Graphic Design", "Fine Arts", "Media", "Communications"],
};

router.get("/", requireAuth, async (req, res) => {
  try {
    const search = (req.query.search as string) ?? "";
    const fieldId = req.query.field as string | undefined;
    const fields = fieldId ? FIELD_MAP[fieldId] : null;

    const internships = await prisma.internship.findMany({
      where: {
        isActive: true,
        deadline: { gte: new Date() },
        ...(search ? { OR: [
          { title: { contains: search, mode: "insensitive" } },
          { fieldOfStudy: { contains: search, mode: "insensitive" } },
          { company: { name: { contains: search, mode: "insensitive" } } },
        ]} : {}),
        ...(fields ? { fieldOfStudy: { in: fields } } : {}),
      },
      include: { company: { select: { id: true, name: true, industry: true, logo: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({ internships });
  } catch (e) {
    console.error("[GET /internships]", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const internship = await prisma.internship.findUnique({
      where: { id: req.params.id },
      include: { company: { select: { id: true, name: true, industry: true, logo: true } } },
    });
    if (!internship) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ internship });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireCompany, async (req, res) => {
  try {
    const user = (req as any).user;
    const { title, description, fieldOfStudy, location, isPaid, salary, duration, deadline } = req.body;
    if (!title || !description || !fieldOfStudy || !location || !duration || !deadline) {
      res.status(400).json({ error: "Missing required fields" }); return;
    }

    const company = await prisma.company.findUnique({ where: { userId: user.userId } });
    if (!company) { res.status(404).json({ error: "Company not found" }); return; }

    const internship = await prisma.internship.create({
      data: { companyId: company.id, title, description, fieldOfStudy, location, duration, isPaid: isPaid ?? false, salary: isPaid ? (salary ?? null) : null, deadline: new Date(deadline) },
    });

    // Notify all students about the new internship
    const students = await prisma.student.findMany({ select: { userId: true } });
    if (students.length > 0) {
      await prisma.notification.createMany({
        data: students.map(s => ({
          userId: s.userId,
          title: "New Internship Posted",
          message: `${company.name} posted a new internship: "${title}" in ${fieldOfStudy}`,
        })),
      });
    }

    res.status(201).json({ internship });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
