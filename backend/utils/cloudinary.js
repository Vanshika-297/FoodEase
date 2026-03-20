import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"
export const uploadOnCloudinary=async(filePath)=>{
    cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
    try {
    const result= await cloudinary.uploader.upload(filePath)
    fs.unlinkSync(filePath)
    return result.secure_url
    } catch (error) {
        fs.unlinkSync(filePath)
        console.log(error);
        
    }
}

