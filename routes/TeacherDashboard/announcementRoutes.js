const express = require("express");
const methodOverride = require("method-override");
const Announcement = require("../../models/teacherDashboard/announcementModel"); // Adjust path if needed

const {
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement
} = require("../../controllers/teacherDashboard/announcementController");

const router = express.Router();


router.get("/new", (req, res) => {
    const { classNumber, subjectName } = req.query;

    if (!classNumber || !subjectName) {
        console.log("❌ Missing required parameters (classNumber, subjectName)");
        return res.status(400).send("❌ Missing required parameters (classNumber, subjectName)");
    }

    
    res.render("teacherDashboard/announcementForm", { classNumber, subjectName });
});


router.get("/edit/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log("📝 Opening edit form for announcement ID:", id);

        const announcement = await Announcement.findById(id);
        if (!announcement) {
            console.log("Announcement not found for ID:", id);
            return res.status(404).send("Announcement not found");
        }

        console.log(" Announcement found:", announcement);
        res.render("teacherDashboard/editAnnouncementForm", { announcement });
    } catch (error) {
        console.error("Error fetching announcement for edit:", error);
        res.status(500).send("Server Error");
    }
});


router.get("/:classNumber/:subjectName", getAnnouncements);

router.post("/create", createAnnouncement);


router.post("/update/:id", updateAnnouncement);


router.post("/delete/:id", deleteAnnouncement);

module.exports = router;
