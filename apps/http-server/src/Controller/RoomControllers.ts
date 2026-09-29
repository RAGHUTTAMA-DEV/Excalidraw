import { Request,Response } from "express";
import { prisma} from "@repo/db";
import type { Request as ExpressRequest } from "express";

interface AuthenticatedRequest extends ExpressRequest {
  user: { id: number };
}

export  async function Createroom(req:Request,res:Response){
   try{ 
      const {name,description,canvasState}=req.body;
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
               description:description,
               canvasState:canvasState
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
      const roomId=Number(req.params.id);
      if (!roomId || isNaN(roomId)) {
         res.status(400).json({ message: "Invalid or missing room id" });
         return;
      }
      const room = await prisma.room.findUnique({
         where: {
            id: roomId
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
      const roomId=Number(req.params.id);
      if (!roomId || isNaN(roomId)) {
         res.status(400).json({ message: "Invalid or missing room id" });
         return;
      }
      const room = await prisma.room.delete({
         where: {
            id: roomId
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
      if (!roomId || isNaN(roomId)) {
         res.status(400).json({ message: "Invalid or missing room id" });
         return;
      }
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
      if(room.members.some((member: any) => member.id === userId)){
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

export  async function GetCanvas(req:Request,res:Response){
   try{
      const roomId=Number(req.params.id);
      if (!roomId || isNaN(roomId)) {
         res.status(400).json({ message: "Invalid or missing room id" });
         return;
      }
      const room=await prisma.room.findUnique({
         where:{ id:roomId},
         include:{members:true}
      })
      if(!room){
         res.status(404).json({message:"Room not found"});
         return;
      }
      res.status(200).json({message:"Canvas fetched successfully", canvasState:room.canvasState});
      return;
   }catch(err:any){
      res.status(500).json({message:err.message});
      return;
   }
}

export async function GetAllRooms(req:Request,res:Response){
   try{
      console.log("Fetching all rooms...");
      const rooms=await prisma.room.findMany()
      console.log("Found rooms:", rooms);
      
      // If no rooms exist, create a default room
      if (rooms.length === 0) {
         console.log("No rooms found, creating default room...");
         const defaultRoom = await prisma.room.create({
            data: {
               name: "General Room",
               description: "Default room for all users",
               status: "ACTIVE",
               Roomlen: 0,
               MaxLen: 10,
               canvasState: []
            }
         });
         console.log("Created default room:", defaultRoom);
         res.status(200).json({message:"Rooms fetched successfully",rooms: [defaultRoom]})
         return;
      }
      
      res.status(200).json({message:"Rooms fetched successfully",rooms})
      return;
   }catch(err:any){
      console.error("Error fetching rooms:", err);
      res.status(500).json({message:err.message})
      return;
   }
}


export async function GetMyRooms(req:AuthenticatedRequest,res:Response){
   try{
      const userId=Number(req.params.id);
      const rooms=await prisma.room.findMany({
         where:{
            members:{some:{id:userId}}
         }
      })
      res.status(200).json({message:"My rooms fetched successfully",rooms})
      return;
   }catch(err:any){
      res.status(500).json({message:err.message})
      return;
   }
}

export async function GetRoomDetails(req:Request,res:Response){
   try{
      const roomId=Number(req.params.id);
      if (!roomId || isNaN(roomId)) {
         res.status(400).json({ message: "Invalid or missing room id" });
         return;
      }
      const room=await prisma.room.findUnique({
         where:{id:roomId},
         include:{members:true}
      })
      if(!room){
         res.status(404).json({message:"Room not found"});
         return;
      }
      res.status(200).json({message:"Room details fetched successfully",room,members:room.members})
      return;
   }catch(err:any){
      res.status(500).json({message:err.message})
      return;
   }
}
export  async function SaveCanvas(req:Request,res:Response){
   try{
      const roomId=Number(req.params.id);
      if (!roomId || isNaN(roomId)) {
         res.status(400).json({ message: "Invalid or missing room id" });
         return;
      }
      const canvas=(req.body.canvas);
      const room = await prisma.room.update({
         where: { id: roomId },
         data: { canvasState: canvas }
      })
      if(!room){
         res.status(404).json({message:"Room not found"});
         return;
      }
      res.status(200).json({message:"Canvas saved successfully", room: room});
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