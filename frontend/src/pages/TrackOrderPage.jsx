import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { useState } from 'react'
import { IoMdArrowBack } from "react-icons/io";
import DeliverBoyTracking from '../components/DeliverBoyTracking'

function TrackOrderPage() {
    const {orderId}=useParams()
    const [currentOrder,setCurrentOrder]=useState()
    const navigate=useNavigate()
    const handleGetOrder=async()=>{
        try {
            const result=await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`,
            {withCredentials:true})
            setCurrentOrder(result.data)
        } catch (error) {
            console.error("Error fetching order details:", error)
        }
    }
    useEffect(()=>{
        handleGetOrder()
    },[orderId])
  return (
    <div className='max-w-4xl mx-auto p-4 flex flex-col gap-6'>
      <div className='relative top-[20px] left-[20px] z-[10] mb-[10px] flex items-center gap-4' 
            onClick={()=>navigate("/")}>
              <IoMdArrowBack size={35} className='text-[#ff4d2d]'/>
              <h1 className='text-2xl font-bold md:text-center'>Track Order</h1>
            </div>

            {currentOrder?.shopOrders?.map((shopOrder,index)=>(
              <div key={index} className='bg-white rounded-2xl shadow-md p-4 border border-orange-100 space-y-4'>
                <div>
                    <p className='text-lg font-bold mb-2 text-[#ff4d2d]'>{shopOrder.shop.name}</p>
                    <p className='font-semibold'><span>Items:</span> {shopOrder.shopOrderItems.map(item => item.name).join(", ")}</p>
                    <p><span className='font-semibold'>Subtotal:</span> {shopOrder.subtotal}</p>
                    <p className='mt-6'><span className='font-semibold'>Delivery address:</span> {currentOrder?.deliveryAddress?.text}</p>
                </div>
                {shopOrder.status!="delivered"?<>
                {shopOrder.assignedDeliveryBoy ? 
                <div className='text-sm text-gray-700'>
                    <p className='font-semibold'><span>Delivery Boy Name:</span>{shopOrder.assignedDeliveryBoy.fullName}</p>
                    <p className='font-semibold'><span>Delivery Boy Contact No:</span>{shopOrder.assignedDeliveryBoy.mobile}</p>
                </div> 
                : <p className='font-semibold'>Delivery boy not assigned yet</p>}
                </>:<p className='text-green-500 font-semibold text-lg'>Delivered</p>}


                {shopOrder.assignedDeliveryBoy && 
                <div className='h-[400px] w-full rounded-2xl overflow-hidden shadow-md'>
                    <DeliverBoyTracking data={
                    {
                        deliveryBoyLocation:{
                            lat:shopOrder.assignedDeliveryBoy.location.coordinates[1],
                            lon:shopOrder.assignedDeliveryBoy.location.coordinates[0]
                        }
                        ,customerLocation:{
                            lat:currentOrder.deliveryAddress.latitude,
                            lon:currentOrder.deliveryAddress.longitude
                        }
                    }
                }/></div>}
    </div>
            ))}
    </div>
  )
}

export default TrackOrderPage
