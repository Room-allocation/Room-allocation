const Room = require('../models/Room');
const Cancellation = require('../models/Cancellation');
const PermanentAssignment = require('../models/PermanentAssignment');
const TemporaryAssignment = require('../models/TemporaryAssignment');

// מחיקת כל השיבוצים הן הקבועים והן הזמניים


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


//הוספת שיבוץ קבוע עם לוגיקת מניעת התנגשויות

exports.addPermanentAssignment = async (req, res) => {
    try {
        const { dayOfWeek, startHour, endHour, room, lecturerName, subject } = req.body;

        // שאילתת בסיס לבדיקת חפיפת שעות באותו חדר
        const timeOverlapQuery = {
            room: room,
            $or: [
                { startHour: { $lt: endHour }, endHour: { $gt: startHour } }
            ]
        };

        // 1. בדיקה מול שיבוצים קבועים (באותו יום בשבוע ובאותו חדר)
        const permanentConflict = await PermanentAssignment.findOne({
            ...timeOverlapQuery,
            dayOfWeek: dayOfWeek
        });

        if (permanentConflict) {
            return res.status(400).json({ 
                message: `התנגשות: החדר תפוס קבוע ע"י ${permanentConflict.lecturerName} (${permanentConflict.subject})` 
            });
        }

        // 2. בדיקה מול שיבוצים זמניים
        // אנחנו שולפים את כל השיבוצים הזמניים בחדר הזה ובשעות האלו
        const potentialTempConflicts = await TemporaryAssignment.find(timeOverlapQuery);

        // מסננים ובודקים אם אחד מהם נופל על אותו יום בשבוע
        const actualTempConflict = potentialTempConflicts.find(temp => {
            const tempDate = new Date(temp.date);
            return tempDate.getDay() === Number(dayOfWeek);
        });

        if (actualTempConflict) {
            return res.status(400).json({ 
                message: `התנגשות: קיים שיבוץ זמני בתאריך ${actualTempConflict.date.toLocaleDateString()} ביום זה` 
            });
        }

        // 3. אם אין התנגשויות - שומרים את השיבוץ החדש
        const newAssignment = new PermanentAssignment(req.body);
        await newAssignment.save();

        res.status(201).json({ 
            message: "השיבוץ הקבוע נוסף בהצלחה!", 
            data: newAssignment 
        });

    } catch (error) {
        res.status(500).json({ message: "שגיאה בשרת בהוספת השיבוץ", error: error.message });
    }
};

// מחיקת שיבוץ קבוע לפי ID
exports.deletePermanentAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await PermanentAssignment.findByIdAndDelete(id);
        
        if (!deleted) {
            return res.status(404).json({ message: "השיבוץ לא נמצא" });
        }
        
        res.status(200).json({ message: "השיבוץ הקבוע נמחק בהצלחה" });
    } catch (error) {
        res.status(500).json({ message: "שגיאה במחיקת השיבוץ", error: error.message });
    }
    }
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
}