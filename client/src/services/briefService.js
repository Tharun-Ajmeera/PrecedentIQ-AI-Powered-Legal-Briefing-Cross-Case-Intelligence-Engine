// client/src/services/briefService.js
import api from './api';

export const briefService = {
  async generateBrief(caseId, { title, issueStatements, includeDocumentIds }) {
    const res = await api.post(`/cases/${caseId}/briefs`, {
      title,
      issueStatements,
      includeDocumentIds,
    });
    return res.data.brief;
  },
  async listBriefs(caseId) {
    const res = await api.get(`/cases/${caseId}/briefs`);
    return res.data.briefs;
  },
  async getBrief(caseId, briefId) {
    const res = await api.get(`/cases/${caseId}/briefs/${briefId}`);
    return res.data.brief;
  },
  async updateBrief(caseId, briefId, { content, status }) {
    const res = await api.patch(`/cases/${caseId}/briefs/${briefId}`, {
      content,
      status,
    });
    return res.data.brief;
  },
  async finalizeBrief(caseId, briefId) {
    const res = await api.post(`/cases/${caseId}/briefs/${briefId}/finalize`);
    return res.data.brief;
  },
};
