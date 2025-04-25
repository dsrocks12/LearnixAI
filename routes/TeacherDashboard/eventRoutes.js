const express = require("express");
const multer = require("multer");
const path = require("path");
const Event = require("../../models/teacherDashboard/eventModel");

const {
    createEvent,
    getEvent,
    updateEvent,
    deleteEvent,
    allowParticipation,
    participateEvent
} = require("../../controllers/teacherDashboard/eventController");

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Ensure the uploads folder path is correct
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Render form to create a new event
router.get("/create", (req, res) => {
    const { classNumber, subjectName } = req.query;
    if (!classNumber || !subjectName) {
        return res.status(400).send("❌ Missing classNumber or subjectName");
    }
    res.render("teacherDashboard/eventForm", { classNumber, subjectName });
});

// Render edit form for an existing event
router.get("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log("📝 Opening edit form for event ID:", id);

        const event = await Event.findById(id);
        if (!event) {
            console.log("❌ Event not found for ID:", id);
            return res.status(404).send("❌ Event not found");
        }

        console.log("✅ Event found:", event);
        res.render("teacherDashboard/editEventForm", { event, classNumber: event.classNumber, subjectName: event.subjectName });
    } catch (error) {
        console.error("❌ Error fetching event for edit:", error);
        res.status(500).send("❌ Server Error");
    }
});

// Fetch events
router.get("/", getEvent);

// Create a new event
router.post("/create", upload.single('file'), createEvent);

// Update an existing event
router.post("/update/:id", upload.single('file'), updateEvent);

// Delete an event and redirect back to dashboard
router.post("/delete/:id", async (req, res) => {
    try {
        await deleteEvent(req, res);
    } catch (error) {
        res.status(500).send("❌ Server Error");
    }
});

//New-routes
router.post("/allow-participation/:eventId", allowParticipation);

module.exports = router;
