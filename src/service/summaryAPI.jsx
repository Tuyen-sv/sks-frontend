import axios from 'axios';
import { getToken } from "../utils/auth";

const API_BASE_URL = 'http://103.245.237.127';

// Tạo instance axios với cấu hình mặc định
const createApiClient = () => {
  const token = getToken();
  
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
};

export const summaryAPI = {
  /**
   * Tạo summary cho document
   * @param {string} documentId - ID của document
   * @returns {Promise} Promise chứa kết quả summary
   */
  createSummary: async (documentId) => {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.post(`/summary/${documentId}/create`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate summary');
    }
  },

  /**
   * Lấy summary đã tạo trước đó
   * @param {string} documentId - ID của document
   * @returns {Promise} Promise chứa summary
   */
  getSummary: async (documentId) => {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get(`/summary/${documentId}`);
      return response.data;
    } catch (error) {
      // Nếu không tìm thấy summary, trả về null thay vì throw error
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(error.response?.data?.message || 'Failed to get summary');
    }
  },

  /**
   * Refresh/Regenerate summary
   * @param {string} documentId - ID của document
   * @returns {Promise} Promise chứa kết quả summary mới
   */
  refreshSummary: async (documentId) => {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.post(`/summary/${documentId}/refresh`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to refresh summary');
    }
  },

  /**
   * Xóa summary
   * @param {string} documentId - ID của document
   * @returns {Promise} Promise chứa kết quả
   */
  deleteSummary: async (documentId) => {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.delete(`/summary/${documentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete summary');
    }
  },

  /**
   * Cập nhật summary
   * @param {string} documentId - ID của document
   * @param {string} summary - Nội dung summary mới
   * @returns {Promise} Promise chứa kết quả
   */
  updateSummary: async (documentId, summary) => {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.put(`/summary/${documentId}`, { summary });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update summary');
    }
  }
};

export default summaryAPI;