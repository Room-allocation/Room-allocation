const PermanentAssignment = require('../models/PermanentAssignment');
const TemporaryAssignment = require('../models/TemporaryAssignment');

// מחיקת כל השיבוצים הן הקבועים והן הזמניים
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
};