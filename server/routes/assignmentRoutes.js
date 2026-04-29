const express = require('express');
const router = express.Router();
// ייבוא ספציפי של הפונקציה
const assignmentController = require('../controllers/assignmentController');

// מחיקת כל השיבוצים הן הקבועים והן הזמניים- לצורך איפוס המערכת
router.delete('/clear-all', assignmentController.clearAllAssignments);

// שיבוץ קבוע- הוספה ומחיקה
router.post('/permanent', assignmentController.addPermanentAssignment);
router.delete('/permanent/:id', assignmentController.deletePermanentAssignment);

// ביטול- הוספה ומחיקה
router.post('/cancellations', assignmentController.addCancellation);
router.delete('/cancellations/:id', assignmentController.deleteCancellation);

// שיבוץ זמני- הוספה ומחיקה
router.post('/temporary', assignmentController.addTemporaryAssignment);
router.delete('/temporary/:id', assignmentController.deleteTemporaryAssignment);


module.exports = router;