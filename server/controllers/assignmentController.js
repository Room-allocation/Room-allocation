const Room = require('../models/Room');
const Cancellation = require('../models/Cancellation');
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

//משימה: חדר- פונקציה להוספת/מחיקת ביטול חד פעמי.

// פונקציה להוספת ביטול חד פעמי
exports.addCancellation = async (req, res) => {
  try {
    const { date, permanentAssignmentId, reason } = req.body;

    // בדיקה שהשיבוץ הקבוע קיים
    const assignment = await PermanentAssignment.findById(permanentAssignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Permanent assignment not found' });
    }

    // בדיקה אם כבר קיים ביטול לאותו תאריך
    const existingCancellation = await Cancellation.findOne({
      permanentAssignment: permanentAssignmentId,
      date: new Date(date)
    });

    if (existingCancellation) {
      return res.status(400).json({ message: 'Cancellation already exists for this date' });
    }

    // יצירת הביטול
    const cancellation = new Cancellation({
      date,
      permanentAssignment: permanentAssignmentId,
      room: assignment.room,
      reason
    });

    await cancellation.save();

    // הוספה לחדר
    await Room.findByIdAndUpdate(
      assignment.room,
      { $push: { cancellations: cancellation._id } }
    );

    res.status(201).json(cancellation);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// פונקציה למחיקת ביטול חד פעמי
exports.deleteCancellation = async (req, res) => {
  try {
    const { id } = req.params;

    const cancellation = await Cancellation.findById(id);
    if (!cancellation) {
      return res.status(404).json({ message: 'Cancellation not found' });
    }

    // הסרה מהחדר
    await Room.findByIdAndUpdate(
      cancellation.room,
      { $pull: { cancellations: cancellation._id } }
    );

    // מחיקה מה-DB
    await Cancellation.findByIdAndDelete(id);

    res.json({ message: 'Cancellation deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};