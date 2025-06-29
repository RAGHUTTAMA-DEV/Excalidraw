import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { prisma } from "@repo/db/src/index"

const app = express()


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/auth')
const port = process.env.PORT 
app.listen(port, () => {
  console.log('Server is running on port 3000')
})