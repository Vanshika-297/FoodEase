import DeliveryAssignment from "../models/deliveryAssignment.model.js"
import Order from "../models/order.model.js"
import Shop from "../models/shop.model.js"
import User from "../models/user.model.js"
import { sendDeliveryOtpMail } from "../utils/mail.js"
import Razorpay from "razorpay"
import dotenv from "dotenv"

dotenv.config()

let instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});


export const placeOrder=async (req,res)=>{
    try {
        const {cartItems,paymentMethod,deliveryAddress,totalAmount}=req.body
        if(cartItems.length==0 || !cartItems){
            return res.status(400).json({message:"cart is empty"})
        }
        if(!deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude)
        {
            return res.status(400).json({message:"send complete delivery address"})
        }
        const groupItemsByShop={}

        cartItems.forEach(item=>{
            const shopId=item.shop
            if(!groupItemsByShop[shopId]){
                groupItemsByShop[shopId]=[]
            }
            groupItemsByShop[shopId].push(item)
        })

        const shopOrders=await Promise.all(Object.keys(groupItemsByShop).map(async(shopId)=>{
            const shop=await Shop.findById(shopId).populate("owner")
            if(!shop){
                return res.status(400).json({message:"shop not found"})
            }
            const items=groupItemsByShop[shopId]
            const subtotal=items.reduce((sum,i)=>sum+Number(i.price)*Number(i.quantity),0)
            return {
                shop:shop._id,
                owner:shop.owner._id,
                subtotal,
                shopOrderItems:items.map((i)=>({
                    item:i.id,
                    price:i.price,
                    quantity:i.quantity,
                    name:i.name
                }))
            }
    })
        )

        if(paymentMethod=="online"){
            const razorOrder=await instance.orders.create({
                amount:Math.round(totalAmount*100),
                currency:"INR",
                receipt:`receipt_${Date.now()}`,
            })
                const newOrder=await Order.create({
            user:req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders,
            razorpayOrderId:razorOrder.id,
            payment:false
        })
        return res.status(200).json({
            razorOrder,
            orderId:newOrder._id,
        })
        }


        const newOrder=await Order.create({
            user:req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders
        })

      await  newOrder.populate("shopOrders.shopOrderItems.item","name image price" )
      await newOrder.populate("shopOrders.shop","name " )
      await newOrder.populate("shopOrders.owner","name socketId" )
      await newOrder.populate("user","name email mobile" )

        const io=req.app.get("io")
        if(io){
            newOrder.shopOrders.forEach(so=>{
                const ownerSocketId=so.owner?.socketId
                if(ownerSocketId){
                    io.to(ownerSocketId).emit("newOrder",{
                        _id:newOrder._id,
                        paymentMethod:newOrder.paymentMethod,
                        user:newOrder.user,
                        shopOrders:so,
                        createdAt:newOrder.createdAt,
                        deliveryAddress:newOrder.deliveryAddress,
                        payment:newOrder.payment
                    })
                }
            })
        }

        return res.status(201).json(newOrder)

    } catch (error) {
        return res.status(500).json({message:`place order error ${error}`})
    }
}


export const verifyPayment=async(req,res)=>{
    try {
        const {orderId,razorpay_payment_id}=req.body
        const payment=await instance.payments.fetch(razorpay_payment_id)
        if(!payment || payment.status!=="captured"){
            return res.status(400).json({message:"Payment failed"})
        }
        const order=await Order.findById(orderId)
        if(!order){
            return res.status(400).json({message:"Order not found"})
        }
        order.payment=true
        order.razorpayPaymentId=razorpay_payment_id
        await order.save()
    
     await  order.populate("shopOrders.shopOrderItems.item","name image price" )
      await order.populate("shopOrders.shop","name " )
      await order.populate("shopOrders.owner","name socketId" )
      await order.populate("user","name email mobile" )

        const io=req.app.get("io")
        // console.log("io:",!!io)

        if(io){
            order.shopOrders.forEach(so=>{
                const ownerSocketId=so.owner?.socketId
                        // console.log("owner socket:",ownerSocketId)

                if(ownerSocketId){
                    io.to(ownerSocketId).emit("newOrder",{
                        _id:order._id,
                        paymentMethod:order.paymentMethod,
                        user:order.user,
                        shopOrders:so,
                        createdAt:order.createdAt,
                        deliveryAddress:order.deliveryAddress,
                        payment:order.payment
                    })
                }            
            })
        }

        return res.status(200).json(order)
    }catch (error) {
        return res.status(500).json({message:`Payment verification error ${error}`})
    }   
}


