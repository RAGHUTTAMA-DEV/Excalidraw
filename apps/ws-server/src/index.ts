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
    socket.on("message", async (roomId: number, messageContent: string) => {
        try {
            //@ts-ignore
            const userId = socket.user.id;
            console.log(roomId, userId, messageContent);
            
            const savedMessage = await prisma.message.create({
                data: {
                    content: messageContent,
                    senderId: userId,
                    roomId: roomId
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            });
            
            socket.to(roomId.toString()).emit("message", savedMessage);
            socket.emit("message", savedMessage); 
        } catch (error) {
            console.error("Error saving message:", error);
            socket.emit("error", "Failed to save message");
        }
    })

    socket.on('join:Room', async (roomId) => {
        try {
            //@ts-ignore
            const userId = socket.user.id;
            const room = await prisma.room.findFirst({
                where: {
                    id: roomId
                },
                include: {
                    messages: {
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    name: true,
                                    lastName: true,
                                    email: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'asc'
                        }
                    }
                }
            });
            
            if (room) {
                socket.join(roomId.toString());
                socket.to(roomId.toString()).emit("user:joined", roomId, userId);
                
                socket.emit("room:data", {
                    messages: room.messages,
                    canvasState: room.canvasState
                });
            } else {
                socket.emit("error", "room not found");
            }
        } catch (err: any) {
            socket.emit("error", err.message);
        }
    })

    socket.on('leave:Room',(roomId)=>{
        //Will fix the ts-ignore after the implementation of the main features
        //@ts-ignore
        const userId=socket.user.id;
        socket.leave(roomId.toString())
        socket.emit("user:left",roomId,userId)
    })
        
    socket.on('drawing:update', async (roomId, elements) => {
        try {
            await prisma.room.update({
                where: { id: roomId },
                data: { canvasState: elements }
            });
            
            socket.to(roomId.toString()).emit("drawing:update", elements);
        } catch (error) {
            console.error("Error saving canvas state:", error);
        }
    })

    socket.on("drawing:clear", async (roomId) => {
        try {
            await prisma.room.update({
                where: { id: roomId },
                data: { canvasState: [] }
            });
            
            socket.to(roomId.toString()).emit("drawing:clear");
        } catch (error) {
            console.error("Error clearing canvas state:", error);
        }
    })

    

    socket.on('cursor:move',(roomId,position)=>{
        socket.to(roomId).emit("cursor:move",position)
    })

    socket.on('disconnect',(roomId)=>{
        socket.leave(roomId.toString())
        socket.to(roomId.toString()).emit("user:disconnected",roomId)
    })
    socket.on("elements:delete",(roomId,elements)=>{
        
        socket.to(roomId.toString()).emit("elements:delete",elements)
    })
}
)
const port=process.env.PORT || 8080
httpServer.listen(port, () => {
    console.log("listening on "+port);
})