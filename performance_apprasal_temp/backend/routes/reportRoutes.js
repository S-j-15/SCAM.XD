import express from "express";
import PDFDocument from "pdfkit";
import Goal from "../models/Goal.js";
import Evaluation from "../models/Evaluation.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// GENERATE PDF REPORT
router.get("/pdf/:userId", protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select("-password");
        const goals = await Goal.find({ userId: req.params.userId });
        const evaluations = await Evaluation.find({ userId: req.params.userId });

        // Check authorization
        if (req.user.role === "Employee" && req.user._id.toString() !== req.params.userId) {
            return res.status(403).json({ error: "Not authorized" });
        }

        const doc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=performance-report-${user.name}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text("Performance Appraisal Report", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Employee: ${user.name}`);
        doc.text(`Department: ${user.department}`);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`);
        doc.moveDown();

        // Goals Section
        doc.fontSize(16).text("Goals Summary");
        doc.moveDown(0.5);
        goals.forEach(goal => {
            doc.fontSize(10).text(`• ${goal.goalTitle} - ${goal.status}`);
            if (goal.achievementRating) {
                doc.text(`  Rating: ${goal.achievementRating}/5`);
            }
        });
        doc.moveDown();

        // Evaluations Section
        doc.fontSize(16).text("Performance Evaluations");
        doc.moveDown(0.5);
        evaluations.forEach(evaluation => {
            doc.fontSize(10).text(`Review Period: ${evaluation.reviewPeriod}`);
            if (evaluation.overallScore) {
                doc.text(`Overall Score: ${evaluation.overallScore}/5`);
            }
            doc.moveDown(0.5);
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// EXPORT CSV
router.get("/export/csv", protect, authorize("HR Admin"), async (req, res) => {
    try {
        const users = await User.find().select("-password");
        const goals = await Goal.find().populate("userId", "name");
        const evaluations = await Evaluation.find().populate("userId", "name");

        let csv = "Employee,Department,Goal Title,Status,Achievement Rating,Overall Evaluation Score\n";

        users.forEach(user => {
            const userGoals = goals.filter(g => g.userId._id.toString() === user._id.toString());
            const userEvals = evaluations.filter(e => e.userId._id.toString() === user._id.toString());
            
            const avgScore = userEvals.length > 0
                ? (userEvals.reduce((sum, e) => sum + (e.overallScore || 0), 0) / userEvals.length).toFixed(2)
                : "N/A";

            userGoals.forEach(goal => {
                csv += `"${user.name}","${user.department}","${goal.goalTitle}","${goal.status}","${goal.achievementRating || 'N/A'}","${avgScore}"\n`;
            });
        });

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=performance-data.csv");
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;