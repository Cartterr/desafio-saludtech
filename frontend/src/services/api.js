import axios from 'axios';
import { API_BASE } from '../utils/config';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

const handleApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return { success: true, data: response.data };
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.message };
  }
};

export const taskApi = {
  getAll: (listId) => handleApiCall(() => api.get(`/tasks${listId ? `?list_id=${listId}` : ''}`)),
  getById: (id) => handleApiCall(() => api.get(`/tasks/${id}`)),
  create: (taskData) => handleApiCall(() => api.post('/tasks', taskData)),
  update: (id, taskData) => handleApiCall(() => api.put(`/tasks/${id}`, taskData)),
  delete: (id) => handleApiCall(() => api.delete(`/tasks/${id}`)),

  getComments: (taskId) => handleApiCall(() => api.get(`/tasks/${taskId}/comments`)),
  addComment: (taskId, commentData) => handleApiCall(() => api.post(`/tasks/${taskId}/comments`, commentData)),
  deleteComment: (taskId, commentId) => handleApiCall(() => api.delete(`/tasks/${taskId}/comments/${commentId}`))
};

export const listApi = {
  getAll: () => handleApiCall(() => api.get('/task-lists')),
  getById: (id) => handleApiCall(() => api.get(`/task-lists/${id}`)),
  create: (listData) => handleApiCall(() => api.post('/task-lists', listData)),
  update: (id, listData) => handleApiCall(() => api.put(`/task-lists/${id}`, listData)),
  delete: (id) => handleApiCall(() => api.delete(`/task-lists/${id}`)),
  // AI task generation removed
};

export default api;
