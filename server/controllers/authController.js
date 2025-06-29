import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import transporter from '../config/nodemailer.js';

// Remove named import for verify (not supported in ESM with CommonJS modules)

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing data' });
    }
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already Exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Our Service',
            text: `Hello ${name},\n\nThank you for registering with us! We're excited to have you on board.\n\nBest regards,\nThe Team`
        };
        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: 'User registered successfully' });
    } 
    catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ success: false, message: 'Email and Password required' });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'Invalid email' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid password' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.json({ success: true });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: "Logged Out " });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const sendVerifyOtp = async (req, res) => {
    try {
        const userId = req.userId; // Get userId from middleware
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        if (user.isAccountVerified) {
            return res.json({ success: false, message: 'Account already verified' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Verify Your Account',
            text: `Your verification OTP is ${otp}. It is valid for 10 minutes.`
        };
        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: 'OTP sent to your email' });

    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    const { otp } = req.body;
    const userId = req.userId; // Get userId from middleware
    if (!userId || !otp) {
        return res.json({ success: false, message: 'Missing data' });
    }
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        if (user.isAccountVerified) {
            return res.json({ success: false, message: 'Account already verified' });
        }
        if (user.verifyOtp !== otp || Date.now() > user.verifyOtpExpireAt) {
            return res.json({ success: false, message: 'Invalid or expired OTP' });
        }
        user.isAccountVerified = true; 
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();
        return res.json({ success: true, message: 'Account verified successfully' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const isAuthenticated = async (req, res) => {
    
    try {
       return res.json({ success: true, message: 'User is authenticated' });
    } catch (error) {
        return res.json({ success: false, message: 'Invalid token' });
    }
};

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: 'Email is required' });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }   
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;    
        user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();  
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Reset Your Password',
            text: `Your password reset OTP is ${otp}. It is valid for 10 minutes.`
        };
        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
        return res.json({ success: false, message: error.message });        
    }
};

export const resetPassword = async (req, res) => {
    const { otp, newPassword } = req.body;
    if (!otp || !newPassword) {
        return res.json({ success: false, message: 'Missing data' });
    }
    try {
        const user = await userModel.findOne({ resetOtp: otp });
        if (!user || Date.now() > user.resetOtpExpireAt) {
            return res.json({ success: false, message: 'Invalid or expired OTP' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;
        await user.save();
        return res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

    
