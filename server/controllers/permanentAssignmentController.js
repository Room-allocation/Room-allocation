const PermanentAssignment = require('../models/PermanentAssignment');

// 1. יצירת שיבוץ קבוע חדש
exports.createAssignment = async (req, res) => {
    try {
        const newAssignment = new PermanentAssignment(req.body);
        const savedAssignment = await newAssignment.save();
        res.status(201).json(savedAssignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 2. קבלת כל השיבוצים (כולל פרטי החדר המלאים)
exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await PermanentAssignment.find().populate('room');
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. מחיקת שיבוץ
exports.deleteAssignment = async (req, res) => {
    try {
        await PermanentAssignment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Assignment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateAssignment = async (req, res) => {
    try {
        // מחפש לפי ID ומעדכן עם הנתונים שנשלחו ב-body
        const updatedAssignment = await PermanentAssignment.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // מחזיר את האובייקט החדש ובודק תקינות
        );

        if (!updatedAssignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        res.status(200).json(updatedAssignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};