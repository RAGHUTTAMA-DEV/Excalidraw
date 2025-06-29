import express from 'express'
import { Request,Response } from 'express';
import dotenv from 'dotenv'
dotenv.config()
import { prisma } from "@repo/db";
import authroutes from './Routes/Authroutes.js'

const app = express()
app.use(express.json())

app.use('/api/auth',authroutes)

const port = process.env.PORT 
app.listen(port, () => {
  console.log('Server is running on port'+port)
})