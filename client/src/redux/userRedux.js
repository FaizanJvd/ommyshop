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
      state.isFetching = false;
      state.currentUser = action.payload;
      state.isLoggedin = true;
    },
    loginFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
    logoutSuccess:(state)=>{
      state.isLoggedin = false;
      state.currentUser = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure,logoutSuccess} = userSlice.actions;
export default userSlice.reducer;
