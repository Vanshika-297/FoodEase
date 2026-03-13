import axios from 'axios'
import { useEffect } from 'react'  
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function useGetCurrentUser() {
  const dispatch=useDispatch()
  useEffect(() => {
    // This is where you would typically make an API call to fetch the current user's data
    const fetchUser=async ()=>{
            // console.log("API starting")   // 🔍 debug
        try {
        const result=await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
        // console.log(result.data);
          // console.log("UserId from middleware:", result.data._id)
        dispatch(setUserData(result.data))
         
      }catch (error) {
        // Silently ignore 401 - user not logged in yet. This error is expected on first load
        if(error.response?.status !== 401) {
          console.log("Get Current User Error", error);
        }
        // console.log("Full Error:", error)
        // console.log("Error Response:", error.response)

    }
    }
    fetchUser()
  }, [])
}

export default useGetCurrentUser
