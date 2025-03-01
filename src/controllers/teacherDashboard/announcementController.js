const Announcement = require("../../models/teacherDashboard/announcementModel");

// ✅ Create Announcement
const createAnnouncement = async (req, res) => {
    try {
        console.log("📩 Received Announcement Data:", req.body);

        const { classNumber, subjectName, title, message } = req.body;

        if (!classNumber || !subjectName || !title || !message) {
            console.log("❌ Missing fields:", { classNumber, subjectName, title, message });
            return res.status(400).json({ message: "❌ Missing required fields" });
        }

        const newAnnouncement = new Announcement({ classNumber, subjectName, title, message });
        await newAnnouncement.save();

        console.log("✅ Announcement created successfully:", newAnnouncement);

        // 🔄 Redirect to class dashboard after creation
        
        res.redirect(`/teacher/dashboard/class/${classNumber}/${subjectName}`);

    } catch (error) {
        console.error("❌ Error creating announcement:", error);
        res.status(500).json({ message: "❌ Server error", error: error.message });
    }
};

// ✅ Get Announcements for a Specific Class & Subject
const getAnnouncements = async (req, res) => {
    try {
        const { classNumber, subjectName } = req.params;

        if (!classNumber || !subjectName) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        const announcements = await Announcement.find({ classNumber, subjectName });
      

        res.status(200).json({ announcements });
    } catch (error) {
        console.error(" Error fetching announcements:", error);
        res.status(500).json({ message: " Server error", error: error.message });
    }
};


const renderEditAnnouncementForm = async (req, res) => {
    try {
        const { id } = req.params;
       

        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).send("Announcement not found");
        }

        console.log(" Rendering edit form for:", announcement);
        res.render("teacherDashboard/editAnnouncementForm", { announcement });
    } catch (error) {
        console.error("Error loading edit form:", error);
        res.status(500).send(" Internal Server Error");
    }
};


const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, message, classNumber, subjectName } = req.body;

        if (!title || !message || !classNumber || !subjectName) {
            return res.status(400).json({ message: " Missing required fields" });
        }

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            { title, message, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedAnnouncement) {
            return res.status(404).json({ message: " Announcement not found" });
        }

        console.log("Announcement updated:", updatedAnnouncement);

     
        res.redirect(`/teacher/dashboard/class/${classNumber}/${subjectName}`);
    } catch (error) {
        console.error("Error updating announcement:", error);
        res.status(500).json({ message: " Internal Server Error", error: error.message });
    }
};


const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

        if (!deletedAnnouncement) {
            return res.status(404).json({ message: " Announcement not found" });
        }

        console.log(" Announcement deleted:", deletedAnnouncement._id);

       
        res.json({ message: " Announcement deleted successfully" });
    } catch (error) {
        console.error("Error deleting announcement:", error);
        res.status(500).json({ message: " Internal Server Error", error: error.message });
    }
};



module.exports = {
    createAnnouncement,
    getAnnouncements,
    renderEditAnnouncementForm,
    updateAnnouncement,
    deleteAnnouncement
};
