// client/src/services/researchService.js
import api from './api';

export const researchService = {
  async submitQuery(caseId, { query, documentScope, mode }) {
    const res = await api.post(`/cases/${caseId}/research`, {
      query,
      documentScope,
      mode,
    });
    return res.data;
  },
  async getQueryHistory(caseId) {
    const res = await api.get(`/cases/${caseId}/research`);
    return res.data.queries;
  },
};
