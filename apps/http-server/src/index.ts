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

app.get('/api/health', (req, res) => { res.json({ status: 'ok' }); });
app.get('/health', (req, res) => { res.json({ status: 'ok' }); });
app.get('/', (req, res) => { res.json({ status: 'ok', service: 'http-server' }); });

app.use('/api/auth', authroutes);
app.use('/auth', authroutes);
app.use('/api/room', roomroutes);
app.use('/room', roomroutes);

const port = process.env.PORT || 3001;
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log('Server is running on port ' + port);
  });
}

export default app;