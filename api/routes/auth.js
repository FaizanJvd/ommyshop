const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP");
const nodemailer = require('nodemailer');
const path = require('path');
const UserVerification = require('../models/VerifyAccount');
const {v4:uuidv4} = require('uuid');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {// who send email
    user: 'yourGmail@gmail.com',
    pass: "Generated Password"
  }
});

//REGISTER
const sendVerificationEmail = async ({_id,email},res)=>{
  const currentUrl = "http://localhost:5000/";
  const uniqueString = uuidv4() + _id;

  const mailOption = {
    from:"yourGmail@gmail.com",
    to:email,
    subject:"Verify your Email",
    html:`<p> Verify Email to active account</p><p> Link expire in 1 hour</p>
    <p> Press <a href=${currentUrl + "api/auth/verify/" + _id + "/"+uniqueString}>here</a> to activate account</p>`
  };
  const addVerification = new UserVerification({
    userId:_id,
    uniqueString:uniqueString,
    createAt:Date.now(),
    expireAt:Date.now()+3600000
  });
  const add = await addVerification.save();
  if(add){
    const sended = await transporter.sendMail(mailOption);
    if(sended){
      return "Verification mail sended and Register SuccessFully";
    }else{return "Mail not sended";}
  }
  else{
    return "No verfication is added";
  }
}
//Link hit in mail to get HTML page
router.get('/verify/:userId/:uniqueString',async (req,res)=>{
  const {userId,uniqueString} = req.params;
  const findVerify  = await UserVerification.findOne({userId:userId});
  if(findVerify){
    if(findVerify.expireAt< Date.now()){
      const deleteExpire = await UserVerification.deleteOne({userId:userId});
      if(deleteExpire){
        const deleteUser = await User.deleteOne({_id:userId});
        if(deleteUser){
          res.redirect(`/api/auth/verified/error=true&message=${"Link Expire"}`)
        }
        else{
          res.redirect(`/api/auth/verified/error=true&message=${"Error while deleting user Record"}`)
        }
        
      }
      else{
        res.redirect(`/api/auth/verified/error=true&message=${"Error Occure while clearing Expire Link"}`)
      }
      
    }
    else{
      const updateVerify = await User.findByIdAndUpdate({_id:userId},{$set:{verified:true}});
      if(updateVerify){
        const deleteVerify = await UserVerification.deleteOne({userId:userId});
        if(deleteVerify){
          res.sendFile(path.join(__dirname,"./../views/verified.html"));
        }
      }
      else{
        res.redirect(`/api/auth/verified/error=true&message=${"Account not Activated"}`)
      }
      
    }
  }
  else{
    res.redirect(`/api/auth/verified/error=true&message=${"Account Record not found or Already Verified"}`)
  }

});
router.get("/verified",(req,res)=>{
  res.sendFile(path.join(__dirname,"./../views/verified.html"))
})

router.post("/register", async (req, res) => {
  const {username,email,password,confirmPassword} = req.body;
  if(password!==confirmPassword){
    return res.send("Password and Confirm Password should be Same");
  }
  const newUser = new User({
    username: username,
    email:email,
    password:
    CryptoJS.AES.encrypt(
      password,
      process.env.PASS_SEC
    ).toString(),
    verified:false,
  });

  try {
    const savedUser = await newUser.save();
    const msg =await sendVerificationEmail(savedUser,res);
    res.send(msg);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(401).json("Wrong credentials!");
    if(user.verified){
      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.PASS_SEC
      );
      const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
      OriginalPassword !== req.body.password &&
        res.status(401).json("Wrong credentials!");
  
      const accessToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SEC,
        {expiresIn:"3d"}
      );
  
      const { password, ...others } = user._doc;
      res.status(200).json({...others, accessToken});
    }
    else{
      res.status(401).json("Verify Account First!");
    }

    
  } catch (err) {
    res.status(500).json(err);
  }
});


router.post('/sendOTP',async (req,res)=>{
  const email = req.body.email;
  const find = await User.findOne({email:email});
  if(find){
    const otp = Math.floor(1000+Math.random()*9999);

    var mailOptions ={
      from: 'yourEmail@gmail.com',
      to: email,// who recieve email
      subject: 'Forget Password OTP',
      html: `<h1>OTP</h1><br></br>Email: ${otp}` 
    };
    transporter.sendMail(mailOptions);
    const addOTP = new OTP({
      userEmail:email,
      otp:otp
    })
    addOTP.save();
    return res.status(200).send({"msg":"ok"})
  }
  else{
    return res.send({"msg":"Invalid"});
  }

});

router.post('/verifyOTP',async (req,res)=>{
  const {email,otp} = req.body;
  const verify = await OTP.findOne({email:email,otp:otp});
  if(verify){
    await OTP.findOneAndRemove({email:email});
    return res.send({"msg":"ok"});
  }
  else{
    return res.send({"msg":"Invalid"});
  }
});
router.post('/updatePassword',async (req,res)=>{
  const {email,password}  = req.body;
  const update  = await User.findOneAndUpdate({email:email},{$set:{password:password}})
  if(update){
    return res.status(200).send({"msg":"ok"});
  }
  else{
    return res.send({"msg":"Invalid"});
  }
});
router.get('/logout',(req,res)=>{
  res.send(false);
})

module.exports = router;
