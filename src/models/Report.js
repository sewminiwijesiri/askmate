import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
    reporterId: { type: String, required: true },
    reportedUserId: { type: String, required: true },
    reportedUserRole: { type: String },
    reason: { type: String, required: true },
    evidence: { type: String },
    status: { type: String, enum: ['Pending', 'Reviewed', 'Action_Taken'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
