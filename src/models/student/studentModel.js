const mongoose=require('mongoose')

const studentSchema=new mongoose.Schema({
    schoolName:{
        type:String,
        required:true,
        default:null,
    },
    region: {
        type:String,
        required:true,
    },
 
    email:{
        type:String,
        required:true,
        unique:true,
      },

    password:{
        type:String,
        required:true
      },
    }
 )

studentSchema.index({schoolName:1,region:1,email:1},{unique:true});

const Student = mongoose.model('Student', studentSchema);

module.exports= Student;
