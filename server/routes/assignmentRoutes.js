const express = require('express');
const router = express.Router();
// ייבוא ספציפי של הפונקציה
const { clearAllAssignments, addPermanentAssignment, deletePermanentAssignment } = require('../controllers/assignmentController');

router.delete('/clear-all', clearAllAssignments);
router.post('/permanent', addPermanentAssignment);
router.delete('/permanent/:id', deletePermanentAssignment);

module.exports = router;