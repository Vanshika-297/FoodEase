import axios from 'axios'
import React,{ useEffect } from 'react'  
import { serverUrl } from '../App'

function useGetCurrentUser() {
  useEffect(() => {
    // This is where you would typically make an API call to fetch the current user's data
    const fetchUser=async ()=>{
        try {
        const result=await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
        console.log(result.data);
    }catch (error) {
        console.log("Get Current User Error", error);
    }
    }
    fetchUser()
  }, [])
}

export default useGetCurrentUser
