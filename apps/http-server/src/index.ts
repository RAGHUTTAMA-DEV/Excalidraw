import express from 'express'
import { Request,Response } from 'express';
import dotenv from 'dotenv'
dotenv.config()
import { prisma } from "@repo/db";
import authroutes from './Routes/Authroutes.js'

const app = express()
app.use(express.json())

app.post('/api/auth/create',async (req:Request,res:Response)=>{
  try{
    const {email,password,name} = req.body;
    const user = await prisma.user.create({
      data:{
        email,
        password,
        name
      }
    })
    res.status(200).json(user)

  }catch(err){
    console.log(err)
  }
})
const port = process.env.PORT 
app.listen(port, () => {
  console.log('Server is running on port'+port)
})