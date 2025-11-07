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
  console.log("SELF-ASSESSMENT ROUTE HIT");
  console.log("req.user:", req.user);
  console.log("req.body:", req.body);

  try {
    const { reviewPeriod, competencies, selfFeedback } = req.body;

    const finalCompetencies = competencies?.length
      ? competencies
      : PREDEFINED_COMPETENCIES.map(name => ({ name, selfRating: 0 }));

    const evaluation = await Evaluation.create({
      userId: req.user._id,
      evaluationType: "Self",
      reviewPeriod,
      competencies: finalCompetencies,
      selfFeedback,
      status: "Completed",
    });

    res.status(201).json(evaluation);
  } catch (error) {
    console.error('Self-assessment error:', error);
    res.status(500).json({ error: error.message });
  }
});


// MANAGER: Create evaluation for employee
router.post("/manager-review", protect, authorize("Manager", "HR Admin"), async (req, res) => {
  try {
    const { userId, reviewPeriod, competencies, managerFeedback, overallScore } = req.body;
    console.log(competencies)
    // sanitize competencies
    const sanitizedCompetencies = competencies.map((c) => (
      {
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
    console.log(evaluation)
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
      console.log(teamMembers)
      const teamIds = teamMembers.map((member) => member._id);
      evaluations = await Evaluation.find({ userId: { $in: teamIds } }).populate(
        "userId",
        "name email department"
      );
      console.log("manager evals: ",evaluations)
    } else if (req.user.role === "HR Admin") {
      evaluations = await Evaluation.find().populate("userId", "name email department");
    }
    if (req.user.role === "Employee" || req.user.role === "Manager") {
  evaluations = await Evaluation.find({ userId: req.user._id });
  console.log("manager evals 2: ",evaluations)
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
