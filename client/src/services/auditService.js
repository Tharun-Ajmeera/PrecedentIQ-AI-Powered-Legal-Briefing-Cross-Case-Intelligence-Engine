// client/src/services/auditService.js
import api from './api';

export const auditService = {
  async getCaseAuditLogs(caseId, action = '') {
    const params = action ? { action } : {};
    const res = await api.get(`/cases/${caseId}/audit`, { params });
    return res.data.logs;
  },
  async getFirmAuditLogs(filters = {}) {
    const res = await api.get('/audit', { params: filters });
    return res.data.logs;
  },
};
