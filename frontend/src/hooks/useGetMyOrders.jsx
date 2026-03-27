import axios from 'axios'
import { useEffect } from 'react'  
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setMyShopData } from '../redux/ownerSlice'
import { setMyOrders } from '../redux/userSlice'

function useGetMyOrders() {
  const dispatch=useDispatch()
  const {userData}=useSelector(state=>state.user)
  useEffect(() => {
    // This is where you would typically make an API call to fetch the current user's data
    const fetchOrders=async ()=>{
            // console.log("API starting")   // 🔍 debug
        try {
        const result=await axios.get(`${serverUrl}/api/order/my-orders`,{withCredentials:true})
        dispatch(setMyOrders(result.data))
        console.log(result.data)
         
      }catch (error) {
        console.log(error)
    }
    }
    fetchOrders()
  }, [userData])
}

export default useGetMyOrders
