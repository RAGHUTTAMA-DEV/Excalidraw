import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv"
dotenv.config()

const httpServer = createServer();

const io=new Server(httpServer,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
    socket.on("message", (msg) => {
        console.log("message: " + msg);
    })
}
)
const port=process.env.PORT || 8080
httpServer.listen(port, () => {
    console.log("listening on "+port);
})