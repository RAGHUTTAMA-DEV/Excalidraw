import jwt from "jsonwebtoken"
import {prisma} from "@repo/db"
import { Socket } from "socket.io"

export default async (socket: Socket, next: any) => {
    try{
      const token = socket.handshake.auth?.token;
      if(!token) throw new Error("Not Authenticated")
     const decoded=jwt.verify(token, process.env.JWT_SECRET as string)
     // @ts-ignore
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
     
      if (!user) {
        return next(new Error("Unauthorized: User not found"));
      }

    (socket as any).user = user;
    console.log("user", user)
    next();
  
    }catch(err){
        next(err)
    }
}