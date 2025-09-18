import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";

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