import express from "express";
import Goal from "../models/Goal.js";
import Evaluation from "../models/Evaluation.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// EMPLOYEE DASHBOARD
router.get("/employee", protect, async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user._id });
        const evaluations = await Evaluation.find({ userId: req.user._id });
        
        const goalsCompleted = goals.filter(g => g.status === "Completed").length;
        const goalsInProgress = goals.filter(g => g.status === "In Progress").length;
        const avgScore = evaluations.length > 0
            ? evaluations.reduce((sum, e) => sum + (e.overallScore || 0), 0) / evaluations.length
            : 0;

        res.json({
            user: req.user,
            stats: {
                totalGoals: goals.length,
                goalsCompleted,
                goalsInProgress,
                averageScore: avgScore.toFixed(2),
            },
            recentGoals: goals.slice(-5),
            recentEvaluations: evaluations.slice(-3),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// MANAGER DASHBOARD
router.get("/manager", protect, authorize("Manager", "HR Admin"), async (req, res) => {
    try {
        const teamMembers = await User.find({ managerId: req.user._id }).select("-password");
        const teamIds = teamMembers.map(m => m._id);
        
        const goals = await Goal.find({ userId: { $in: teamIds } }).populate("userId", "name");
        const evaluations = await Evaluation.find({ userId: { $in: teamIds } }).populate("userId", "name");
        
        const teamPerformance = teamMembers.map(member => {
            const memberGoals = goals.filter(g => g.userId._id.toString() === member._id.toString());
            const memberEvals = evaluations.filter(e => e.userId._id.toString() === member._id.toString());
            const avgScore = memberEvals.length > 0
                ? memberEvals.reduce((sum, e) => sum + (e.overallScore || 0), 0) / memberEvals.length
                : 0;

            return {
                id: member._id,
                name: member.name,
                department: member.department,
                totalGoals: memberGoals.length,
                completedGoals: memberGoals.filter(g => g.status === "Completed").length,
                averageScore: avgScore.toFixed(2),
            };
        });

        res.json({
            teamSize: teamMembers.length,
            totalGoals: goals.length,
            pendingReviews: goals.filter(g => g.status === "Under Review").length,
            teamPerformance,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// HR ADMIN DASHBOARD
router.get("/admin", protect, authorize("HR Admin"), async (req, res) => {
    try {
        const users = await User.find().select("-password");
        const goals = await Goal.find();
        const evaluations = await Evaluation.find();
        
        const departmentStats = {};
        users.forEach(user => {
            if (!departmentStats[user.department]) {
                departmentStats[user.department] = {
                    employees: 0,
                    goals: 0,
                    evaluations: 0,
                };
            }
            departmentStats[user.department].employees++;
        });

        res.json({
            totalUsers: users.length,
            totalGoals: goals.length,
            totalEvaluations: evaluations.length,
            departmentStats,
            recentActivity: {
                recentGoals: goals.slice(-10),
                recentEvaluations: evaluations.slice(-10),
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;