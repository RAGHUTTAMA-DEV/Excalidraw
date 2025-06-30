import { Request,Response } from "express";
import { prisma } from "@repo/db";
import jwt from "jsonwebtoken"
export async function Login(req:Request,res:Response){
   try{
      const {email,password} = req.body;
      const isuser=await prisma.user.findUnique({
         where:{
            email:email
         }
      })
      if(isuser && isuser.password===password){
         const token = jwt.sign({id:isuser.id},process.env.JWT_SECRET as string)
         res.status(200).json({message:"Login Success",token})
      }
      else{
         res.status(401).json({message:"Invalid Credentials"})
      }

   }catch(err){
    res.status(500).json({message:"Internal Server Error"})
   }
}

export async function Register(req:Request,res:Response){
    try{
        
        const {email,password,name,lastName} = req.body;
        const isuser=await prisma.user.findUnique({
            where:{
                email
            }
        })
        if(isuser){
            res.status(400).json({message:"User already exist"})
        }else{
            const user = await prisma.user.create({
                data:{
                    email,
                    password,
                    name,
                    lastName
                }
            })
            const token=await jwt.sign({user},process.env.JWT_SECRET as string,{expiresIn:"1d"})
            res.status(200).json({message:"User created successfully",user})
        }
    }catch(err){
        res.status(500).json({message:"Internal Server Error"})
    }
}

export function Logout(req:Request,res:Response){
   try{
    res.clearCookie("token")
    res.status(200).json({message:"User logged out"})
   }catch(err:any){
       res.status(500).json({message:"Internal Server Error"})
   }

}

export function Getme(req:Request,res:Response){
     try{
        //@ts-ignore
        const user = req.user;
        res.status(200).json({message:"User found",user})

     }catch(err:any){
         res.status(500).json({message:"Internal Server Error"})
     }
}