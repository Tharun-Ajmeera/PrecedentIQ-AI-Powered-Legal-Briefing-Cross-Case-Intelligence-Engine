// client/src/services/caseService.js
import api from './api';

export const caseService = {
  async listCases() {
    const res = await api.get('/cases');
    return res.data.cases;
  },
  async getCase(caseId) {
    const res = await api.get(`/cases/${caseId}`);
    return res.data.case;
  },
  async createCase(data) {
    const res = await api.post('/cases', data);
    return res.data.case;
  },
  async updateCase(caseId, data) {
    const res = await api.patch(`/cases/${caseId}`, data);
    return res.data.case;
  },
  async deleteCase(caseId) {
    const res = await api.delete(`/cases/${caseId}`);
    return res.data;
  },
  async seedDemoCase() {
    const res = await api.post('/seed');
    return res.data;
  },
};
