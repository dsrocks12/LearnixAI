const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    classNumber: { type: String, required: true },
    subjectName: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    fileUrl: { type: String }, // No longer required, only present if a file is uploaded
    dueDate: { 
        type: Date, 
        required: true, 
        validate: {
            validator: function(value) {
                return value > Date.now(); // Check that dueDate is in the future
            },
            message: 'Due date must be a future date'
        }
    }, 
    allowParticipation: { type: Boolean, default: false },
    participants: [{ 
        emailId: { type: String, required: true },
        name: String,
        classNumber: String,
        status: { type: String, enum: ['registered', 'participated'], default: 'registered' }
    }]
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
