import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const isAuth=async (req,res,next)=>{
    try {
        const token=req.cookies.token
        if(!token){
            return res.status(401).json({message:"token not found"})
        }   
        const decodedToken=jwt.verify(token,process.env.JWT_SECRET)
        if(!decodedToken){
            return res.status(401).json({message:"token not verified"})
        }
        console.log(decodedToken);
        req.userId=decodedToken.id
          next()
    } catch (error) {
        return res.status(401).json({message:"isAuth error"})
    }
}
export default isAuth