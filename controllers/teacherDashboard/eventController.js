const Event = require("../../models/teacherDashboard/eventModel");
const mongoose = require("mongoose");

// Create a new event
const createEvent = async (req, res) => {
    try {
        console.log("📩 Request Event Data:", req.body);

        const { classNumber, subjectName, title, message, dueDate } = req.body;

        if (!classNumber || !subjectName || !title || !message || !dueDate) {
            return res.status(400).send("❌ Missing event data");
        }

        const dueDateObj = new Date(dueDate);
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const newEvent = new Event({ classNumber, subjectName, title, message, dueDate: dueDateObj, fileUrl });
        await newEvent.save();

        console.log("✅ Event created successfully:", newEvent);
        res.redirect(`/teacher/dashboard/class/${classNumber}/${subjectName}`);
    } catch (error) {
        console.error("❌ Error creating event:", error);
        res.status(500).json({ message: "❌ Server error", error: error.message });
    }
};

// Get events
const getEvent = async (req, res) => {
    try {
        const { classNumber, subjectName } = req.params;

        if (!classNumber || !subjectName) {
            return res.status(400).json({ message: "❌ Missing required parameters" });
        }

        const events = await Event.find({ classNumber, subjectName }) || [];

        res.render("teacherDashboard/classDashboard", { classNumber, subjectName, events: events || [] });
    } catch (error) {
        console.error("❌ Error fetching events:", error);
        res.status(500).render("teacherDashboard/classDashboard", { classNumber, subjectName, events: [] });
    }
};

// Update an event
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { classNumber, subjectName, title, message, dueDate } = req.body;

        if (!title || !message || !dueDate) {
            return res.status(400).send("❌ Missing event data");
        }

        const dueDateObj = new Date(dueDate);
        let updateData = { title, message, dueDate: dueDateObj };

        if (req.file) {
            updateData.fileUrl = `/uploads/${req.file.filename}`;
        }

        const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!updatedEvent) {
            return res.status(404).json({ message: "❌ Event not found" });
        }

        console.log("✅ Event updated:", updatedEvent);
        res.redirect(`/teacher/dashboard/class/${classNumber}/${subjectName}`);
    } catch (error) {
        console.error("❌ Error updating event:", error);
        res.status(500).json({ message: "❌ Server Error", error: error.message });
    }
};

// Delete an event
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({ message: "❌ Event not found" });
        }

        console.log("✅ Event deleted successfully:", deletedEvent);
        res.redirect(`/teacher/dashboard/class/${deletedEvent.classNumber}/${deletedEvent.subjectName}`);
    } catch (error) {
        console.error("❌ Error deleting event:", error);
        res.status(500).json({ message: "❌ Server Error", error: error.message });
    }
};

// Allow participation for an event
const allowParticipation = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { classNumber, subjectName } = req.body;

        const event = await Event.findByIdAndUpdate(
            eventId,
            { allowParticipation: true },
            { new: true }
        );

        if (!event) return res.status(404).json({ message: "❌ Event not found" });

        console.log("✅ Participation allowed for event:", event);
        res.status(200).send("Success");
    } catch (error) {
        console.error("❌ Error allowing participation:", error);
        res.status(500).json({ message: "❌ Server Error", error: error.message });
    }
};

// Student participates in an event (no middleware)
const participateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { emailId, studentName, studentClassNumber } = req.body;

        console.log("🔍 Received participation data:", { emailId, studentName, studentClassNumber });

        if (!emailId) {
            return res.status(400).json({ message: "❌ Email ID is required" });
        }

        const event = await Event.findById(eventId);
        if (!event || !event.allowParticipation) {
            return res.status(404).json({ message: "❌ Event not found or participation not allowed" });
        }

        if (event.participants.some(p => p.emailId === emailId)) {
            return res.status(400).json({ message: "❌ Already participated" });
        }

        event.participants.push({
            emailId,
            name: studentName || "Test Student",
            classNumber: studentClassNumber || "1"
        });

        await event.save();

        console.log("✅ Student participated in event:", event);
        res.status(200).json({ message: "Success", event });
    } catch (error) {
        console.error("❌ Error participating in event:", error);
        res.status(500).json({ message: "❌ Server Error", error: error.message });
    }
};

module.exports = {
    createEvent,
    getEvent,
    updateEvent,
    deleteEvent,
    allowParticipation,
    participateEvent
};

