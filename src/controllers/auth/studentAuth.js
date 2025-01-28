const Student = require('../../models/student/studentModel');
const School = require('../../models/superAdmin/superAdmin');

const bcrypt=require('bcrypt');

const loginStudent=async(req,res)=>{
    try{
        const{schoolName,email,password}=req.body;

        const school=await School.findOne({name:schoolName})
        if(!school){
            return res.status(400).json({message:"School Not Found"})
        }
        const studentr=await Student.findOne({email,school:school._id});
        if(!student){
            return res.status(400).json({message:"Invalid Credentials"})
        }
        const isPasswordValid=await bcrypt.compare(password,student.password);
        if(!isPasswordValid){
            return res.status(400).json({message:"Invalid Credentials"});
        }
        return res.status(200).json({
            message:"Successful Login.",
            SchoolId:school._id,
            StudentId:student._id,
        });
    }
    catch(error){
        console.error("Error logging in teacher: ",error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};

module.exports={
    loginStudent,
};
