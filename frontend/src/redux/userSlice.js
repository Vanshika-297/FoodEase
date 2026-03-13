import { createSlice } from "@reduxjs/toolkit";
const userslice = createSlice({
    name:"user",
    initialState:{
        userData:null,
        city:null
    },
    reducers:{
        setUserData:(state,action)=>{
            state.userData=action.payload
        },
        setCity:(state,action)=>{
            state.city=action.payload
    }
}
})
export const { setUserData, setCity } = userslice.actions;
export default userslice.reducer;
