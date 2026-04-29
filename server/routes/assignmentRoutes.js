const express = require('express');
const router = express.Router();
// ייבוא ספציפי של הפונקציה
const { clearAllAssignments } = require('../controllers/assignmentController');

const assignmentController = require('../controllers/assignmentController');


router.delete('/clear-all', clearAllAssignments);

// הוספת ביטול
router.post('/cancellations', assignmentController.addCancellation);

// מחיקת ביטול
router.delete('/cancellations/:id', assignmentController.deleteCancellation);


module.exports = router;