import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { acceptOrder, getCurrentOrder, getDeliveryBoyAssignment, getMyOrders, placeOrder, updateOrderStatus} from "../controllers/order.controllers.js"


const orderRouter=express.Router()

orderRouter.post("/place-order",isAuth,placeOrder)
orderRouter.get("/my-orders",isAuth,getMyOrders)
orderRouter.get("/get-assignments",isAuth,getDeliveryBoyAssignment)
orderRouter.get("/get-current-order",isAuth,getCurrentOrder)
orderRouter.post("/update-status/:orderId/:shopId",isAuth,updateOrderStatus)
orderRouter.get("/accept-order/:assignmentId",isAuth,acceptOrder)

export default orderRouter