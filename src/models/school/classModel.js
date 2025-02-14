const mongoose = require('mongoose');


const classSchema = new mongoose.Schema({
    schoolName: {
        type: String,
        required: true,
        default: null
    },
    classNumber: {
        type: String,
        required: true,
        default: null
    },
    studentDetails: {
        type: [
            {
                email: {
                    type: String,  
                    required: true
                },
                studentName: {
                    type: String, 
                    required: true
                }
            }
        ],
        required: true,
        default: [] 
    }
});
      

const Class = mongoose.model('Class', classSchema);
                                              
module.exports = Class;
       


