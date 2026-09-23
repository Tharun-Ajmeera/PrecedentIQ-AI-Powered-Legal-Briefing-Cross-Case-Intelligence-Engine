// client/src/services/documentService.js
import api from './api';

export const documentService = {
  async listDocuments(caseId) {
    const res = await api.get(`/cases/${caseId}/documents`);
    return res.data.documents;
  },
  async getDocument(caseId, docId) {
    const res = await api.get(`/cases/${caseId}/documents/${docId}`);
    return res.data.document;
  },
  async uploadDocument(caseId, formData) {
    const res = await api.post(`/cases/${caseId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  async updateDocument(caseId, docId, updates) {
    const res = await api.patch(`/cases/${caseId}/documents/${docId}`, updates);
    return res.data;
  },
  async deleteDocument(caseId, docId) {
    const res = await api.delete(`/cases/${caseId}/documents/${docId}`);
    return res.data;
  },
};
