import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const { refreshToken, setTokens, logout } = useAuthStore.getState()
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })
          
          const { access_token, refresh_token } = response.data
          setTokens(access_token, refresh_token)
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        } catch {
          logout()
        }
      } else {
        logout()
      }
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, fullName: string) =>
    api.post('/auth/register', { email, password, full_name: fullName }),
  
  getMe: () => api.get('/auth/me'),
}

// Meetings API
export const meetingsAPI = {
  list: (page = 1, pageSize = 20) =>
    api.get('/meetings', { params: { page, page_size: pageSize } }),
  
  get: (id: string) => api.get(`/meetings/${id}`),
  
  create: (data: { title: string; description?: string }) =>
    api.post('/meetings', data),
  
  update: (id: string, data: { title?: string; description?: string }) =>
    api.patch(`/meetings/${id}`, data),
  
  delete: (id: string) => api.delete(`/meetings/${id}`),
  
  uploadAudio: (id: string, file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post(`/meetings/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  },
  
  getStatus: (id: string) => api.get(`/meetings/${id}/status`),
}

// Transcripts API
export const transcriptsAPI = {
  get: (meetingId: string) => api.get(`/transcripts/meeting/${meetingId}`),
  
  getSpeakers: (meetingId: string) => api.get(`/transcripts/meeting/${meetingId}/speakers`),
  
  updateSpeakers: (meetingId: string, mappings: { speaker_label: string; speaker_name: string }[]) =>
    api.patch(`/transcripts/meeting/${meetingId}/speakers`, { speaker_mappings: mappings }),
}

// Tasks API
export const tasksAPI = {
  listByMeeting: (meetingId: string) => api.get(`/tasks/meeting/${meetingId}`),
  
  listAll: (page = 1, pageSize = 50) =>
    api.get('/tasks/all', { params: { page, page_size: pageSize } }),
  
  get: (id: string) => api.get(`/tasks/${id}`),
  
  create: (data: {
    meeting_id: string
    title: string
    description?: string
    assignee?: string
    priority?: string
    due_date?: string
  }) => api.post('/tasks', data),
  
  update: (id: string, data: {
    title?: string
    description?: string
    assignee?: string
    priority?: string
    due_date?: string
    status?: string
  }) => api.patch(`/tasks/${id}`, data),
  
  delete: (id: string) => api.delete(`/tasks/${id}`),
  
  bulkAction: (taskIds: string[], action: string) =>
    api.post('/tasks/bulk-action', { task_ids: taskIds, action }),
  
  sync: (taskIds: string[], integrationId: string) =>
    api.post('/tasks/sync', { task_ids: taskIds, integration_id: integrationId }),
}

// Integrations API
export const integrationsAPI = {
  list: () => api.get('/integrations'),
  
  get: (id: string) => api.get(`/integrations/${id}`),
  
  create: (data: {
    integration_type: string
    api_key?: string
    access_token?: string
  }) => api.post('/integrations', data),
  
  update: (id: string, data: {
    workspace_id?: string
    project_id?: string
    board_id?: string
    list_id?: string
    auto_sync_enabled?: boolean
  }) => api.patch(`/integrations/${id}`, data),
  
  delete: (id: string) => api.delete(`/integrations/${id}`),
  
  test: (id: string) => api.post(`/integrations/${id}/test`),
  
  getWorkspaces: (id: string) => api.get(`/integrations/${id}/workspaces`),
  
  getProjects: (id: string, workspaceId: string) =>
    api.get(`/integrations/${id}/projects/${workspaceId}`),
}
