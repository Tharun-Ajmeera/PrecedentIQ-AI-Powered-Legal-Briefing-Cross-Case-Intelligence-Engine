// client/src/services/clauseService.js
import api from './api';

export const clauseService = {
  async generateComparison(caseId, { documentIds, subjectMatter }) {
    const res = await api.post(`/cases/${caseId}/clauses`, {
      documentIds,
      subjectMatter,
    });
    return res.data.comparison;
  },
  async listComparisons(caseId) {
    const res = await api.get(`/cases/${caseId}/clauses`);
    return res.data.comparisons;
  },
  async getComparison(caseId, matrixId) {
    const res = await api.get(`/cases/${caseId}/clauses/${matrixId}`);
    return res.data.comparison;
  },
};
