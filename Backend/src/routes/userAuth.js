const express = require("express")
const authRouter = express.Router();
const {register,login,logout,adminRegister,deleteProfile} = require("../controllers/userAuthent")
const userMiddleware= require("../middleware/userMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware");


// Register
// login
// logout
// GetProfile
authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',userMiddleware, logout);
authRouter.post('/admin/register',adminMiddleware,adminRegister);
authRouter.delete('/admin/register',adminMiddleware,deleteProfile);
authRouter.get('/check',userMiddleware,(req,res)=>{
    const reply ={
        firstName : req.result.firstName,
        emailId : req.result.emailId,
        _id : req.result._id,
        role: req.result.role, // ADDED ROLE HERE
        problemSolved: req.result.problemSolved // ADDED problemSolved array for frontend check
    }

    res.status(200).json({
        user:reply,
        message:"Valid User"
    })
})
// authRouter.get('getProfile',getProfile); 

module.exports = authRouter;