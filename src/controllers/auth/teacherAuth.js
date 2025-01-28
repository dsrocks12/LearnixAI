const Teacher = require('../../models/teacher/teacherModel');

const School = require('../../models/superAdmin/superAdmin');
const bcrypt=require('bcrypt');

const loginTeacher=async(req,res)=>{
    try{
        const{schoolName,email,password}=req.body;

        //School check kar
        const school=await School.findOne({name:schoolName})
        if(!school){
             return res.status(400).json({message:"School Not Found."})

        }
        //Teacher Check kar
        const teacher=await Teacher.findOne({email, school: school._id })
        if(!teacher){
            return res.status(400).json({message:"Invalid credentials."})
        }
        //Password Check Kar
        const isPasswordValid=await bcrypt.compare(password,teacher.password);
        if(!isPasswordValid){
            return res.status(400).json({message:"Invalid credentials."})
        }

        return res.status(200).json({
            message:"Successful Login.",
            SchoolId:school._id,
            TeacherId:teacher._id,
        });
    }catch(error){
        console.error("Error logging in teacher: ",error);
        res.status(500).json({ message: "Server error. Please try again later." });

    }
};

module.exports={
    loginTeacher,
};
