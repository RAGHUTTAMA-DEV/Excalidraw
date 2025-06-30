import { prisma } from "@repo/db";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
    user?: any; 
}

export default async function middleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            res.status(401).json({ message: "Unauthorized: No token provided" });
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { [key: string]: any, id: number };

            if (decoded && decoded.id) {
                const user = await prisma.user.findUnique({
                    where: { id: decoded.id }
                });

                if (user) {
                    req.user = user;
                    next(); 
                } else {
                    res.status(401).json({ message: "Unauthorized: User not found" });
                    return;
                }
            } else {
                res.status(401).json({ message: "Unauthorized: Invalid token payload" });
                return;
            }
        } catch (err) {
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }

    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
}