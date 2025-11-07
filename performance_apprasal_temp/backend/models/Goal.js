import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    goalTitle: { type: String, required: true },
    description: { type: String },
    successCriteria: { type: String },
    dueDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ["Draft", "Under Review", "Approved", "Not Started", "In Progress", "Completed"], 
        default: "Draft" 
    },
    achievementRating: { type: Number, min: 1, max: 5 },
    managerFeedback: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;