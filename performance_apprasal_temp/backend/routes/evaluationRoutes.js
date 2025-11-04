import express from "express";
import Evaluation from "../models/Evaluation.js";
import { protect, authorize } from "../middleware/auth.js";
import { createNotification } from "../utils/notifications.js";

const router = express.Router();

const PREDEFINED_COMPETENCIES = [
  "Communication",
  "Teamwork",
  "Problem Solving",
  "Leadership",
  "Technical Skills",
  "Adaptability",
  "Time Management",
];

// CREATE self-assessment
router.post("/self-assessment", protect, async (req, res) => {
  try {
    const { reviewPeriod, competencies, selfFeedback } = req.body;

    const evaluation = await Evaluation.create({
      userId: req.user._id,
      evaluationType: "Self",
      reviewPeriod,
      competencies:
        competencies ||
        PREDEFINED_COMPETENCIES.map((name) => ({
          name,
          selfRating: 0,
        })),
      selfFeedback,
      status: "Completed",
    });

    res.status(201).json(evaluation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// MANAGER: Create evaluation for employee
router.post("/manager-review", protect, authorize("Manager", "HR Admin"), async (req, res) => {
  try {
    const { userId, reviewPeriod, competencies, managerFeedback, overallScore } = req.body;

    // sanitize competencies
    const sanitizedCompetencies = competencies.map((c) => ({
      name: c.name,
      managerRating: Number(c.managerRating) || 0,
    }));

    const evaluation = await Evaluation.create({
      userId,
      evaluatorId: req.user._id,
      evaluationType: "Manager",
      reviewPeriod,
      competencies: sanitizedCompetencies,
      managerFeedback,
      overallScore: Number(overallScore) || 0,
      status: "Completed",
    });

    try {
      await createNotification(
        userId,
        "evaluation_completed",
        `Your performance evaluation for ${reviewPeriod} has been completed`,
        evaluation._id
      );
    } catch (notifErr) {
      console.error("Notification send failed (non-fatal):", notifErr);
    }

    res.status(201).json(evaluation);
  } catch (error) {
    console.error("Manager-review save error:", error);
    res.status(400).json({ error: error.message, details: error.errors || null });
  }
});

// GET evaluations (role-based)
router.get("/", protect, async (req, res) => {
  try {
    let evaluations;

    if (req.user.role === "Employee") {
      evaluations = await Evaluation.find({ userId: req.user._id });
    } else if (req.user.role === "Manager") {
      const User = (await import("../models/User.js")).default;
      const teamMembers = await User.find({ managerId: req.user._id });
      const teamIds = teamMembers.map((member) => member._id);
      evaluations = await Evaluation.find({ userId: { $in: teamIds } }).populate(
        "userId",
        "name email department"
      );
    } else if (req.user.role === "HR Admin") {
      evaluations = await Evaluation.find().populate("userId", "name email department");
    }

    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET competency list
router.get("/competencies", protect, (req, res) => {
  res.json(PREDEFINED_COMPETENCIES);
});

export default router;
