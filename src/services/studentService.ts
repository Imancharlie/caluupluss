// Student Information Service
// Handles student academic program data and course management

export interface University {
  id: string;
  name: string;
  country: string;
}

export interface College {
  id: string;
  name: string;
  universityId: string;
}

export interface Program {
  id: string;
  name: string;
  collegeId: string;
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
  grade?: string; // For GPA calculation
  points?: number; // Calculated points based on grade
}

export interface StudentInfo {
  university: University | null;
  college: College | null;
  program: Program | null;
  year: number;
  semester: number;
  courses: Course[];
  createdAt: string;
  updatedAt: string;
}

class StudentService {
  private readonly STORAGE_KEY = 'studentInfo';

  // Save student information to localStorage
  saveStudentInfo(studentInfo: StudentInfo): void {
    const updatedInfo = {
      ...studentInfo,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedInfo));
    
    // Also save courses to sessionStorage for GPA calculator
    if (studentInfo.courses && studentInfo.courses.length > 0) {
      sessionStorage.setItem("workplaceCourses", JSON.stringify(studentInfo.courses));
    }
  }

  // Get student information from localStorage
  getStudentInfo(): StudentInfo | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error loading student info:', error);
      return null;
    }
  }

  // Update student courses
  updateCourses(courses: Course[]): void {
    const studentInfo = this.getStudentInfo();
    if (studentInfo) {
      studentInfo.courses = courses;
      this.saveStudentInfo(studentInfo);
      
      // Also save to sessionStorage for GPA calculator
      sessionStorage.setItem("workplaceCourses", JSON.stringify(courses));
    }
  }

  // Add a course to student's program
  addCourse(course: Course): void {
    const studentInfo = this.getStudentInfo();
    if (studentInfo) {
      const existingCourse = studentInfo.courses.find(c => c.id === course.id);
      if (!existingCourse) {
        studentInfo.courses.push(course);
        this.saveStudentInfo(studentInfo);
      }
    }
  }

  // Remove a course from student's program
  removeCourse(courseId: string): void {
    const studentInfo = this.getStudentInfo();
    if (studentInfo) {
      studentInfo.courses = studentInfo.courses.filter(c => c.id !== courseId);
      this.saveStudentInfo(studentInfo);
    }
  }

  // Get courses for GPA calculation
  getCoursesForGPA(): Course[] {
    const studentInfo = this.getStudentInfo();
    return studentInfo?.courses || [];
  }

  // Update course grade for GPA calculation
  updateCourseGrade(courseId: string, grade: string): void {
    const studentInfo = this.getStudentInfo();
    if (studentInfo) {
      const course = studentInfo.courses.find(c => c.id === courseId);
      if (course) {
        course.grade = grade;
        course.points = this.calculateGradePoints(grade);
        this.saveStudentInfo(studentInfo);
      }
    }
  }

  // Calculate grade points based on grade
  private calculateGradePoints(grade: string): number {
    const gradePoints: { [key: string]: number } = {
      'A+': 4.0,
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D+': 1.3,
      'D': 1.0,
      'F': 0.0
    };
    return gradePoints[grade.toUpperCase()] || 0.0;
  }

  // Calculate GPA from student courses
  calculateGPA(): { gpa: number; totalCredits: number; totalPoints: number } {
    const courses = this.getCoursesForGPA();
    const gradedCourses = courses.filter(c => c.grade && c.points !== undefined);
    
    if (gradedCourses.length === 0) {
      return { gpa: 0, totalCredits: 0, totalPoints: 0 };
    }

    const totalCredits = gradedCourses.reduce((sum, course) => sum + course.credits, 0);
    const totalPoints = gradedCourses.reduce((sum, course) => sum + (course.points! * course.credits), 0);
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

    return {
      gpa: Math.round(gpa * 100) / 100, // Round to 2 decimal places
      totalCredits,
      totalPoints
    };
  }

  // Get courses by type (core or elective)
  getCoursesByType(type: 'core' | 'elective'): Course[] {
    const courses = this.getCoursesForGPA();
    return courses.filter(course => course.type === type);
  }

  // Get courses by semester
  getCoursesBySemester(semester: number): Course[] {
    const courses = this.getCoursesForGPA();
    return courses.filter(course => course.semester === semester);
  }

  // Get courses by year
  getCoursesByYear(year: number): Course[] {
    const courses = this.getCoursesForGPA();
    return courses.filter(course => course.year === year);
  }

  // Clear all student information
  clearStudentInfo(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Check if student info is complete
  isStudentInfoComplete(): boolean {
    const studentInfo = this.getStudentInfo();
    return !!(
      studentInfo &&
      studentInfo.university &&
      studentInfo.college &&
      studentInfo.program &&
      studentInfo.courses.length > 0
    );
  }

  // Get student info summary for display
  getStudentInfoSummary(): {
    university: string;
    college: string;
    program: string;
    year: number;
    semester: number;
    totalCourses: number;
    coreCourses: number;
    electiveCourses: number;
  } | null {
    const studentInfo = this.getStudentInfo();
    if (!studentInfo) return null;

    const coreCourses = this.getCoursesByType('core').length;
    const electiveCourses = this.getCoursesByType('elective').length;

    return {
      university: studentInfo.university?.name || 'Not selected',
      college: studentInfo.college?.name || 'Not selected',
      program: studentInfo.program?.name || 'Not selected',
      year: studentInfo.year,
      semester: studentInfo.semester,
      totalCourses: studentInfo.courses.length,
      coreCourses,
      electiveCourses
    };
  }
}

// Export singleton instance
export const studentService = new StudentService();
export default studentService;

