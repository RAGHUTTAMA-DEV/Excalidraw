import express from 'express'
import { Request,Response } from 'express';
import dotenv from 'dotenv'
dotenv.config()
import cors from 'cors'
import { prisma } from "@repo/db";
import authroutes from './Routes/Authroutes.js';
import roomroutes from "./Routes/Roomroutes.js";
const app = express()

// Use CORS middleware
app.use(cors({
    origin: '*', // Allow all origins for now
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "2mb" }))

app.use('/api/auth',authroutes)
app.use('/api/room',roomroutes)

const port = process.env.PORT || 3001;
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log('Server is running on port ' + port);
  });
}

// Support both CommonJS require() (for Vercel Function runtime) and ESM
module.exports = app;
export default app;