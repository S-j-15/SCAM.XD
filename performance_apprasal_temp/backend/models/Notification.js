import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { 
        type: String, 
        enum: ["goal_created", "evaluation_due", "evaluation_completed", "goal_reviewed"],
        required: true 
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;