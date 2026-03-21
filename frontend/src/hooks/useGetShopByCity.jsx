import axios from 'axios'
import { useEffect } from 'react'  
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setShopsInMyCity, setUserData } from '../redux/userSlice'

function useGetShopByCity() {
  const dispatch=useDispatch()
  const {currentCity}=useSelector(state=>state.user)

  useEffect(() => {
    // This is where you would typically make an API call to fetch the current user's data
    const fetchShops=async ()=>{
            // console.log("API starting")   // 🔍 debug
        try {
        const result=await axios.get(`${serverUrl}/api/shop/get-by-city/${currentCity}`,
            {withCredentials:true})
          // console.log("UserId from middleware:", result.data._id)
        dispatch(setShopsInMyCity(result.data))
          // console.log(result.data);

      }catch (error) {
        // Silently ignore 401 - user not logged in yet. This error is expected on first load
        if(error.response?.status !== 401 &&     error.response?.status !== 404) {
          console.log("Get Shops By City Error", error);
        }
        // console.log("Full Error:", error)
        // console.log("Error Response:", error.response)

    }
    }
    fetchShops()
  }, [currentCity])
}

export default useGetShopByCity
