const AuditLog = require('../models/AuditLog');

const logAudit = async ({ action, module, details, user, targetId, req }) => {
  try {
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
    await AuditLog.create({
      action,
      module,
      details,
      performedBy: user?._id || null,
      performerRole: user?.role || 'system',
      targetId: targetId ? String(targetId) : undefined,
      ipAddress,
    });
  } catch (error) {
    console.error('Audit Log Error:', error.message);
  }
};

module.exports = { logAudit };
