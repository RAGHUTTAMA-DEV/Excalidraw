import { prisma } from "@repo/db";
import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
export default async function middleware(req: Request, res: Response, next: NextFunction) {
    try{
         const token:any = req.headers.authorization?.split(" ")[1];
         if(!token){
          return  res.status(401).json({
                message: "Unauthorized"
            });
         }
         try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { [key: string]: any };
            if(decoded){
                const user=await prisma.user.findUnique({
                    where:{
                        id:decoded.id
                    }
                });
                if(user){
                    // @ts-ignore
                    req.user = user;
                    next()
                }else{
                  return  res.status(401).json({
                        message: "Unauthorized"
                    });
                }
            }
            next();
         } catch (err) {
           return  res.status(401).json({
                message: "Invalid or expired token"
            });
         }

    }catch(err){
      return  res.status(500).json({
            message: "Internal Server Error"
        })
    }
}