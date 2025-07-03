import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv"
dotenv.config()
import { Socketmidlleware } from "./Socketmidlleware";
const httpServer = createServer();
import { prisma } from "@repo/db";

const io=new Server(httpServer,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
io.use(Socketmidlleware)

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
    socket.on("message", (roomId) => {
        //@ts-ignore
      const userId=socket.user.id;
      console.log(roomId,userId)
      socket.to(roomId).emit("message", { userId, roomId });
    
    })

    socket.on('join:Room',async (roomId)=>{
        //@ts-ignore
        const userId=socket.user.id;
         const isExist=await prisma.room.findFirst({
            where:{
                id:roomId
            }
        })
        if(isExist){
            socket.join(roomId)
            socket.to(roomId).emit("user:joined",roomId,userId)
        }else{  
            socket.emit("error","room not found")
        }
    })

    socket.on('leave:Room',(roomId)=>{
        //Will fix the ts-ignore after the implementation of the main features
        //@ts-ignore
        const userId=socket.user.id;
        socket.leave(roomId)
        socket.emit("user:left",roomId,userId)
    })
        
    socket.on('drawing:update',(roomId,elements)=>{
        socket.to(roomId).emit("drawing:update",elements)
    })

    socket.on('cursor:move',(roomId,position)=>{
        socket.to(roomId).emit("cursor:move",position)
    })

    socket.on('disconnect',(roomId)=>{
        socket.leave(roomId)
        socket.to(roomId).emit("user:disconnected",roomId)
    })
    socket.on("elements:delete",(roomId,elements)=>{
        
        socket.to(roomId).emit("elements:delete",elements)
    })
}
)
const port=process.env.PORT || 8080
httpServer.listen(port, () => {
    console.log("listening on "+port);
})