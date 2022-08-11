const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP");
const nodemailer = require('nodemailer');
//REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password:
    CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(401).json("Wrong credentials!");

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    console.log(OriginalPassword);

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
  } catch (err) {
    res.status(500).json(err);
  }
});


router.post('/sendOTP',async (req,res)=>{
  const email = req.body.email;
  const find = await User.findOne({email:email});
  if(find){
    const otp = Math.floor(1000+Math.random()*9999);
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {// who send email
        user: 'yourEmail@gmail.com',
        pass: "generated password"
      }
    });
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
})

module.exports = router;
