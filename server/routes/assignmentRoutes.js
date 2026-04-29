const express = require('express');
const router = express.Router();
// ייבוא ספציפי של הפונקציה
const { clearAllAssignments } = require('../controllers/assignmentController');

router.delete('/clear-all', clearAllAssignments);

module.exports = router;