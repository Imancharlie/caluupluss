import axios from 'axios';

// Resolve API base URL
// Prefer env var; otherwise use a relative base "/api" to work with Vite proxy
const resolvedBaseURL = ((): string => {
  const envUrl = import.meta?.env?.VITE_API_URL as string | undefined;
  if (envUrl && envUrl.trim().length > 0) return envUrl;
  return '/api';
})();

// Create axios instance with resolved base URL
const api = axios.create({
  baseURL: resolvedBaseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for CORS
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to handle JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear auth data on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Timetable API functions
export const timetableApi = {
  // List timetable slots (new endpoint)
  listTimetableSlots: async (params?: { student?: string; semester?: number; academic_year?: string }) => {
    const response = await api.get('/timetable-slots/', { params });
    return response.data;
  },

  // Get student timetable (legacy endpoint)
  getStudentTimetable: async (studentId: string) => {
    const response = await api.get(`/students/${studentId}/timetable/`);
    return response.data;
  },

  // Get my timetable (current user) - legacy endpoint
  getMyTimetable: async () => {
    const response = await api.get('/timetable/my/');
    return response.data;
  },

  // Get timetable for current semester
  getCurrentTimetable: async () => {
    const response = await api.get('/timetable/current');
    return response.data;
  },

  // Get timetable for specific semester
  getTimetableBySemester: async (semester: string, academicYear: string) => {
    const response = await api.get(`/timetable?semester=${semester}&academic_year=${academicYear}`);
    return response.data;
  },


  // Get specific timetable slot
  getTimetableSlot: async (slotId: string) => {
    const response = await api.get(`/timetable-slots/${slotId}/`);
    return response.data;
  },

  // Create timetable slot
  createTimetableSlot: async (slotData: {
    course: string; // UUID format
    time_slot: string; // HHMM-HHMM format
    day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
    semester: number; // 1 or 2
    academic_year: string; // Year as string
    class_type?: 'lecture' | 'tutorial' | 'seminar' | 'practical';
    venue?: string;
    instructor?: string | null;
    description?: string;
  }) => {
    const response = await api.post('/timetable-slots/', slotData);
    return response.data;
  },

  // Update timetable slot (full update)
  updateTimetableSlot: async (slotId: string, slotData: {
    course: string;
    time_slot: string; // HHMM-HHMM format
    day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
    semester: number; // 1 or 2
    academic_year: string; // Year as string
    class_type?: 'lecture' | 'tutorial' | 'seminar' | 'practical';
    venue?: string;
    instructor?: string | null;
    description?: string;
  }) => {
    const response = await api.patch(`/timetable-slots/${slotId}/`, slotData);
    return response.data;
  },

  // Partial update timetable slot
  patchTimetableSlot: async (slotId: string, updateData: Partial<{
    course: string;
    time_slot: string; // HHMM-HHMM format
    day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
    semester: number; // 1 or 2
    academic_year: string; // Year as string
    class_type: 'lecture' | 'tutorial' | 'seminar' | 'practical';
    venue: string;
    instructor: string | null;
    description: string;
  }>) => {
    const response = await api.patch(`/timetable-slots/${slotId}/`, updateData);
    return response.data;
  },

  // Delete timetable slot
  deleteTimetableSlot: async (slotId: string) => {
    const response = await api.delete(`/timetable-slots/${slotId}/`);
    return response.data;
  },

  // Bulk create timetable slots
  bulkCreateTimetableSlots: async (slots: Array<{
    course: string; // UUID format
    time_slot: string; // HHMM-HHMM format
    day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
    semester: number; // 1 or 2
    academic_year: string; // Year as string
    class_type?: 'lecture' | 'tutorial' | 'seminar' | 'practical';
    venue?: string;
    instructor?: string | null;
    description?: string;
  }>) => {
    const response = await api.post('/timetable-slots/bulk-create/', { slots });
    return response.data;
  },

  // Bulk delete timetable slots
  bulkDeleteTimetableSlots: async (slotIds: string[]) => {
    const response = await api.delete('/timetable-slots/bulk-delete/', {
      data: { slot_ids: slotIds }
    });
    return response.data;
  },

  // Debug validation endpoint
  debugValidation: async (slotData: {
    course: string;
    time_slot: string;
    day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
    semester: number;
    academic_year: string;
    class_type?: 'lecture' | 'tutorial' | 'seminar' | 'practical';
    venue?: string;
    instructor?: string | null;
    description?: string;
  }) => {
    const response = await api.post('/timetable-slots/debug-validation/', slotData);
    return response.data;
  },

  // Debug request data endpoint
  debugRequest: async (slotData: {
    course: string;
    time_slot: string;
    day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
    semester: number;
    academic_year: string;
    class_type?: 'lecture' | 'tutorial' | 'seminar' | 'practical';
    venue?: string;
    instructor?: string | null;
    description?: string;
  }) => {
    const response = await api.post('/timetable-slots/debug-request/', slotData);
    return response.data;
  }
};

export default api;

