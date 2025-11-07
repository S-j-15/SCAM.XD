import mongoose from "mongoose";

const competencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  // allow 0 so initial/unset ratings from frontend don't violate validation
  selfRating: { type: Number, min: 0, max: 5, default: 0 },
  managerRating: { type: Number, min: 0, max: 5, default: 0 },
});

const evaluationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  evaluationType: { type: String, enum: ["Self", "Manager"], required: true },
  competencies: [competencySchema],
  selfFeedback: { type: String },
  managerFeedback: { type: String },
  overallScore: { type: Number },
  status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
  reviewPeriod: { type: String, required: true },
}, { timestamps: true });

const Evaluation = mongoose.model("Evaluation", evaluationSchema);
export default Evaluation;
