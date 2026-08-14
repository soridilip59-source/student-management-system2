const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true, // e.g. "CREATE_STUDENT", "UPDATE_MARKS", "MARK_ATTENDANCE", "DELETE_COURSE"
  },
  module: {
    type: String,
    required: true, // e.g. "STUDENT", "ATTENDANCE", "MARKS", "COURSE", "AUTH"
  },
  details: {
    type: String,
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  performerRole: {
    type: String,
    default: 'system',
  },
  targetId: {
    type: String,
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
