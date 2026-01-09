import mongoose from 'mongoose';

const analysisReportSchema = new mongoose.Schema({
    uid: { type: String, required: true },
    title: String,
    jobTitle: String,
    fileName: String,
    result: Object,
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('AnalysisReport', analysisReportSchema);