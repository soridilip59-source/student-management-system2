const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);
router.get('/', authorizeRoles('admin'), getAuditLogs);

module.exports = router;
