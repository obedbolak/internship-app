import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-production";

export interface JWTPayload {
  userId: string;
  role: "STUDENT" | "COMPANY";
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getUser(req: Request): JWTPayload | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return verifyToken(auth.slice(7));
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }
  (req as any).user = user;
  next();
}

export function requireStudent(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if ((req as any).user?.role !== "STUDENT") { res.status(403).json({ error: "Forbidden" }); return; }
    next();
  });
}

export function requireCompany(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if ((req as any).user?.role !== "COMPANY") { res.status(403).json({ error: "Forbidden" }); return; }
    next();
  });
}
