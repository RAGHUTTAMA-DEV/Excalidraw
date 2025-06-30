import jwt from "jsonwebtoken"
import {prisma} from "@repo/db"
import { Socket } from "socket.io"
import { ExtendedError } from "socket.io/dist/namespace"

interface CustomSocket extends Socket {
    user?: any;
}

export const Socketmidlleware = async (socket: CustomSocket, next: (err?: ExtendedError) => void) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error("Not Authenticated: No token provided"));
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("JWT_SECRET is not defined in environment variables.");
            return next(new Error("Server configuration error: JWT secret is missing."));
        }

        const decoded = jwt.verify(token, jwtSecret) as { id: number };

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            return next(new Error("Unauthorized: User not found"));
        }

        socket.user = user;
        console.log("Authenticated user:", user.email);
        next();

    } catch (err) {
        const error = err as Error;
        console.error("Authentication error:", error.message);
        next(new Error("Authentication failed: " + error.message));
    }
}