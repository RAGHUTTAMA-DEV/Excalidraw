export default function RoomPage({params}:{params:{roomId:string}}){
    return(
        <div>
            <h1>Room {params.roomId}</h1>
           <div>

            <canvas id="canvas" width={1000} height={1000}></canvas>
           </div>   

            

        </div>
    )
}