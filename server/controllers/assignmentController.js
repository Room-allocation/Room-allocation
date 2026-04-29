const PermanentAssignment = require('../models/PermanentAssignment');
const TemporaryAssignment = require('../models/TemporaryAssignment');

// משימה C9: שימוש ב-Named Export
exports.clearAllAssignments = async (req, res) => {
    try {
        await PermanentAssignment.deleteMany({});
        await TemporaryAssignment.deleteMany({});
        res.status(200).json({ message: "כל השיבוצים נמחקו בהצלחה" });
    } catch (error) {
        res.status(500).json({ message: "שגיאה במחיקה", error: error.message });
    }
};