export const getMyOrders=async(req,res)=>{
try {
            const user=await User.findById(req.userId)

            if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if(user.role=="user"){
                const orders=await Order.find({user:req.userId}).sort({createdAt:-1})
        .populate("shopOrders.shop","name")
        .populate("shopOrders.owner","name email mobile")
        .populate("shopOrders.shopOrderItems.item","name image price")

        return res.status(200).json(orders)
        }
        else if(user.role=="owner"){
           const orders=await Order.find({"shopOrders.owner":req.userId}).sort({createdAt:-1})
        .populate("shopOrders.shop","name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item","name image price")
        .populate("shopOrders.assignedDeliveryBoy","fullName mobile")

const filteredOrders=orders.map((order=>({
    _id:order._id,
    paymentMethod:order.paymentMethod,
    user:order.user,
    shopOrders:order.shopOrders.find(o=>o.owner._id==req.userId),
    createdAt:order.createdAt,
    deliveryAddress:order.deliveryAddress,
    payment:order.payment
})))

        return res.status(200).json(filteredOrders)
        }
} catch (error) {
       return res.status(500).json({message:`get my orders error ${error}`})

}
}

export const updateOrderStatus=async(req,res)=>{
    try {
        const {orderId,shopId}=req.params
        const {status}=req.body
        const order=await Order.findById(orderId)

        const shopOrder=order.shopOrders.find(o=>o.shop.toString()==shopId)
        if(!shopOrder){
            return res.status(400).json({message:"shop order not found"})
        }
        shopOrder.status=status

        
        let deliveryBoysPayload=[]
        if(status=="out of delivery" && !shopOrder.assignment){
//             console.log("Status:", status)
// console.log("Assignment Exists:", !!shopOrder.assignment)
// console.log("Assignment Value:", shopOrder.assignment)

            const {longitude,latitude}=order.deliveryAddress
            const nearbyDeliveryBoys=await User.find({
                role:"deliveryBoy",
                location:{
                    $near:{
                        $geometry:{
                            type:"Point",
                            coordinates:[Number(longitude),Number(latitude)]
                        },
                        $maxDistance:5000
                    }
                }
            })

            const nearByIds=nearbyDeliveryBoys.map(b=>b._id)
            const busyIds=await DeliveryAssignment.find({
                assignedTo:{$in:nearByIds},
                status:{$nin:["broadcasted","completed"]}
            }).distinct("assignedTo")

            const busyIdSet=new Set(busyIds.map(id=>String(id)))
            const availableBoys=nearbyDeliveryBoys.filter(b=>!busyIdSet.has(String(b._id)))

            const candidates=availableBoys.map(b=>b._id)

            if(candidates.length==0){
                await order.save()
                return res.status(200).json({message:"Order status updated but no available delivery boys"})}


            const deliveryAssignment=await DeliveryAssignment.create({
                order:order._id,
                shop:shopOrder.shop,
                shopOrderId:shopOrder._id,
                broadcastedTo:candidates,
                status:"broadcasted"
            })
            console.log("Created Assignment:", deliveryAssignment)
            console.log("Candidates:", candidates)
            shopOrder.assignedDeliveryBoy=deliveryAssignment.assignedTo

            shopOrder.assignment=deliveryAssignment._id
            deliveryBoysPayload=availableBoys.map(b=>({
                id:b._id,
                fullName:b.fullName,
            longitude:b.location.coordinates?.[0],
            latitude:b.location.coordinates?.[1],
            mobile:b.mobile
            }))

            await deliveryAssignment.populate('order')
            await deliveryAssignment.populate('shop')

            const io=req.app.get("io")
            if(io){
                availableBoys.forEach(boy=>{
    //                     console.log("Boy:", boy.fullName)
    // console.log("Socket:", boy.socketId)

                    const boySocketId=boy.socketId
                    if(boySocketId){
                        io.to(boySocketId).emit("newAssignment",{
                            sentTo:boy._id,
                            assignmentId:deliveryAssignment._id,
                            orderId:deliveryAssignment.order._id,
                            shopName:deliveryAssignment.shop.name,
                            deliveryAddress:deliveryAssignment.order.deliveryAddress,
                            items:deliveryAssignment.order.shopOrders.find(so=>so._id.toString()===deliveryAssignment.shopOrderId.toString())?.shopOrderItems || [],
                            subtotal:deliveryAssignment.order.shopOrders.find(so=>so._id.toString()===deliveryAssignment.shopOrderId.toString())?.subtotal
                        })
                    }
                })
            }
        }

        await order.save()
        const updatedShopOrder=order.shopOrders.find(o=>o.shop.toString()==shopId)
        await order.populate("shopOrders.shop","name")
        await order.populate("shopOrders.assignedDeliveryBoy","fullName email mobile")
        await order.populate("user","socketId")
   
        const io=req.app.get("io")
        if(io){
            const userSocketId=order.user?.socketId
            if(userSocketId){
                io.to(userSocketId).emit("update-status",{
                    orderId:order._id,
                    shopId:updatedShopOrder.shop._id,
                    status:updatedShopOrder.status,
                    userId:order.user._id,
                                })
            }
        }
    
        return res.status(200).json({
            shopOrder:updatedShopOrder,
            assignedDeliveryBoy:updatedShopOrder?.assignedDeliveryBoy,
            availableBoys:deliveryBoysPayload,
            assignment:updatedShopOrder?.assignment._id
        })
    } catch(error) {
               return res.status(500).json({message:`Order Status error ${error}`})
    }
}

