import { Request,Response } from "express"
export  async function Createroom(req:Request,res:Response){
   try{ 

   }catch(err:any){
      res.status(500).json({message:err.message})
   }
}

export function GetRoom(req:Request,res:Response){

}

export function DeleteRoom(req:Request,res:Response){

}

export function UpdateRoom(req:Request,res:Response){
    
}