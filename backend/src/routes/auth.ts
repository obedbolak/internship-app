import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { signToken } from "../lib/auth";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, role, ...rest } = req.body;
    if (!email || !password || !role) {
      res.status(400).json({ error: "email, password and role are required" }); return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ error: "Email already registered" }); return; }

    const hashed = await bcrypt.hash(password, 10);

    if (role === "STUDENT") {
      const { firstName, lastName, university, fieldOfStudy } = rest;
      if (!firstName || !lastName || !university || !fieldOfStudy) {
        res.status(400).json({ error: "Missing student fields" }); return;
      }
      const user = await prisma.user.create({
        data: { email, password: hashed, role: "STUDENT", student: { create: { firstName, lastName, university, fieldOfStudy } } },
        include: { student: true },
      });
      const token = signToken({ userId: user.id, role: "STUDENT" });
      res.status(201).json({ token, user: { id: user.id, email, role: "STUDENT", profileId: user.student!.id, name: `${firstName} ${lastName}` } });
      return;
    }

    if (role === "COMPANY") {
      const { companyName, industry, location, description } = rest;
      if (!companyName || !industry || !location || !description) {
        res.status(400).json({ error: "Missing company fields" }); return;
      }
      const user = await prisma.user.create({
        data: { email, password: hashed, role: "COMPANY", company: { create: { name: companyName, industry, location, description } } },
        include: { company: true },
      });
      const token = signToken({ userId: user.id, role: "COMPANY" });
      res.status(201).json({ token, user: { id: user.id, email, role: "COMPANY", profileId: user.company!.id, name: companyName } });
      return;
    }

    res.status(400).json({ error: "role must be STUDENT or COMPANY" });
  } catch (e) {
    console.error("[register]", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ error: "email and password required" }); return; }

    const user = await prisma.user.findUnique({ where: { email }, include: { student: true, company: true } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid email or password" }); return;
    }

    const profileId = user.role === "STUDENT" ? user.student?.id : user.company?.id;
    const name = user.role === "STUDENT" ? `${user.student?.firstName} ${user.student?.lastName}` : (user.company?.name ?? "");
    const token = signToken({ userId: user.id, role: user.role });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, profileId, name } });
  } catch (e) {
    console.error("[login]", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
