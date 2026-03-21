import axios from "axios";
import React, { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { auth } from "../../firebase.js";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { ClipLoader } from "react-spinners"
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function SignIn() {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  const [showPassword, setShowPassword] = useState(false);
const navigate=useNavigate()
const [email,setEmail]=useState("")
const [password,setPassword]=useState("")
const [error,setError]=useState("")
const [loading,setLoading]=useState(false)
const dispatch=useDispatch()

const handleSignIn=async ()=>{
    setLoading(true)  
    try {
        const result=await axios.post(`${serverUrl}/api/auth/signin`,
            {email,password},{withCredentials:true})
          dispatch(setUserData(result.data))
        setError("")
         setLoading(false)
    } catch (error) {
      setError(error.response?.data?.message )   
        setLoading(false)     
    }
}

const handleGoogleAuth=async ()=>{
    const provider = new GoogleAuthProvider()
    const result=await signInWithPopup(auth, provider)
try {
  const {data}=await axios.post(`${serverUrl}/api/auth/google-auth`,{
    email:result.user.email,
  },{withCredentials:true})
      dispatch(setUserData(data))
}catch (error) {
  console.log('Google Auth Error',error);
  setError(error.response?.data?.message || "Google authentication failed")
}
}

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className={`bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px]
     `}
        style={{
          border: `1px solid ${borderColor}`,
        }}
      >
        <h1
          className={`text-3xl font-bold`}
          style={{
            color: primaryColor,
          }}
        >
          FoodEase
        </h1>
        <p className="text gray-600 mb-8">
          Sign In your account to get started with delicious food deliveries
        </p>

        {/* Email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email
          </label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none "
            placeholder="Enter your Email"
            style={{
              border: `1px solid ${borderColor}`,
            }}
              onChange={(e)=>setEmail(e.target.value)}
            value={email}
           required
          />
        </div>
        {/* password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={`${showPassword?"text":"password"}`}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none "
              placeholder="Enter your Password"
              style={{
                border: `1px solid ${borderColor}`,
              }}           onChange={(e)=>setPassword(e.target.value)}
            value={password}
            required
            />
            <button className="absolute right-3 cursor-pointer top-[14px] text-gray-500" onClick={()=>setShowPassword(prev=>!prev)}>
              {!showPassword ? <FaRegEye /> :<FaRegEyeSlash />}
            </button>
          </div>
        </div>
        <div className="text-right mb-4 text-[#ff4d2d] font-medium cursor-pointer" onClick={()=>navigate("/forgot-password")}>
          Forgot Password
        </div>
      <button className={`w-full font-semibold mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 
      bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`} 
      onClick={handleSignIn} disabled={loading}>
      {loading?<ClipLoader size={20} color="#fff"/>:"Sign In"}
        </button>
        {error && <p className="text-red-500 text-center my-[10px]">*{error}</p>}
      <button 
      type="button"
      className="w-full mt-4 flex items-center justify-center
      gap-2 border rounded-lg py-2 cursor-pointer transition duration-200 border-gray-400 hover:bg-gray-400"
      onClick={handleGoogleAuth}>
     <FcGoogle size={20}/>
     <span>Sign in with Google</span>
      </button>
      <p className="text-center mt-6 cursor-pointer" onClick={()=>navigate("/signup")}>Want to create a new account ?
        <span className="text-[#ff4d2d]">Sign Up</span></p>
      </div>
    </div>
  );
}

export default SignIn;