export const getDeliveryBoyAssignment=async(req,res)=>{
    try {
        const deliveryBoyId=req.userId
        // console.log("Delivery Boy ID:", deliveryBoyId)
        const assignments=await DeliveryAssignment.find({
            broadcastedTo:deliveryBoyId,
            status:"broadcasted"
        })
        .populate("order")
        .populate("shop")

        // console.log("Assignments:", assignments)
        const formated = assignments.map(a => {
    const shopOrder = a.order?.shopOrders?.find(
        so => so._id.toString() === a.shopOrderId.toString()
    );

    return {
        assignmentId: a._id,
        orderId: a.order?._id,
        shopName: a.shop?.name || "Unknown",
        deliveryAddress: a.order?.deliveryAddress,
        items: shopOrder?.shopOrderItems || [],
        subtotal: shopOrder?.subtotal || 0
    };
});
        return res.status(200).json(formated)
    } catch (error) {
      return res.status(500).json({message:`Get Assignment error ${error}`}) 
    }
}


export const acceptOrder=async(req,res)=>{
    try {
        const {assignmentId}=req.params
        const assignment=await DeliveryAssignment.findById(assignmentId)
        if(!assignment){
            return res.status(400).json({message:"Assignment not found"})
        }
        if(assignment.status!=="broadcasted"){
            return res.status(400).json({message:"Assignment is expired"})
        }
        const alreadyAssigned=await DeliveryAssignment.findOne({
            assignedTo:req.userId,
            status:{$nin:["broadcasted","completed"]}
        })
        if(alreadyAssigned){
            return res.status(400).json({message:"You have already accepted another order"})
        }
        assignment.assignedTo=req.userId
        assignment.status="assigned"
        assignment.acceptedAt=new Date()
        await assignment.save()

        const order=await Order.findById(assignment.order)
        if(!order){
            return res.status(400).json({message:"Order not found"})
        }
        const shopOrder=order.shopOrders.find(so=>so._id.toString()===assignment.shopOrderId.toString())  
        shopOrder.assignedDeliveryBoy=req.userId
        await order.save()

        return res.status(200).json({
            message:"Order accepted successfully"
        })
    } catch (error) {
        return res.status(500).json({message:`Accept order error ${error}`})
    }
}

 export const getCurrentOrder=async(req,res)=>{
    try {
        const assignment=await DeliveryAssignment.findOne({
            assignedTo:req.userId,
            status:"assigned"
        }).populate("shop","name")
        .populate("assignedTo","fullName email mobile location")
        .populate({
            path:"order",
            populate:[{path:"user", select:"fullName email mobile"}]
        })
        if(!assignment){
            return res.status(400).json({message:"No current assignments"})
        }
        if(!assignment.order){
            return res.status(400).json({message:"Order not found for the assignment"})
        }

        const shopOrder=assignment.order.shopOrders.find(so=>so._id.toString()===assignment.shopOrderId.toString())
        if(!shopOrder){
            return res.status(400).json({message:"Shop order not found for the assignment"})
        }
        let deliveryBoyLocation={lat:null,lon:null}
        if(assignment.assignedTo.location.coordinates.length==2){
        deliveryBoyLocation.lat=assignment.assignedTo.location.coordinates[1]
        deliveryBoyLocation.lon=assignment.assignedTo.location.coordinates[0]
        }
        let customerLocation={lat:null,lon:null}
        if(assignment.order.deliveryAddress){
            customerLocation.lat=assignment.order.deliveryAddress.latitude
            customerLocation.lon=assignment.order.deliveryAddress.longitude
        }
        return res.status(200).json({
            _id:assignment.order._id,
            user:assignment.order.user,
            shopOrder,
            deliveryAddress:assignment.order.deliveryAddress,
            customerLocation,
            deliveryBoyLocation
        })
    } catch (error) {
        return res.status(500).json({message:`Get current order error ${error}`})
    }
}

