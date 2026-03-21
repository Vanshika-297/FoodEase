import axios from 'axios'
import { useEffect } from 'react'  
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setMyShopData } from '../redux/ownerSlice'

function useGetMyShop() {
  const dispatch=useDispatch()
  const {userData}=useSelector(state=>state.user)
  useEffect(() => {
    // This is where you would typically make an API call to fetch the current user's data
    const fetchShop=async ()=>{
            // console.log("API starting")   // 🔍 debug
        try {
        const result=await axios.get(`${serverUrl}/api/shop/get-my`,{withCredentials:true})
        dispatch(setMyShopData(result.data))
         
      }catch (error) {
        // Silently ignore 401 - owner not logged in yet. This error is expected on first load
        if(error.response?.status !== 401 &&     error.response?.status !== 404) {
          console.log("Get My Shop Error", error);
        }
        // console.log("Full Error:", error)
        // console.log("Error Response:", error.response)
    }
    }
    fetchShop()
  }, [userData])
}

export default useGetMyShop
