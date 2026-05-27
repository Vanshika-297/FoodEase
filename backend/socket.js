 import User from "./models/user.model.js";
 
export const socketHandler=  (io)=>{
    io.on("connection",(socket)=>{
            // console.log("New connection:", socket.id); // ✅
        socket.on("identity",async({userId})=>{
                //   console.log("Identity event received:", userId); // ✅
            try{
                const user=await User.findByIdAndUpdate(userId,{socketId:socket.id,isOnline:true},
                {new:true})
                        // // console.log("Updated user:", user); // ✅
            }catch(err){
                console.error("Error occurred while updating user socket ID:", err)
            }
        })
        socket.on("disconnect",async()=>{
            try{
            await User.findOneAndUpdate({socketId:socket.id},{isOnline:false,socketId:null})
            }catch(err){
                console.error("Error occurred while handling disconnect:", err)
            }
        })
    })
}