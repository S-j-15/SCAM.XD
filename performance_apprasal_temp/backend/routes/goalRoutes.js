import express from "express";
import Goal from "../models/Goal.js";
import { protect, authorize } from "../middleware/auth.js";
import { createNotification } from "../utils/notifications.js";

const router = express.Router();

// CREATE a new goal
router.post("/", protect, async (req, res) => {
    try {
        const goal = new Goal({
            ...req.body,
            userId: req.user._id,
            employeeName: req.user.name,
            department: req.user.department,
        });
        const savedGoal = await goal.save();
        
        await createNotification(
            req.user._id,
            "goal_created",
            `New goal created: ${savedGoal.goalTitle}`,
            savedGoal._id
        );

        res.status(201).json(savedGoal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET all goals (role-based)
router.get("/", protect, async (req, res) => {
    try {
        let goals;
        
        if (req.user.role === "Employee") {
            goals = await Goal.find({ userId: req.user._id });
        } else if (req.user.role === "Manager") {
            const User = (await import("../models/User.js")).default;
            const teamMembers = await User.find({ managerId: req.user._id });
            const teamIds = teamMembers.map(member => member._id);
            goals = await Goal.find({ 
                $or: [{ userId: req.user._id }, { userId: { $in: teamIds } }] 
            }).populate("userId", "name email department");
        } else if (req.user.role === "HR Admin") {
            goals = await Goal.find().populate("userId", "name email department");
        }

        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single goal
router.get("/:id", protect, async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        
        if (!goal) {
            return res.status(404).json({ error: "Goal not found" });
        }

        // Check authorization
        if (req.user.role === "Employee" && goal.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }

        res.json(goal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE an existing goal
router.put("/:id", protect, async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        
        if (!goal) {
            return res.status(404).json({ error: "Goal not found" });
        }

        // Employees can only edit their own goals if not yet reviewed
        if (req.user.role === "Employee") {
            if (goal.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: "Not authorized" });
            }
            if (goal.status === "Approved" || goal.reviewedBy) {
                return res.status(403).json({ error: "Cannot edit reviewed goals" });
            }
        }

        const updatedGoal = await Goal.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        
        res.json(updatedGoal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE a goal
router.delete("/:id", protect, async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        
        if (!goal) {
            return res.status(404).json({ error: "Goal not found" });
        }

        // Employees can only delete their own goals if not yet reviewed
        if (req.user.role === "Employee") {
            if (goal.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: "Not authorized" });
            }
            if (goal.status === "Approved" || goal.reviewedBy) {
                return res.status(403).json({ error: "Cannot delete reviewed goals" });
            }
        }

        await Goal.findByIdAndDelete(req.params.id);
        res.json({ message: "Goal deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// MANAGER: Review goal
router.put("/:id/review", protect, authorize("Manager", "HR Admin"), async (req, res) => {
    try {
        const { status, achievementRating, managerFeedback } = req.body;
        
        const goal = await Goal.findByIdAndUpdate(
            req.params.id,
            {
                status,
                achievementRating,
                managerFeedback,
                reviewedBy: req.user._id,
            },
            { new: true }
        );

        await createNotification(
            goal.userId,
            "goal_reviewed",
            `Your goal "${goal.goalTitle}" has been reviewed`,
            goal._id
        );

        res.json(goal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;