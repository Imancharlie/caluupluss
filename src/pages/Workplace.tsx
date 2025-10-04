import React, { useState, useEffect, useRef } from 'react';
import { AxiosError } from 'axios';
import { useAppStore } from '@/store';
import { useStudent } from '@/contexts/StudentContext';
import { University, College, Program, Course } from '@/services/academicApi';
import academicApi from '@/services/academicApi';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/ui/loading';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Activity,
  Calculator
} from 'lucide-react';
import CourseEditModal from '@/components/CourseEditModal';
import { toast } from 'sonner';


const Workplace: React.FC = () => {
  const { user } = useAppStore();
  const { 
    studentProfile,
    universities,
    colleges,
    programs,
    courses,
    studentCourses,
    universitiesLoading,
    collegesLoading,
    programsLoading,
    coursesLoading,
    profileLoading,
    loadUniversities,
    loadColleges,
    loadPrograms,
    loadCourses,
    loadStudentCourses,
    loadStudentProfile,
    createStudentProfile,
    updateStudentProfile,
    addCourse,
    removeCourse
  } = useStudent();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [showAddUniversity, setShowAddUniversity] = useState(false);
  const [newUniversity, setNewUniversity] = useState({ name: '', country: '' });
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [newCollege, setNewCollege] = useState({ name: '' });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showAddCoreCourse, setShowAddCoreCourse] = useState(false);
  const [showAddElectiveCourse, setShowAddElectiveCourse] = useState(false);
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [newProgram, setNewProgram] = useState({ name: '', duration: 3 });
  const [newCourse, setNewCourse] = useState({ code: '', name: '', credits: 0, type: 'core' as 'core' | 'elective' });
  const [localSelectedCourses, setLocalSelectedCourses] = useState<Course[]>([]);
  const [localAddedCourses, setLocalAddedCourses] = useState<Course[]>([]);
  const [roadmapHidden, setRoadmapHidden] = useState(false);
  const [showCourseEditModal, setShowCourseEditModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [isSavingCourses, setIsSavingCourses] = useState(false);
  const [programSearch, setProgramSearch] = useState('');
  const [initialized, setInitialized] = useState(false);
  const lastCoursesFetchKeyRef = useRef<string | null>(null);
  const didInitialCoursesLoadRef = useRef(false);
  const hasCoursesFlag = Boolean((studentProfile as unknown as { has_courses?: boolean } | null)?.has_courses);
  const didInitEditModalRef = useRef(false);

  // Safeguards: always work with arrays when rendering lists
  const safeUniversities = Array.isArray(universities) ? universities : [];
  const safeColleges = Array.isArray(colleges) ? colleges : [];
  const safePrograms = Array.isArray(programs) ? programs : [];

  // Dev-only logging helper
  const isDev = import.meta.env && (import.meta.env.DEV === true);

  // Prevent repeated base-data fetches
  const didAutoLoadUniversitiesRef = useRef(false);

  // Ensure profile and courses are loaded once before rendering steps
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        await loadStudentProfile();
        if (isDev) console.log('[Workplace:init] loadStudentProfile resolved');
      } catch (err) {
        console.error('Failed to initialize Workplace:', err);
      } finally {
        if (mounted) setInitialized(true);
        if (isDev) console.log('[Workplace:init] initialized set to true');
      }
    };
    init();
    return () => { mounted = false; };
  }, [loadStudentProfile]);

  // Initialize with existing profile data
  useEffect(() => {
    if (!initialized) return;
    if (isDev) console.log('[Workplace] initialized effect fired', { hasProfile: Boolean(studentProfile), studentCoursesLen: studentCourses.length, hasCoursesFlag });
    if (studentProfile) {
      setSelectedUniversity(studentProfile.university);
      setSelectedCollege(studentProfile.college);
      setSelectedProgram(studentProfile.program);
      setSelectedYear(studentProfile.year);
      setSelectedSemester(studentProfile.semester);
      // Decide initial step based on data and backend flag
      if (hasCoursesFlag || studentCourses.length > 0) {
        setCurrentStep(6);
        setRoadmapHidden(false);
      } else {
        // Profile exists but no courses yet -> go directly to Manage Courses
        setCurrentStep(5);
        setRoadmapHidden(false);
      }
    } else {
      // No profile yet -> start at step 1
      setCurrentStep(1);
      setRoadmapHidden(false);
    }
  }, [initialized, studentProfile, studentCourses.length, hasCoursesFlag]);

  // Log whenever profile changes
  useEffect(() => {
    if (!initialized) return;
    if (!isDev) return;
    console.log('[Workplace] studentProfile updated', studentProfile ? {
      id: studentProfile.id,
      uni: studentProfile.university?.name,
      program: studentProfile.program?.name,
      year: studentProfile.year,
      semester: studentProfile.semester,
      has_courses: (studentProfile as unknown as { has_courses?: boolean }).has_courses
    } : null);
  }, [initialized, studentProfile]);

  // Log whenever student courses change
  useEffect(() => {
    if (!initialized) return;
    if (!isDev) return;
    console.log('[Workplace] studentCourses updated', { length: studentCourses.length, sample: studentCourses.slice(0, 3).map(c => ({ id: c.id, code: c.course_code })) });
  }, [initialized, studentCourses]);

  // Fallback: if backend says has_courses but we still have 0 locally, try fetching once
  useEffect(() => {
    if (!initialized) return;
    if (!hasCoursesFlag) return;
    if (studentCourses.length > 0) return;
    (async () => {
      try {
        if (isDev) console.log('[Workplace] Fallback loadStudentCourses triggered');
        await loadStudentCourses();
      } catch (e) {
        console.error('[Workplace] Fallback loadStudentCourses failed', e);
      }
    })();
  }, [initialized, hasCoursesFlag, studentCourses.length, loadStudentCourses]);

  // Ensure base data is available for step 1 (only once)
  useEffect(() => {
    if (didAutoLoadUniversitiesRef.current) return;
    const uniCount = Array.isArray(universities) ? universities.length : 0;
    if (uniCount === 0 && !universitiesLoading) {
      didAutoLoadUniversitiesRef.current = true;
      Promise.resolve(loadUniversities()).catch((e) => {
        console.error('Failed to load universities:', e);
      });
    }
  }, [universitiesLoading, loadUniversities]);

  // Local temp selections for Edit Profile modal
  const [editSelectedUniversityId, setEditSelectedUniversityId] = useState<string | null>(null);
  const [editSelectedCollegeId, setEditSelectedCollegeId] = useState<string | null>(null);
  const [editSelectedProgramId, setEditSelectedProgramId] = useState<string | null>(null);
  const [editSelectedYear, setEditSelectedYear] = useState<number>(1);
  const [editSelectedSemester, setEditSelectedSemester] = useState<number>(1);

  // Initialize edit selections when opening the profile modal (one-time per open)
  useEffect(() => {
    if (!showEditProfileModal) {
      didInitEditModalRef.current = false;
      return;
    }
    if (didInitEditModalRef.current) return;
    didInitEditModalRef.current = true;

    if (studentProfile) {
      setEditSelectedUniversityId(studentProfile.university.id);
      setEditSelectedCollegeId(studentProfile.college.id);
      setEditSelectedProgramId(studentProfile.program.id);
      setEditSelectedYear(studentProfile.year);
      setEditSelectedSemester(studentProfile.semester);
      // Preload dependent lists once
      loadColleges(studentProfile.university.id);
      loadPrograms(studentProfile.college.id);
      return;
    }

    // No profile yet: default to first already-loaded items if present
    if (!editSelectedUniversityId && Array.isArray(universities) && universities.length > 0) {
      setEditSelectedUniversityId(universities[0].id);
      loadColleges(universities[0].id);
    }
    if (!editSelectedCollegeId && Array.isArray(colleges) && colleges.length > 0) {
      setEditSelectedCollegeId(colleges[0].id);
      loadPrograms(colleges[0].id);
    }
    if (!editSelectedProgramId && Array.isArray(programs) && programs.length > 0) {
      setEditSelectedProgramId(programs[0].id);
    }
  }, [showEditProfileModal, studentProfile, universities, colleges, programs, loadColleges, loadPrograms, editSelectedUniversityId, editSelectedCollegeId, editSelectedProgramId]);

  // Load colleges when university is selected
  useEffect(() => {
    if (selectedUniversity) {
      loadColleges(selectedUniversity.id);
    }
  }, [selectedUniversity, loadColleges]);

  // Load programs when college is selected
  useEffect(() => {
    if (selectedCollege) {
      loadPrograms(selectedCollege.id);
    }
  }, [selectedCollege, loadPrograms]);

  // Load courses when program/year/semester change, once per tuple
  useEffect(() => {
    if (!selectedProgram || !selectedYear || !selectedSemester) return;
    const key = `${selectedProgram.id}-${selectedYear}-${selectedSemester}`;
    if (lastCoursesFetchKeyRef.current === key) return;
    if (coursesLoading) return;
    lastCoursesFetchKeyRef.current = key;
    loadCourses(selectedProgram.id, selectedYear, selectedSemester);
  }, [selectedProgram?.id, selectedYear, selectedSemester, coursesLoading, loadCourses]);

  // On entering Manage Courses, trigger a single initial fetch based on current selections
  useEffect(() => {
    if (currentStep !== 5) return;
    if (didInitialCoursesLoadRef.current) return;
    if (!selectedProgram || !selectedYear || !selectedSemester) return;
    didInitialCoursesLoadRef.current = true;
    const key = `${selectedProgram.id}-${selectedYear}-${selectedSemester}`;
    if (lastCoursesFetchKeyRef.current !== key) {
      lastCoursesFetchKeyRef.current = key;
      loadCourses(selectedProgram.id, selectedYear, selectedSemester);
    }
  }, [currentStep, selectedProgram, selectedYear, selectedSemester, loadCourses]);

  // Auto-select core courses when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && localSelectedCourses.length === 0) {
      const coreCourses = courses.filter(c => c.type === 'core');
      setLocalSelectedCourses(coreCourses);
    }
  }, [courses, localSelectedCourses.length]);

  const handleAddUniversity = async () => {
    if (!newUniversity.name.trim() || !newUniversity.country.trim()) {
      toast.error('Please provide university name and country');
      return;
    }
    try {
      const created = await academicApi.createUniversity({
        name: newUniversity.name.trim(),
        country: newUniversity.country.trim()
      });
      toast.success(`University created: ${created.name}`);
      setNewUniversity({ name: '', country: '' });
      setShowAddUniversity(false);
      await loadUniversities();
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string; detail?: string }>;
      const msg = axiosErr.response?.data?.error || axiosErr.response?.data?.detail || 'Failed to create university';
      toast.error(msg);
    }
  };

  const handleContinueToCourseSelection = async () => {
    if (!selectedUniversity || !selectedCollege || !selectedProgram) {
      toast.error('Please select university, college, and program first');
      return;
    }
    setLoading(true);
    const endpoint = '/students/profile/create/';
    const payload = {
      university: selectedUniversity.id,
      college: selectedCollege.id,
      program: selectedProgram.id,
      year: selectedYear,
      semester: selectedSemester
    };
    // silently ensure profile exists and proceed to courses
    try {
      await api.post(endpoint, payload);
      await loadStudentProfile();
      await loadStudentCourses();
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      // If profile already exists or validation complains due to existing profile, proceed silently
      if (status === 400 || status === 409) {
        // proceed silently
      } else {
        console.error('Error ensuring student profile:', error);
        toast.error('Failed to initialize profile');
      }
    } finally {
      setLoading(false);
      setRoadmapHidden(false);
      setCurrentStep(5);
    }
  };

  const handleEditCourses = () => {
    setShowCourseEditModal(true);
  };

  const handleSaveCourseEdits = async (editedCourses: Course[]) => {
    setIsSavingCourses(true);
    try {
      // Format courses for backend save
      const formattedCourses = editedCourses.map(course => ({
        course_code: course.code,
        course_name: course.name,
        is_elective: course.type === 'elective',
        credit_hour: course.credits,
        course_id: course.id,
        semester: course.semester,
        year: course.year
      }));

      console.log('Saving courses from Workplace:', {
        url: '/api/students/courses/batch/',
        method: 'POST',
        body: { courses: formattedCourses }
      });

      // Save to backend
      await academicApi.saveCoursesBatch(formattedCourses);

      // Refresh student courses to show the updated list
      await loadStudentCourses();

      toast.success('Courses updated successfully!');
    } catch (error) {
      console.error('Error saving course edits:', error);
      toast.error('Failed to save course changes. Please try again.');
    } finally {
      setIsSavingCourses(false);
    }
  };

  const handleAddCollege = async () => {
    if (!selectedUniversity) {
      toast.error('Please select a university first');
      return;
    }
    if (!newCollege.name.trim()) {
      toast.error('Please provide a college name');
      return;
    }
    try {
      const created = await academicApi.createCollege({
        name: newCollege.name.trim(),
        university: selectedUniversity.id
      });
      toast.success(`College created: ${created.name}`);
      setNewCollege({ name: '' });
      setShowAddCollege(false);
      await loadColleges(selectedUniversity.id);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string; detail?: string }>;
      const msg = axiosErr.response?.data?.error || axiosErr.response?.data?.detail || 'Failed to create college';
      toast.error(msg);
    }
  };

  const handleToggleElectiveCourse = (course: Course) => {
    const isSelected = localSelectedCourses.find(c => c.id === course.id);
    if (isSelected) {
      setLocalSelectedCourses(prev => prev.filter(c => c.id !== course.id));
    } else {
      setLocalSelectedCourses(prev => [...prev, course]);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    setLocalSelectedCourses(prev => prev.filter(c => c.id !== courseId));
  };

  const handleAddNewCourse = () => {
    if (newCourse.code && newCourse.name && newCourse.credits > 0) {
      const course: Course = {
        id: `temp-${Date.now()}`,
        code: newCourse.code,
        name: newCourse.name,
        credits: newCourse.credits,
        type: newCourse.type,
        program: selectedProgram?.id || '',
        program_name: selectedProgram?.name || '',
        year: selectedYear,
        semester: selectedSemester
      };
      
      setLocalSelectedCourses(prev => [...prev, course]);
      setLocalAddedCourses(prev => [...prev, course]);
      setNewCourse({ code: '', name: '', credits: 0, type: 'core' });
      
      if (newCourse.type === 'core') {
        setShowAddCoreCourse(false);
      } else {
        setShowAddElectiveCourse(false);
      }
      
      toast.success('Course added successfully!');
    }
  };

  const handleSaveAllCourses = async () => {
    setLoading(true);
    try {
      // Format all selected courses into a single batch request
      const formattedCourses = localSelectedCourses.map(course => ({
        course_code: course.code,
        course_name: course.name,
        is_elective: course.type === 'elective',
        credit_hour: course.credits,
        course_id: course.id,
        semester: course.semester,
        year: course.year
      }));

      // Debug log of payload and endpoint
      const endpoint = '/students/courses/batch/';
      const fullUrl = `${api.defaults.baseURL}${endpoint}`;
      console.log('About to send batch courses:', {
        url: fullUrl,
        method: 'POST',
        body: { courses: formattedCourses }
      });

      // Send batch request to backend using academicApi
      const result = await academicApi.saveCoursesBatch(formattedCourses);
      console.log('Batch save result:', result);
      
      // Refresh student courses to show the saved ones
      await loadStudentCourses();
      
      toast.success('Courses saved successfully!');
      // After saving, refresh profile and courses, then show enrolled courses
      await loadStudentProfile();
      await loadStudentCourses();
      setRoadmapHidden(false);
      setCurrentStep(6);
    } catch (error) {
      console.error('Error saving courses:', error);
      toast.error('Failed to save courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudentInfo = async () => {
    if (!selectedUniversity || !selectedCollege || !selectedProgram) {
      toast.error('Please complete all selections before saving');
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        university: selectedUniversity.id,
        college: selectedCollege.id,
        program: selectedProgram.id,
        year: selectedYear,
        semester: selectedSemester
      };

      if (studentProfile) {
        await updateStudentProfile(profileData);
      } else {
        await createStudentProfile(profileData);
      }

      setRoadmapHidden(true);
      toast.success('Student profile saved successfully!');
    
    // Navigate to GPA calculator after saving
    setTimeout(() => {
      window.location.href = '/calculator';
    }, 1500);
    } catch (error) {
      console.error('Error saving student profile:', error);
      toast.error('Failed to save student profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (course: Course) => {
    try {
      const endpoint = '/students/courses/';
      console.log('About to add course:', {
        url: `${api.defaults.baseURL}${endpoint}`,
        method: 'POST',
        body: { course_id: course.id }
      });
      await addCourse(course.id);
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    try {
      const endpoint = `/students/courses/${courseId}/`;
      console.log('About to remove course:', {
        url: `${api.defaults.baseURL}${endpoint}`,
        method: 'DELETE'
      });
      await removeCourse(courseId);
    } catch (error) {
      console.error('Error removing course:', error);
    }
  };

  const handleElectiveCourseClick = async (course: Course) => {
    const isSelected = studentCourses.find(sc => sc.course === course.id);
    if (isSelected) {
      await handleRemoveCourse(course.id);
    } else {
      await handleAddCourse(course);
    }
  };

  const steps = [
    { number: 1, title: 'Setup', description: 'University & Program' },
    { number: 2, title: 'Academic', description: 'Year & Semester' },
    { number: 3, title: 'Courses', description: 'Core & Electives' },
    { number: 4, title: 'Review', description: 'Save & Complete' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Removed blurred/skeleton placeholder for a snappier feel */}
        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-4">
            <div className="p-3 bg-caluu-blue rounded-full shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Workplace Setup</h1>
              <p className="text-gray-600">Configure your academic program and course selection</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        {!roadmapHidden && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep >= step.number
                        ? 'bg-caluu-blue border-caluu-blue text-white shadow-lg'
                        : 'border-gray-300 text-gray-400 bg-white'
                    }`}>
                      {currentStep > step.number ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold">{step.number}</span>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-sm font-medium text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-600 hidden sm:block">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-caluu-blue' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Profile Summary - Show when profile exists */}
        {studentProfile && (
          <Card className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Your Academic Program</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">University</p>
                      <p className="text-sm font-semibold text-gray-900">{studentProfile.university?.name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Program</p>
                      <p className="text-sm font-semibold text-gray-900">{studentProfile.program?.name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Year {studentProfile.year}, Sem {studentProfile.semester}</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {studentCourses.length} courses enrolled
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <GraduationCap className="w-12 h-12 text-caluu-blue" />
                  <div className="flex gap-2 mt-2">
                    <Button 
                      onClick={() => setShowEditProfileModal(true)}
                      className="bg-white text-caluu-blue border border-caluu-blue hover:bg-blue-50"
                      size="sm"
                      disabled={isSavingCourses}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit Profile
                    </Button>
                    
                
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Step Content */}
        {!roadmapHidden && (
          <Card className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <CardContent className="p-6">
            {/* Step 1: University Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Your University</h2>
                  <p className="text-gray-600">Choose the university where you're studying</p>
                </div>

                {universitiesLoading ? (
                  <Loading 
                    size="lg" 
                    text="Loading universities..." 
                    variant="spinner"
                    color="blue"
                    className="py-8"
                  />
                ) : Array.isArray(universities) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {safeUniversities.map((university) => (
                    <Card
                      key={university.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedUniversity?.id === university.id
                          ? 'ring-2 ring-caluu-blue bg-blue-50 border-caluu-blue'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                          setSelectedUniversity(university);
                          setCurrentStep(2);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-caluu-blue rounded-lg">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{university.name}</h3>
                            <p className="text-xs text-gray-600">{university.country}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                ) : (
                  <div className="text-center text-gray-500">No universities available.</div>
                )}

                <Dialog open={showAddUniversity} onOpenChange={setShowAddUniversity}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-caluu-blue hover:bg-caluu-blue-light text-white py-3 text-lg font-medium">
                      <Plus className="w-5 h-5 mr-2" />
                      Add New University
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-gray-200">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900">Add New University</DialogTitle>
                      <DialogDescription className="text-gray-600">
                        Add a university that's not in our list
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="university-name" className="text-gray-700">University Name</Label>
                        <Input
                          id="university-name"
                          value={newUniversity.name}
                          onChange={(e) => setNewUniversity({ ...newUniversity, name: e.target.value })}
                          className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter university name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="university-country" className="text-gray-700">Country</Label>
                        <Input
                          id="university-country"
                          value={newUniversity.country}
                          onChange={(e) => setNewUniversity({ ...newUniversity, country: e.target.value })}
                          className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter country"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddUniversity(false)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddUniversity}
                        className="bg-caluu-blue hover:bg-caluu-blue-light text-white"
                      >
                        Add University
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Step 2: College Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Your College</h2>
                  <p className="text-gray-600">Choose the college within {selectedUniversity?.name}</p>
                </div>

                {collegesLoading ? (
                  <Loading 
                    size="lg" 
                    text="Loading colleges..." 
                    variant="spinner"
                    color="blue"
                    className="py-8"
                  />
                ) : Array.isArray(colleges) ? (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {safeColleges.map((college) => (
                      <Card
                        key={college.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedCollege?.id === college.id
                            ? 'ring-2 ring-caluu-blue bg-blue-50 border-caluu-blue'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          setSelectedCollege(college);
                          setCurrentStep(3);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-caluu-blue rounded-lg">
                              <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{college.name}</h3>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                    <Dialog open={showAddCollege} onOpenChange={setShowAddCollege}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-caluu-blue hover:bg-caluu-blue-light text-white py-3 text-lg font-medium">
                          <Plus className="w-5 h-5 mr-2" />
                          Add New College
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white border-gray-200">
                        <DialogHeader>
                          <DialogTitle className="text-gray-900">Add New College</DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Add a college that's not in our list for {selectedUniversity?.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="college-name" className="text-gray-700">College Name</Label>
                            <Input
                              id="college-name"
                              value={newCollege.name}
                              onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                              className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter college name"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowAddCollege(false)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddCollege}
                            className="bg-caluu-blue hover:bg-caluu-blue-light text-white"
                          >
                            Add College
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <div className="text-center text-gray-500">No colleges available.</div>
                )}
              </div>
            )}

            {/* Add Core Course Modal */}
            <Dialog open={showAddCoreCourse} onOpenChange={setShowAddCoreCourse}>
              <DialogContent className="bg-white border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">Add New Core Course</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Add a new core course to your program
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="course-code" className="text-gray-700">Course Code</Label>
                    <Input
                      id="course-code"
                      value={newCourse.code}
                      onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., CS101"
                    />
                  </div>
                  <div>
                    <Label htmlFor="course-name" className="text-gray-700">Course Name</Label>
                    <Input
                      id="course-name"
                      value={newCourse.name}
                      onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Introduction to Programming"
                    />
                  </div>
                  <div>
                    <Label htmlFor="course-credits" className="text-gray-700">Credits</Label>
                    <Input
                      id="course-credits"
                      type="number"
                      value={newCourse.credits}
                      onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 0 })}
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddCoreCourse(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddNewCourse}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Add Core Course
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add Elective Course Modal */}
            <Dialog open={showAddElectiveCourse} onOpenChange={setShowAddElectiveCourse}>
              <DialogContent className="bg-white border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">Add New Elective Course</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Add a new elective course to your program
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="elective-code" className="text-gray-700">Course Code</Label>
                    <Input
                      id="elective-code"
                      value={newCourse.code}
                      onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., ELEC201"
                    />
                  </div>
                  <div>
                    <Label htmlFor="elective-name" className="text-gray-700">Course Name</Label>
                    <Input
                      id="elective-name"
                      value={newCourse.name}
                      onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Advanced Mathematics"
                    />
                  </div>
                  <div>
                    <Label htmlFor="elective-credits" className="text-gray-700">Credits</Label>
                    <Input
                      id="elective-credits"
                      type="number"
                      value={newCourse.credits}
                      onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 0 })}
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddElectiveCourse(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddNewCourse}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Elective Course
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Step 3: Program Selection */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Your Program</h2>
                  <p className="text-gray-600">Choose your program from {selectedCollege?.name}</p>
                </div>

                {programsLoading ? (
                  <Loading 
                    size="lg" 
                    text="Loading programs..." 
                    variant="spinner"
                    color="blue"
                    className="py-8"
                  />
                ) : (
                  <>
                    <div className="mb-3">
                      <Input
                        placeholder="Search program..."
                        value={programSearch}
                        onChange={(e) => setProgramSearch(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  <div className="mb-4">
                    <Button
                      className="bg-caluu-blue hover:bg-caluu-blue-light text-white"
                      size="sm"
                      onClick={() => setShowAddProgram(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Program
                    </Button>
                  </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {programs
                        .filter(p => !programSearch.trim() || p.name.toLowerCase().includes(programSearch.toLowerCase()))
                        .map((program) => (
                        <Card
                          key={program.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedProgram?.id === program.id
                              ? 'ring-2 ring-caluu-blue bg-blue-50 border-caluu-blue'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setSelectedProgram(program);
                            setCurrentStep(4);
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-caluu-blue rounded">
                                <BookOpen className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-medium text-sm text-gray-900">{program.name}</h3>
                                <p className="text-xs text-gray-600">{program.duration} years</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {/* Add Program Modal */}
            <Dialog open={showAddProgram} onOpenChange={setShowAddProgram}>
              <DialogContent className="bg-white border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">Add New Program</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Create a program in {selectedCollege?.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700">Program Name</Label>
                    <Input
                      value={newProgram.name}
                      onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">Duration (years)</Label>
                    <Input
                      type="number"
                      value={newProgram.duration}
                      onChange={(e) => setNewProgram({ ...newProgram, duration: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 4"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddProgram(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-caluu-blue hover:bg-caluu-blue-light text-white"
                    onClick={async () => {
                      try {
                        if (!selectedCollege) {
                          toast.error('Please select a college first');
                          return;
                        }
                        if (!newProgram.name.trim()) {
                          toast.error('Program name is required');
                          return;
                        }
                        const created = await academicApi.createProgram({
                          name: newProgram.name.trim(),
                          college: selectedCollege.id,
                          duration: newProgram.duration
                        });
                        toast.success(`Program created: ${created.name}`);
                        setShowAddProgram(false);
                        setNewProgram({ name: '', duration: 3 });
                        await loadPrograms(selectedCollege.id);
                      } catch (err: unknown) {
                        const axiosErr = err as { response?: { data?: { error?: string; detail?: string } } };
                        const msg = axiosErr.response?.data?.error || axiosErr.response?.data?.detail || 'Failed to create program';
                        toast.error(msg);
                      }
                    }}
                  >
                    Add Program
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Step 4: Year & Semester Selection */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Year & Semester</h2>
                  <p className="text-gray-600">Choose your current year and semester</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-700 font-medium">Academic Year</Label>
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(value) => setSelectedYear(parseInt(value))}
                    >
                      <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {Array.from({ length: Math.max(1, selectedProgram?.duration || 1) }, (_, i) => i + 1).map((year) => (
                          <SelectItem key={year} value={year.toString()} className="text-gray-900">
                            Year {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-700 font-medium">Semester</Label>
                    <Select
                      value={selectedSemester.toString()}
                      onValueChange={(value) => setSelectedSemester(parseInt(value))}
                    >
                      <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="1" className="text-gray-900">Semester 1</SelectItem>
                        <SelectItem value="2" className="text-gray-900">Semester 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleContinueToCourseSelection}
                  className="w-full bg-caluu-blue hover:bg-caluu-blue-light text-white py-3 text-lg font-medium"
                >
                  Continue to Course Selection
                </Button>
              </div>
            )}

            {/* Step 5: Course Management */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Manage Your Courses</h2>
                  <p className="text-gray-600">
                    {selectedProgram?.name} - Year {selectedYear}, Semester {selectedSemester}
                  </p>
                </div>

                {coursesLoading ? (
                  <Loading 
                    size="md" 
                    text="Loading courses..." 
                    variant="spinner"
                    color="blue"
                    className="py-6"
                  />
                ) : (
                  <div className="space-y-6">
                    {/* Core Courses Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          {(() => {
                            const list = Array.isArray(courses) ? courses : [];
                            const all = [...list, ...localAddedCourses];
                            const seen = new Set<string>();
                            const merged = all.filter(c => c.type === 'core' && (!seen.has(c.id) && (seen.add(c.id), true)));
                            return `Core Courses (${merged.length})`;
                          })()}
                        </h3>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => {
                            setNewCourse({ code: '', name: '', credits: 0, type: 'core' });
                            setShowAddCoreCourse(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Core
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {(() => {
                          const list = Array.isArray(courses) ? courses : [];
                          const all = [...list, ...localAddedCourses];
                          const seen = new Set<string>();
                          const merged = all.filter(c => c.type === 'core' && (!seen.has(c.id) && (seen.add(c.id), true)));
                          return merged.map((course) => {
                          const isSelected = localSelectedCourses.find(c => c.id === course.id);
                            return (
                            <Card 
                              key={course.id} 
                              className={`transition-all ${
                                isSelected 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">{course.code} - {course.name}</h4>
                                  <p className="text-xs text-gray-600">{course.credits} credits</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isSelected && (
                                    <>
                                      <Badge className="bg-green-100 text-green-800">Selected</Badge>
                                  <Button
                                    size="sm"
                                        variant="outline"
                                        className="text-blue-600 hover:bg-blue-50 border-blue-200"
                                        onClick={() => setEditingCourse(course)}
                                  >
                                        <Edit className="w-3 h-3" />
                                  </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50 border-red-200"
                                        onClick={() => handleDeleteCourse(course.id)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </>
                                    )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Elective Courses Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          {(() => {
                            const list = Array.isArray(courses) ? courses : [];
                            const all = [...list, ...localAddedCourses];
                            const seen = new Set<string>();
                            const merged = all.filter(c => c.type === 'elective' && (!seen.has(c.id) && (seen.add(c.id), true)));
                            return `Elective Courses (${merged.length})`;
                          })()}
                        </h3>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            setNewCourse({ code: '', name: '', credits: 0, type: 'elective' });
                            setShowAddElectiveCourse(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Elective
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {(() => {
                          const list = Array.isArray(courses) ? courses : [];
                          const all = [...list, ...localAddedCourses];
                          const seen = new Set<string>();
                          const merged = all.filter(c => c.type === 'elective' && (!seen.has(c.id) && (seen.add(c.id), true)));
                          return merged.map((course) => {
                          const isSelected = localSelectedCourses.find(c => c.id === course.id);
                            return (
                            <Card 
                              key={course.id} 
                              className={`cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleToggleElectiveCourse(course)}
                            >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">{course.code} - {course.name}</h4>
                                  <p className="text-xs text-gray-600">{course.credits} credits</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isSelected ? (
                                    <>
                                      <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-blue-600 hover:bg-blue-50 border-blue-200"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingCourse(course);
                                        }}
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50 border-red-200"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteCourse(course.id);
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </>
                                    ) : (
                                  <Button
                                    size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleElectiveCourse(course);
                                      }}
                                  >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add
                                  </Button>
                                    )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Enrolled Courses Section - Show after saving */}
                    {Array.isArray(studentCourses) && studentCourses.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          Enrolled Courses ({studentCourses.length})
                        </h3>
                    <Card className="bg-gray-50 border-gray-200">
                          <CardContent className="p-4">
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {Array.isArray(studentCourses) && studentCourses.map((studentCourse) => (
                                <div key={studentCourse.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{studentCourse.course_code} - {studentCourse.course_name}</p>
                                    <p className="text-xs text-gray-600">{studentCourse.course_credits} credits • {studentCourse.course_type}</p>
                                  </div>
                                  <Badge className={`${
                                    studentCourse.course_type === 'core' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {studentCourse.course_type}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(4)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2 h-9"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSaveAllCourses}
                    disabled={loading || localSelectedCourses.length === 0}
                    className="bg-caluu-blue hover:bg-caluu-blue-light text-white px-5 py-2 h-9 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Courses
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: Review & Save */}
            {currentStep === 6 && (
              <div className="space-y-6">
              

                <div className="grid grid-cols-1 gap-6">
                <Button 
                      onClick={handleEditCourses}
                      className="bg-caluu-blue hover:bg-caluu-blue-light text-white"
                      size="sm"
                      disabled={isSavingCourses}
                    >
                      {isSavingCourses ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit Courses
                        </>
                      )}
                    </Button>
                  <Card className="bg-gray-50 border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-gray-900 text-lg">Enrolled Courses ({studentCourses.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {studentCourses.map((studentCourse) => (
                          <div key={studentCourse.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 text-sm truncate">{studentCourse.course_code} - {studentCourse.course_name}</p>
                              <p className="text-gray-600 text-xs">{studentCourse.course_credits} credits • {studentCourse.course_type}</p>
                            </div>
                          </div>
                        ))}
                        {studentCourses.length === 0 && (
                          <p className="text-gray-500 text-sm text-center py-4">No courses enrolled yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>


              </div>
            )}

          </CardContent>
        </Card>
        )}

        {/* Course Edit Modal */}
        <CourseEditModal
          isOpen={showCourseEditModal}
          onClose={() => setShowCourseEditModal(false)}
          courses={studentCourses.map(sc => ({
            id: sc.course,
            code: sc.course_code,
            name: sc.course_name,
            credits: sc.course_credits,
            type: sc.course_type as 'core' | 'elective',
            semester: selectedSemester,
            year: selectedYear,
            program: selectedProgram?.id || '',
            program_name: selectedProgram?.name || ''
          }))}
          onSave={handleSaveCourseEdits}
          programName={selectedProgram?.name || ''}
          year={selectedYear}
          semester={selectedSemester}
        />

        {/* Edit Profile Modal */}
        <Dialog open={showEditProfileModal} onOpenChange={setShowEditProfileModal}>
          <DialogContent className="bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Edit Profile</DialogTitle>
              <DialogDescription className="text-gray-600">Update your university, program, year and semester</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700">University</Label>
                <Select
                  value={editSelectedUniversityId || ''}
                  onValueChange={(val) => {
                    setEditSelectedUniversityId(val);
                    setEditSelectedCollegeId(null);
                    setEditSelectedProgramId(null);
                    loadColleges(val);
                  }}
                >
                  <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {safeUniversities.map(u => (
                      <SelectItem key={u.id} value={u.id} className="text-gray-900">{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-700">College</Label>
                <Select
                  value={editSelectedCollegeId || ''}
                  onValueChange={(val) => {
                    setEditSelectedCollegeId(val);
                    setEditSelectedProgramId(null);
                    loadPrograms(val);
                  }}
                >
                  <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {safeColleges.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-gray-900">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-700">Program</Label>
                <Select
                  value={editSelectedProgramId || ''}
                  onValueChange={(val) => setEditSelectedProgramId(val)}
                >
                  <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {safePrograms.map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-gray-900">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700">Year</Label>
                  <Select value={editSelectedYear.toString()} onValueChange={(v) => setEditSelectedYear(parseInt(v))}>
                    <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {[1,2,3,4,5].map(y => (
                        <SelectItem key={y} value={y.toString()} className="text-gray-900">Year {y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700">Semester</Label>
                  <Select value={editSelectedSemester.toString()} onValueChange={(v) => setEditSelectedSemester(parseInt(v))}>
                    <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="1" className="text-gray-900">Semester 1</SelectItem>
                      <SelectItem value="2" className="text-gray-900">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditProfileModal(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                className="bg-caluu-blue hover:bg-caluu-blue-light text-white"
                onClick={async () => {
                  if (!editSelectedUniversityId || !editSelectedCollegeId || !editSelectedProgramId) {
                    toast.error('Please select university, college and program');
                    return;
                  }
                  try {
                    await updateStudentProfile({
                      university: editSelectedUniversityId,
                      college: editSelectedCollegeId,
                      program: editSelectedProgramId,
                      year: editSelectedYear,
                      semester: editSelectedSemester
                    });
                    await loadStudentProfile();
                    await loadStudentCourses();
                    // Decide next step after update
                    if (hasCoursesFlag || (Array.isArray(studentCourses) && studentCourses.length > 0)) {
                      setCurrentStep(6);
                    } else {
                      setCurrentStep(5);
                    }
                    setShowEditProfileModal(false);
                  } catch (e) {
                    console.error('Failed to update profile:', e);
                  }
                }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Workplace;
