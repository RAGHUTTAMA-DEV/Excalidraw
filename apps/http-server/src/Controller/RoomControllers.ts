import { Request,Response } from "express";
import { prisma} from "@repo/db";
import type { Request as ExpressRequest } from "express";

interface AuthenticatedRequest extends ExpressRequest {
  user: { userID: number };
}

export  async function Createroom(req:Request,res:Response){
   try{ 
      const {name,description}=req.body;
      const isroom=await prisma.room.findUnique({
         where:{
            name:name
         }
      })
      if(isroom){
         res.status(400).json({message:"Room already exist"});
         return;
      }else{
         const room=await prisma.room.create({
            data:{
               name:name,
               description:description
            }
         })
         res.status(200).json({message:"Room created successfully",room});
         return;
      }
   }catch(err:any){
      res.status(500).json({message:err.message});
      return;
   }
}

export async function GetRoom(req:Request,res:Response){
   try{
      const roomId=req.params.id;
      const room = await prisma.room.findUnique({
         where: {
            id: Number(roomId)
         }
      })
      if(!room){
         res.status(404).json({message:"Room not found"});
         return;
      }
      res.status(200).json({message:"Room found successfully",room});
      return;
   }catch(err:any){
      res.status(500).json({message:err.message});
      return;
   }
}

export async function DeleteRoom(req:Request,res:Response){
    try{
      const roomId=req.params.id;
      const room = await prisma.room.delete({
         where: {
            id: Number(roomId)
         }
      })
      if(!room){
         res.status(404).json({message:"Room not found"});
         return;
      }
      res.status(200).json({message:"Room deleted successfully",room});
      return;
    }catch(err:any){
       res.status(500).json({message:err.message});
       return;
    }
}

export async function JoinRoom(req: AuthenticatedRequest, res: Response){
   try{
      const roomId = Number(req.params.id);
      //@ts-ignore
      const userId = Number(req.user.id);
      const room = await prisma.room.findUnique({
         where: { id: roomId },
         include: { members: true }
      });
      if(!room){
         res.status(404).json({message:"Room not found"});
         return;
      }
      if(room.Roomlen >= room.MaxLen){
         res.status(403).json({message:"Room is full"});
         return;
      }
      if(room.status !== "ACTIVE"){
         res.status(403).json({message:"Room is not active"});
         return;
      }
      if(room.members.some(member => member.id === userId)){
         res.status(400).json({message:"User already in room"});
         return;
      }
      const updatedRoom = await prisma.room.update({
         where: { id: roomId },
         data: {
            members: { connect: { id: userId } },
            Roomlen: { increment: 1 }
         },
         include: { members: true }
      });
      res.status(200).json({message:"Joined room successfully", room: updatedRoom});
      return;
   }catch(err:any){
      res.status(500).json({message:err.message});
      return;
   }
}

export async function UpdateRoom(req:Request,res:Response){
    try{
      const roomId=req.params.id;
      const room = await prisma.room.update({
         where: {
            id: Number(roomId)
         },
         data: {
            name: req.body.name,
            description: req.body.description,
         }
      })
      res.status(200).json({message:"Room updated successfully", room});
      return;
    }catch(err:any){
       res.status(500).json({message:err.message});
       return;
    }
}