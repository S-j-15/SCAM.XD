import express from "express";
import User from "../models/User.js";
import Evaluation from "../models/Evaluation.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Get all team members of this manager
router.get("/team", protect, authorize("Manager"), async (req, res) => {
    try {
        const team = await User.find({ managerId: req.user._id }).select("-password");
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create evaluation for an employee in their team
router.post("/team/:userId/evaluation", protect, authorize("Manager"), async (req, res) => {
    try {
        const { reviewPeriod, competencies, managerFeedback } = req.body;
        const employeeId = req.params.userId;

        // optional: check if employee belongs to this manager
        const employee = await User.findById(employeeId);
        if (!employee || String(employee.managerId) !== String(req.user._id)) {
            return res.status(403).json({ error: "Not authorized for this employee" });
        }

        const evaluation = await Evaluation.create({
            userId: employeeId,
            evaluationType: "Manager",
            reviewPeriod,
            competencies: competencies || [],
            managerFeedback,
            status: "Completed",
        });

        res.status(201).json(evaluation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get evaluations for their team
router.get("/team/evaluations", protect, authorize("Manager"), async (req, res) => {
    try {
        const evaluations = await Evaluation.find()
            .populate("userId", "name department")
            .where("userId").in(
                await User.find({ managerId: req.user._id }).distinct("_id")
            );
        res.json(evaluations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
