const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
    
    classNumber: { type: String, required: true },
    subjectName: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true }
}, { timestamps: true });

const Announcement = mongoose.model("Announcement", announcementSchema);
module.exports = Announcement;