export const getOrderById=async(req,res)=>{
    try {
        const {orderId}=req.params
        const order=await Order.findById(orderId)
        .populate("user")
        .populate({
            path:"shopOrders.shop",
            model:"Shop",
        })
        .populate({
            path:"shopOrders.assignedDeliveryBoy",
            model:"User",
        })
        .populate({
            path:"shopOrders.shopOrderItems.item",
            model:"Item",
        })
        .lean()

        if(!order){
            return res.status(400).json({message:"Order not found"})
        }
        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({message:`Get order by id error ${error}`})
    }
}

export const sendDeliveryOtp=async(req,res)=>{
    try {
        const {orderId,shopOrderId}=req.body
        const order=await Order.findById(orderId).populate("user")
        const shopOrder=order.shopOrders.id(shopOrderId)
        if(!order || !shopOrder){
            return res.status(400).json({message:"Order or shop order not found"})
        }   
        const otp=Math.floor(1000+Math.random()*9000).toString()
        shopOrder.deliveryOtp=otp
        shopOrder.otpExpires=Date.now()+5*60*1000
        await order.save()
        await sendDeliveryOtpMail(order.user,otp)
        return res.status(200).json({message:`Delivery OTP sent to ${order?.user?.email}`})
    } catch (error) {
        return res.status(500).json({message:`Send delivery OTP error ${error}`})
    }
}

export const verifyDeliveryOtp=async(req,res)=>{
    try {
        const {orderId,shopOrderId,otp}=req.body
        const order=await Order.findById(orderId)
        const shopOrder=order.shopOrders.id(shopOrderId)
        if(!order || !shopOrder){
            return res.status(400).json({message:"Order or shop order not found"})
        }
        if(shopOrder.deliveryOtp!==otp || !shopOrder.otpExpires || shopOrder.otpExpires<Date.now()){
            return res.status(400).json({message:"Invalid OTP"})
        }
        shopOrder.status="delivered"
        shopOrder.deliveredAt=new Date()
        await order.save()
        await DeliveryAssignment.deleteOne({
            shopOrderId:shopOrder._id,
            order:orderId,
            assignedTo:shopOrder.assignedDeliveryBoy
        })
        return res.status(200).json({message:"OTP verified, order Delivered Successfully"})
    } catch (error) {
        return res.status(500).json({message:`Verify delivery OTP error ${error}`})
    }
}