import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import type { AxiosError } from 'axios';
import academicApi, { StudentProfile, University, College, Program, Course, StudentCourse, GPAResponse } from '@/services/academicApi';

interface StudentContextType {
  // Data
  studentProfile: StudentProfile | null;
  universities: University[];
  colleges: College[];
  programs: Program[];
  courses: Course[];
  studentCourses: StudentCourse[];
  gpaData: GPAResponse | null;
  
  // Loading states
  loading: boolean;
  profileLoading: boolean;
  universitiesLoading: boolean;
  collegesLoading: boolean;
  programsLoading: boolean;
  coursesLoading: boolean;
  gpaLoading: boolean;
  
  // Actions
  loadStudentProfile: () => Promise<void>;
  loadUniversities: () => Promise<void>;
  loadColleges: (universityId: string) => Promise<void>;
  loadPrograms: (collegeId: string) => Promise<void>;
  loadCourses: (programId: string, year?: number, semester?: number) => Promise<void>;
  loadStudentCourses: () => Promise<void>;
  loadGPA: () => Promise<void>;
  
  // Base data management
  ensureBaseData: () => Promise<void>;
  
  // Student profile management
  createStudentProfile: (profileData: {
    university: string;
    college: string;
    program: string;
    year: number;
    semester: number;
  }) => Promise<void>;
  updateStudentProfile: (profileData: {
    university: string;
    college: string;
    program: string;
    year: number;
    semester: number;
  }) => Promise<void>;
  
  // Course management
  addCourse: (courseId: string) => Promise<void>;
  removeCourse: (courseId: string) => Promise<void>;
  updateCourseGrade: (courseId: string, grade: string) => Promise<void>;
  getStudentCoursesBySemester: (semester: number, year: number) => Promise<StudentCourse[]>;
  getStudentCoursesFiltered: (filters?: {
    semester?: number;
    year?: number;
    type?: 'core' | 'elective';
  }) => Promise<StudentCourse[]>;
  
  // GPA management
  generateTargetGPA: (targetGPA: number) => Promise<void>;
  resetGrades: () => Promise<void>;
  
  // Clear data
  clearData: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const { toast, toastSuccess, toastError } = useToast();
  
