import express from "express";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// GET all users
router.get("/users", protect, authorize("HR Admin"), async (req, res) => {
    try {
        const users = await User.find().select("-password").populate("managerId", "name");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE user role
router.put("/users/:id/role", protect, authorize("HR Admin"), async (req, res) => {
    try {
        const { role, managerId } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role, managerId },
            { new: true }
        ).select("-password");
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE user
router.delete("/users/:id", protect, authorize("HR Admin"), async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET system stats
router.get("/stats", protect, authorize("HR Admin"), async (req, res) => {
    try {
        const Goal = (await import("../models/Goal.js")).default;
        const Evaluation = (await import("../models/Evaluation.js")).default;
        
        const userCount = await User.countDocuments();
        const goalCount = await Goal.countDocuments();
        const evaluationCount = await Evaluation.countDocuments();
        
        res.json({
            users: userCount,
            goals: goalCount,
            evaluations: evaluationCount,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
