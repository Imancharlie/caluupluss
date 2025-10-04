import api from '@/lib/api';

// Types matching your backend specification
export interface University {
  id: string;
  name: string;
  country: string;
}

export interface College {
  id: string;
  name: string;
  university: string;
  university_name: string;
}

export interface Program {
  id: string;
  name: string;
  college: string;
  college_name: string;
  university_name: string;
  duration: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: 'core' | 'elective';
  semester: number;
  year: number;
  program: string;
  program_name: string;
}

export interface StudentCourse {
  id: string;
  course: string;
  course_code: string;
  course_name: string;
  course_credits: number;
  course_type: 'core' | 'elective';
  grade: string | null;
  points: number | null;
}

export interface StudentProfile {
  id: string;
  university: University;
  college: College;
  program: Program;
  year: number;
  semester: number;
  courses: StudentCourse[];
  gpa: number;
  // Backend flag indicating whether student already has enrolled courses
  has_courses?: boolean;
}

export interface GPABreakdown {
  course_code: string;
  course_name: string;
  credits: number;
  grade: string;
  points: number;
  contribution: number;
}

export interface GPAResponse {
  gpa: number;
  total_credits: number;
  total_points: number;
  graded_courses: number;
  breakdown: GPABreakdown[];
}

export interface TargetGPAResponse {
  message: string;
  target_gpa: number;
  actual_gpa: number;
  accuracy: string;
  grades: {
    course_id: string;
    course_code: string;
    course_name: string;
    credits: number;
    required_grade: string;
    required_points: number;
  }[];
}

class AcademicAPI {
  // Authentication
  async register(
    email: string,
    password: string,
    password_confirm: string,
    display_name: string,
    gender?: string,
    phone_number?: string
  ) {
    const payload: Record<string, unknown> = {
      email,
      display_name,
      gender,
      phone_number,
      password,
      password_confirm,
    };
    // Remove undefined fields to avoid backend validation issues
    Object.keys(payload).forEach((k) => (payload[k] === undefined || payload[k] === '') && delete payload[k]);
    console.log('[API Debug] POST /auth/register/ →', {
      url: `${api.defaults.baseURL}/auth/register/`,
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    const response = await api.post('/auth/register/', payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data; // { user, token }
  }

  async login(email: string, password: string) {
    const loginPayload = { email, password };
    console.log('[API Debug] POST /auth/login/ →', {
      url: `${api.defaults.baseURL}/auth/login/`,
      headers: { 'Content-Type': 'application/json' },
      body: loginPayload,
    });
    const response = await api.post('/auth/login/', loginPayload, { headers: { 'Content-Type': 'application/json' } });
    return response.data;
  }

  // Academic Structure
  async getUniversities(): Promise<University[]> {
    const response = await api.get('/universities/');
    return response.data;
  }

  // Admin: Create University
  async createUniversity(payload: { name: string; country: string }): Promise<University> {
    const response = await api.post('/admin/universities/', payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }

  async getCollegesByUniversity(universityId: string): Promise<College[]> {
    const response = await api.get(`/universities/${universityId}/colleges/`);
    return response.data;
  }

  // Admin: Create College
  async createCollege(payload: { name: string; university: string }): Promise<College> {
    const response = await api.post('/admin/colleges/', payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }

  async getProgramsByCollege(collegeId: string): Promise<Program[]> {
    const response = await api.get(`/colleges/${collegeId}/programs/`);
    return response.data;
  }

  // Admin: Create Program
  async createProgram(payload: { name: string; college: string; duration: number }): Promise<Program> {
    const response = await api.post('/admin/programs/', payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }

  async getCoursesByProgram(programId: string, year?: number, semester?: number): Promise<Course[]> {
    let url = `/programs/${programId}/courses/`;
    const params = new URLSearchParams();
    
    if (year) params.append('year', year.toString());
    if (semester) params.append('semester', semester.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  }

  // Student Management
  async getStudentProfile(): Promise<StudentProfile> {
    try {
      const response = await api.get('/students/data/');
      return response.data;
    } catch (error: any) {
      // If the endpoint doesn't exist yet (404), throw the error
      if (error.response?.status === 404) {
        throw error;
      }
      // For other errors, also throw
      throw error;
    }
  }

  async createStudentProfile(profileData: {
    university: string;
    college: string;
    program: string;
    year: number;
    semester: number;
  }): Promise<StudentProfile> {
    const response = await api.post('/students/profile/', profileData);
    return response.data;
  }

  async updateStudentProfile(profileData: {
    university: string;
    college: string;
    program: string;
    year: number;
    semester: number;
  }): Promise<StudentProfile> {
    const response = await api.put('/students/profile/', profileData);
    return response.data;
  }

  // Course Management
  async addCourse(courseId: string) {
    const response = await api.post('/students/courses/', {
      course_id: courseId
    });
    return response.data;
  }

  async removeCourse(courseId: string) {
    const response = await api.delete(`/students/courses/${courseId}/`);
    return response.data;
  }

  // Batch save courses
  async saveCoursesBatch(courses: any[]) {
    const response = await api.post('/students/courses/batch/', {
      courses: courses
    });
    return response.data;
  }

  // Get student courses for specific semester and year
  async getStudentCoursesBySemester(semester: number, year: number) {
    const response = await api.get(`/students/courses/semester/${semester}/year/${year}/`);
    return response.data;
  }

  // Get student courses with flexible filtering
  async getStudentCoursesFiltered(filters: {
    semester?: number;
    year?: number;
    type?: 'core' | 'elective';
  } = {}) {
    const params = new URLSearchParams();
    if (filters.semester) params.append('semester', filters.semester.toString());
    if (filters.year) params.append('year', filters.year.toString());
    if (filters.type) params.append('type', filters.type);
    
    const response = await api.get(`/students/courses/filter/?${params.toString()}`);
    return response.data;
  }

  async updateCourseGrade(courseId: string, grade: string) {
    const response = await api.put(`/students/courses/${courseId}/grade/`, {
      grade
    });
    return response.data;
  }

  async getStudentCourses(): Promise<StudentCourse[]> {
    const response = await api.get('/students/courses/');
    return response.data;
  }

  // GPA Calculation
  async calculateGPA(): Promise<GPAResponse> {
    const response = await api.get('/students/gpa/');
    return response.data;
  }

  async generateTargetGPA(targetGPA: number): Promise<TargetGPAResponse> {
    const response = await api.post('/students/gpa/target/', {
      target_gpa: targetGPA
    });
    return response.data;
  }

  async resetGrades() {
    const response = await api.post('/students/gpa/reset/');
    return response.data;
  }
}

export const academicApi = new AcademicAPI();
export default academicApi;
