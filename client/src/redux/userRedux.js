import { createSlice } from "@reduxjs/toolkit";
const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    isFetching: false,
    isLoggedin:false,
    error: false,
  },
  reducers: {
    loginStart: (state) => {
      state.isFetching = true;
    },
    loginSuccess: (state, action) => {
      console.log("called");
      state.isFetching = false;
      state.currentUser = action.payload;
      state.isLoggedin = true;
    },
    loginFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
    logoutSuccess:(state,action)=>{
      state.isLoggedin = action.payload;
      state.currentUser = null;
      // localStorage.clear();
    },
  },
});

export const { loginStart, loginSuccess, loginFailure,logoutSuccess} = userSlice.actions;
export default userSlice.reducer;