  // Data states
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentCourses, setStudentCourses] = useState<StudentCourse[]>([]);
  const [gpaData, setGpaData] = useState<GPAResponse | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [collegesLoading, setCollegesLoading] = useState(false);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [gpaLoading, setGpaLoading] = useState(false);

  // Ref to track if base data has been loaded
  const baseDataLoadedRef = useRef(false);

  // Detect current route to avoid fetching on public pages (e.g., splash/login)
  const location = useLocation();
  const isPublicRoute = (() => {
    const path = location.pathname || '/';
    return (
      path === '/' ||
      path.startsWith('/login') ||
      path.startsWith('/register') ||
      path.startsWith('/activate') ||
      path.startsWith('/forgot-password')
    );
  })();

  // Helper to normalize API responses that may be arrays or paginated objects
  const extractArray = <T,>(data: unknown): T[] => {
    if (Array.isArray(data)) {
      return data as T[];
    }
    if (
      data !== null &&
      typeof data === 'object' &&
      Array.isArray((data as { results?: unknown }).results)
    ) {
      return (data as { results: T[] }).results;
    }
    return [];
  };

  // Load student profile
  const loadStudentProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const profile = await academicApi.getStudentProfile();
      setStudentProfile(profile);
    } catch (error: unknown) {
      const err = error as Partial<AxiosError> & { response?: { status?: number } };
      if (err.response?.status === 404) {
        // No profile exists yet - this is normal for new users
        console.log('No student profile found - user needs to complete setup');
        setStudentProfile(null);
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        // Unauthenticated; silently ignore on contexts where auth may not be set yet
        setStudentProfile(null);
      } else {
        console.error('Error loading student profile:', error);
        toastError({ title: 'Failed to load student profile' });
      }
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Load universities
  const loadUniversities = useCallback(async () => {
    setUniversitiesLoading(true);
    try {
      const data = await academicApi.getUniversities();
      setUniversities(extractArray<University>(data as unknown));
    } catch (error) {
      console.error('Error loading universities:', error);
      toastError({ title: 'Failed to load universities' });
    } finally {
      setUniversitiesLoading(false);
    }
  }, []);

  // Load colleges by university
  const loadColleges = useCallback(async (universityId: string) => {
    setCollegesLoading(true);
    try {
      const data = await academicApi.getCollegesByUniversity(universityId);
      setColleges(extractArray<College>(data as unknown));
    } catch (error) {
      console.error('Error loading colleges:', error);
      toastError({ title: 'Failed to load colleges' });
    } finally {
      setCollegesLoading(false);
    }
  }, []);

  // Load programs by college
  const loadPrograms = useCallback(async (collegeId: string) => {
    setProgramsLoading(true);
    try {
      const data = await academicApi.getProgramsByCollege(collegeId);
      setPrograms(extractArray<Program>(data as unknown));
    } catch (error) {
      console.error('Error loading programs:', error);
      toastError({ title: 'Failed to load programs' });
    } finally {
      setProgramsLoading(false);
    }
  }, []);

  // Load courses by program
  const loadCourses = useCallback(async (programId: string, year?: number, semester?: number) => {
    setCoursesLoading(true);
    try {
      const data = await academicApi.getCoursesByProgram(programId, year, semester);
      setCourses(extractArray<Course>(data as unknown));
    } catch (error) {
      console.error('Error loading courses:', error);
      toastError({ title: 'Failed to load courses' });
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  // Load student courses without re-fetching the whole profile repeatedly
  const loadStudentCourses = useCallback(async () => {
    try {
      if (!studentProfile || !studentProfile.has_courses) {
        setStudentCourses([]);
        return;
      }
      // Prefer fetching via student profile to ensure consistency with GPA page
      const profile = await academicApi.getStudentProfile();
      const rawCourses = Array.isArray(profile?.courses) ? (profile.courses as unknown[]) : [];
      // Normalize to StudentCourse shape if backend returns Course[]
      type MaybeStudentCourse = Partial<StudentCourse> & Partial<Course> & { [key: string]: unknown };
      const normalized: StudentCourse[] = rawCourses.map((c: MaybeStudentCourse) => {
        if (c && typeof c === 'object' && 'course_code' in c) {
          // Already StudentCourse shape
          return c as StudentCourse;
        }
        // Treat as Course shape and map
        const asCourse = c as Course;
        return {
          id: asCourse.id,
          course: asCourse.id,
          course_code: asCourse.code,
          course_name: asCourse.name,
          course_credits: asCourse.credits,
          course_type: asCourse.type,
          grade: null,
          points: null
        } as StudentCourse;
      });
      setStudentCourses(normalized);
    } catch (error) {
      console.error('Error loading student courses:', error);
      toastError({ title: 'Failed to load student courses' });
    }
  }, [studentProfile]);

  // Load GPA data
  const loadGPA = useCallback(async () => {
    setGpaLoading(true);
    try {
      const data = await academicApi.calculateGPA();
      setGpaData(data);
    } catch (error) {
      console.warn('Skipping GPA load due to error:', error);
    } finally {
      setGpaLoading(false);
    }
  }, []);

  // Create student profile
  const createStudentProfile = async (profileData: {
    university: string;
    college: string;
    program: string;
    year: number;
    semester: number;
  }) => {
    setLoading(true);
    try {
      const profile = await academicApi.createStudentProfile(profileData);
      setStudentProfile(profile);
      toastSuccess({ title: 'Student profile created successfully!' });
    } catch (error) {
      console.error('Error creating student profile:', error);
      toastError({ title: 'Failed to create student profile' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update student profile
  const updateStudentProfile = async (profileData: {
    university: string;
    college: string;
    program: string;
    year: number;
    semester: number;
  }) => {
    setLoading(true);
    try {
      const profile = await academicApi.updateStudentProfile(profileData);
      setStudentProfile(profile);
      toastSuccess({ title: 'Student profile updated successfully!' });
    } catch (error) {
      console.error('Error updating student profile:', error);
      toastError({ title: 'Failed to update student profile' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add course to student
  const addCourse = async (courseId: string) => {
    try {
      await academicApi.addCourse(courseId);
      await loadStudentCourses(); // Reload student courses
      toastSuccess({ title: 'Course added successfully!' });
    } catch (error) {
      console.error('Error adding course:', error);
      toastError({ title: 'Failed to add course' });
      throw error;
    }
  };

  // Remove course from student
  const removeCourse = async (courseId: string) => {
    try {
      await academicApi.removeCourse(courseId);
      await loadStudentCourses(); // Reload student courses
      toastSuccess({ title: 'Course removed successfully!' });
    } catch (error) {
      console.error('Error removing course:', error);
      toastError({ title: 'Failed to remove course' });
      throw error;
    }
  };

  // Update course grade
  const updateCourseGrade = async (courseId: string, grade: string) => {
    try {
      await academicApi.updateCourseGrade(courseId, grade);
      await loadStudentCourses(); // Reload student courses
      await loadGPA(); // Reload GPA data
      toastSuccess({ title: 'Grade updated successfully!' });
    } catch (error) {
      console.error('Error updating course grade:', error);
      toastError({ title: 'Failed to update grade' });
      throw error;
    }
  };

  // Get student courses by semester and year
  const getStudentCoursesBySemester = async (semester: number, year: number): Promise<StudentCourse[]> => {
    try {
      const data = await academicApi.getStudentCoursesBySemester(semester, year);
      return extractArray<StudentCourse>(data);
    } catch (error) {
      console.error('Error fetching courses by semester:', error);
      toastError({ title: 'Failed to fetch courses' });
      throw error;
    }
  };

  // Get student courses with flexible filtering
  const getStudentCoursesFiltered = async (filters: {
    semester?: number;
    year?: number;
    type?: 'core' | 'elective';
  } = {}): Promise<StudentCourse[]> => {
    try {
      const data = await academicApi.getStudentCoursesFiltered(filters);
      return extractArray<StudentCourse>(data);
    } catch (error) {
      console.error('Error fetching filtered courses:', error);
      toastError({ title: 'Failed to fetch courses' });
      throw error;
    }
  };

  // Generate target GPA
  const generateTargetGPA = async (targetGPA: number) => {
    try {
      await academicApi.generateTargetGPA(targetGPA);
      await loadStudentCourses(); // Reload student courses
      await loadGPA(); // Reload GPA data
      toastSuccess({ title: 'Target grades generated successfully!' });
    } catch (error) {
      console.error('Error generating target GPA:', error);
      toastError({ title: 'Failed to generate target grades' });
      throw error;
    }
  };

  // Reset grades
  const resetGrades = async () => {
    try {
      await academicApi.resetGrades();
      await loadStudentCourses(); // Reload student courses
      await loadGPA(); // Reload GPA data
      toastSuccess({ title: 'Grades reset successfully!' });
    } catch (error) {
      console.error('Error resetting grades:', error);
      toastError({ title: 'Failed to reset grades' });
      throw error;
    }
  };

  // Ensure base data is loaded (universities, profile) - only once
  const ensureBaseData = useCallback(async () => {
    if (baseDataLoadedRef.current || isPublicRoute) {
      return;
    }

    try {
      baseDataLoadedRef.current = true;
      await Promise.all([
        loadStudentProfile(),
        loadUniversities()
      ]);
    } catch (error) {
      console.error('Error loading base data:', error);
      baseDataLoadedRef.current = false; // Reset on error to allow retry
    }
  }, [isPublicRoute, loadStudentProfile, loadUniversities]);

  // Clear all data
  const clearData = () => {
    setStudentProfile(null);
    setUniversities([]);
    setColleges([]);
    setPrograms([]);
    setCourses([]);
    setStudentCourses([]);
    setGpaData(null);
    baseDataLoadedRef.current = false; // Reset the ref when clearing data
  };

  // Load initial data once, then stop. Guard to prevent infinite loops.
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        if (!isPublicRoute) {
          await ensureBaseData();
        }
      } finally {
        // no-op
      }
    };
    if (mounted) init();
    return () => { mounted = false; };
  }, [isPublicRoute, ensureBaseData]);

  // Load student courses only when profile is loaded and has_courses is true
  useEffect(() => {
    if (!studentProfile) return;
    if (studentProfile.has_courses) {
      loadStudentCourses();
    } else {
      setStudentCourses([]);
    }
  }, [studentProfile, loadStudentCourses]);

  return (
    <StudentContext.Provider value={{
      // Data
      studentProfile,
      universities,
      colleges,
      programs,
      courses,
      studentCourses,
      gpaData,
      
      // Loading states
      loading,
      profileLoading,
      universitiesLoading,
      collegesLoading,
      programsLoading,
      coursesLoading,
      gpaLoading,
      
      // Actions
      loadStudentProfile,
      loadUniversities,
      loadColleges,
      loadPrograms,
      loadCourses,
      loadStudentCourses,
      loadGPA,
      ensureBaseData,
      createStudentProfile,
      updateStudentProfile,
      addCourse,
      removeCourse,
      updateCourseGrade,
      getStudentCoursesBySemester,
      getStudentCoursesFiltered,
      generateTargetGPA,
      resetGrades,
      clearData
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
}
