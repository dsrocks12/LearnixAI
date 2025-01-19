const mongoose = require('mongoose');


// Schema for the class
const classSchema = new mongoose.Schema({
    schoolName:{
        type:String,
        required:true,
        default: null
    },

    classNumber:{
        type: String,
        required: true,
        default: null,
    },
    studentEmails: {
        type: [String],  // List of student email addresses
        required: true,
        default: null
    },
  
});



const Class = mongoose.model('Class', classSchema);


module.exports = Class;

