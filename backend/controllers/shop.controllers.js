import Shop from "../models/shop.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
export const createEditShop = async (req, res) => {
    try {
        const { name,city,state,address } = req.body;
        let image;
        if(req.file){

            image=await uploadOnCloudinary(req.file.path)
        }
        let shop=await Shop.findOne({owner:req.userId})
        if(!shop){
            const shopData = {
                name,
                city,
                state,
                address,
                owner:req.userId
            };
            if(image) shopData.image = image;
            shop = await Shop.create(shopData);
        }else{
            const updateData = {
                name,
                city,
                state,
                address,
                owner:req.userId
            };
            if(image) updateData.image = image;
            shop=await Shop.findByIdAndUpdate(shop._id, updateData, {new:true})
        }

        await shop.populate("owner items")
            return res.status(201).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `Error creating shop: ${error.message}` })
    }
}

export const getMyShop=async(req,res)=>{
    try {
        const shop=await Shop.findOne({owner:req.userId}).populate("owner").populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
        })
        if(!shop){
            return null
        }
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `get my shop error: ${error.message}` })
    }
}

export const getShopByCity=async(req,res)=>{
    try {
        const {city}=req.params

        const shops=await Shop.find({
            city:{$regex:new RegExp(`${city}$`,"i")}
        }).populate("items")
       if(!shops){
        return res.status(400).json({message:"shops not found"})
       }
                return res.status(200).json(shops)
    } catch (error) {
                return res.status(500).json({ message: `get shop by city error: ${error.message}` })
    }
}