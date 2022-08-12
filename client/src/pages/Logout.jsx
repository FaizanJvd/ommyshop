import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { logout } from "../redux/apiCalls";
import { useDispatch } from "react-redux";
import { persistor } from "../redux/store";
const Logout = () => {
  const navigate = useHistory();
  const dispatch = useDispatch();
  useEffect(() => {
    logout(dispatch);
    // localStorage.clear();
    // persistor.pause();
    // persistor.flush().then(() => {
    //   return persistor.purge();
    // });
    navigate.push("/");
  }, []);
  return <div></div>;
};

export default Logout;
