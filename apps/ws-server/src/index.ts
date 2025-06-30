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
            socket.emit("joined",roomId,userId)
        }else{
            socket.emit("error","room not found")
        }
    })
}
)
const port=process.env.PORT || 8080
httpServer.listen(port, () => {
    console.log("listening on "+port);
})