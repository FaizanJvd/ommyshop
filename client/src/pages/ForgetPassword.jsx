import React, { useState,useEffect} from "react";
import Modal from "@material-ui/core/Modal";
import Box from "@material-ui/core/Box";
import { useHistory } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import { publicRequest } from "../requestMethods";
const ForgetPassword = () => {
  const history = useHistory();
  const [ehide, setEhide] = useState(false);
  const [ohide, setOhide] = useState(true);
  const [phide, setPhide] = useState(true);
  const [email, setEmail] = useState("");
  const [validMsg, setValidMsg] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(0);
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  const submitEmail =async (e) => {
    e.preventDefault();
    const res = await publicRequest.post("auth/sendOTP",{email})
    if(res.data.msg==="ok"){
      setValidMsg(null);
      setEhide(true);
      setOhide(false);

    }
    else{
      setValidMsg(res.data.msg);
    }
  };
  const submitOtp =async(e)=>{
    e.preventDefault();
    const res = await publicRequest.post("auth/verifyOTP",{email,otp})
    if(res.data.msg==="ok"){
      setValidMsg(null);
      setOhide(true);
      setPhide(false);
    }
    else{
      setValidMsg(res.data.msg);
    }
  }
  const newPassword = async(e)=>{
    e.preventDefault();
    const res = await publicRequest.post("auth/updatePassword",{email,password})
    if(res.data.msg==="ok"){
      history.push("/login");
    }
    else{
      setValidMsg(res.data.msg);
    }
  }

  return (
    <div>
      <Modal
        open={true}
        // onClose={false}
        aria-labelledby="modal-modal-title"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            <i>Update Password</i>
          </Typography>
          <strong hidden={ehide} style={{ marginTop: "2em" }}>
            Email :{" "}
          </strong>
          <input
            hidden={ehide}
            style={{ marginTop: "2em" }}
            type="email"
            placeholder="Enter Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            hidden={ehide}
            style={{ marginLeft: "2em" }}
            onClick={
              submitEmail
          }
          >
            Submit
          </button>
          <br />
          <strong hidden={ehide} style={{ marginTop: "2em", color: "red" }}>
            {validMsg==="ok"?"":validMsg}
          </strong>
          <div>
            <strong hidden={ohide}>OTP : </strong>
            <input
              type="number"
              placeholder="OTP"
              hidden={ohide}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              hidden={ohide}
              onClick={submitOtp}
            >
              verify
            </button>
            <br />
            <strong hidden={ohide} style={{ marginTop: "2em", color: "red" }}>
            {validMsg==="ok"?"":validMsg}
            </strong>
          </div>
          <div>
            <strong hidden={phide}>New Password : </strong>
            <input
              type="password"
              placeholder="Password"
              hidden={phide}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              hidden={phide}
              onClick={
                newPassword}
            >
              Update
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default ForgetPassword;
