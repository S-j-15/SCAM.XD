import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET user notifications
router.get("/", protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// MARK notification as read
router.put("/:id/read", protect, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.json(notification);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// MARK all as read
router.put("/read-all", protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;