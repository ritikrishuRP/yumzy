import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

export const signUp = async (req, res) => {
    try {
        const {fullName,email,password,mobile,role} = req.body;

        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({message:"User already exists"});
        }

        if(password.length < 6){
            return res.status(400).json({message:"Password must be at least 6 characters"});
        }

        if(mobile.length != 10){
            return res.status(400).json({message:"Invalid mobile number"});
        }

        const hashedPassword = await bcrypt.hash(password,10);

        user = await User.create({
            fullName,
            email,
            password:hashedPassword,
            mobile,
            role
        });

        const token = await genToken(user._id);

        res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000 // 7 days
        });

        return res.status(201).json(user);


    } catch (error) {
        return res.status(500).json({message:"SignUp Error",error: error.message});
    }
}

export const signIn = async (req, res) => {
    try {
        const {email,password} = req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"User does not exist"});
        }

       const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({message:"Invalid credentials"});
        }

        const token = await genToken(user._id);

        res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000 // 7 days
        });

        return res.status(200).json(user);


    } catch (error) {
        return res.status(500).json({message:"SignIn Error",error: error.message});
    }
}

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({message:"SignOut successful"});
    } catch (error) {
        return res.status(500).json({message:"SignOut Error",error: error.message});
    }
}

export const sendOtp = async(req,res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"User does not exist"});
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp = otp;
        user.otpExpires = Date.now() + 5*60*1000;
        await user.save();
        await sendOtpMail(email,otp);
        return res.status(200).json({message:"OTP sent to your email"});
    } catch (error) {
        return res.status(500).json({message:"Send OTP Error",error: error.message});
    }
}

export const verifyOtp = async(req,res) => {
    try {
        const {email,otp} = req.body;
        const user = await User.findOne({email});
        if(!user || user.resetOtp !== otp || user.otpExpires < Date.now()){
            return res.status(400).json({message:"Invalid or expired OTP"});
        }
        user.isOtpVerified = true;
        user.resetOtp = null;
        user.otpExpires = null;
        await user.save();
        return res.status(200).json({message:"OTP verified"});
    } catch (error) {
        return res.status(500).json({message:"Verify OTP Error",error: error.message});
    }
}

export const resetPassword = async(req,res) => {
    try {
        const {email,newPassword} = req.body;
        const user = await User.findOne({email});
        if(!user || !user.isOtpVerified){
            return res.status(400).json({message:"OTP not verified"});
        }
        const hashedPassword = await bcrypt.hash(newPassword,10);
        user.password = hashedPassword;
        user.isOtpVerified = false;
        await user.save();
        return res.status(200).json({message:"Password reset successful"});
    } catch (error) {
        return res.status(500).json({message:"Reset Password Error",error: error.message});
    }
}