import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useStudent } from "@/contexts/StudentContext";
import { Course as BackendCourse } from "@/services/academicApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Use global loader; avoid page-local overlay to prevent double loaders
import { 
  Calculator, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Edit, 
  CheckCircle, 
  AlertTriangle,
  ChevronLeft,
  RefreshCw,
  Sparkles,
  BarChart3,
  Award,
  Zap
} from "lucide-react";
import CourseEditModal from "@/components/CourseEditModal";
import academicApi from "@/services/academicApi";
import {
  loadCourseEdits,
  saveCourseEdits,
  mergeCourses,
  coursesToEdits,
  getEditStatistics
} from "@/utils/courseEditUtils";

interface AcademicYearInfo {
  program_name: string;
  year: number;
  program_id: number;
}

interface Course extends BackendCourse {
  academic_year_info?: AcademicYearInfo;
  is_elective?: boolean;
  isEdited?: boolean;
  isAdded?: boolean;
}

interface GradeEntry {
  courseId: string;
  grade: string;
}

interface GradePoint {
  grade: string;
  points: number;
}

interface Selection {
  programId: string;
  programName: string;
  academicYearId: string;
  academicYear: number;
  semester: number;
  containsElectives: boolean;
  coursesConfirmed: boolean;
}

interface WorkplaceCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: 'core' | 'elective';
  semester?: number;
  year?: number;
}

const GpaCalculator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    studentProfile,
    studentCourses,
    gpaData,
    gpaLoading,
    loadStudentCourses,
    loadGPA,
    updateCourseGrade,
    generateTargetGPA,
    resetGrades
  } = useStudent();

  const [selection, setSelection] = useState<Selection | null>(null);
  const [originalCourses, setOriginalCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [gpa, setGpa] = useState<number | null>(null);
  const [targetGpa, setTargetGpa] = useState<string>("");
  const [isGeneratingGrades, setIsGeneratingGrades] = useState(false);
  const [activeTab, setActiveTab] = useState("calculate");

  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackIssue, setFeedbackIssue] = useState("");
  const [feedbackDescription, setFeedbackDescription] = useState("");
  const [showNotification, setShowNotification] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);
  const [showNoCoursesModal, setShowNoCoursesModal] = useState(false);
  const [showNoProfileModal, setShowNoProfileModal] = useState(false);
  const [isSavingCourses, setIsSavingCourses] = useState(false);

  const gradePoints: GradePoint[] = [
    { grade: "A", points: 5.0 },
    { grade: "B+", points: 4.0 },
    { grade: "B", points: 3.0 },
    { grade: "C", points: 2.0 },
    { grade: "D", points: 1.0 },
    { grade: "E", points: 0.0 },
    { grade: "F", points: 0.0 },
  ];


  const loadCoursesFromWorkplace = useCallback(async (selection: Selection) => {
    setIsLoading(true);
    try {
      // Get courses from Workplace selection stored in sessionStorage
      const workplaceCoursesData = sessionStorage.getItem("workplaceCourses");
      
      if (workplaceCoursesData) {
        const workplaceCourses = JSON.parse(workplaceCoursesData);
        
        if (workplaceCourses.length > 0) {
          // Convert workplace courses to the format expected by GPA calculator
          const convertedCourses = workplaceCourses.map((course: WorkplaceCourse) => ({
            id: course.id,
            code: course.code,
            name: course.name,
            credits: course.credits || course.credits || 3, // Default to 3 credits if not specified
            academic_year_info: {
              program_name: selection.programName,
              year: selection.academicYear || 1,
              program_id: parseInt(selection.programId)
            },
            is_elective: course.type === 'elective',
            optional: course.type === 'elective',
            isEdited: false,
            isAdded: false
          }));
          
          setOriginalCourses(convertedCourses);
          setHasEdits(false);

          // Initialize grades
          const savedGrades = sessionStorage.getItem("courseGrades");
          const initialGrades = convertedCourses.map(course => {
            const existingGrade = savedGrades ? JSON.parse(savedGrades).find((g: GradeEntry) => g.courseId === course.id) : null;
            return {
              courseId: course.id,
              grade: existingGrade?.grade || "A"
            };
          });
          setGrades(initialGrades);
          sessionStorage.setItem("courseGrades", JSON.stringify(initialGrades));
          
          console.log("Loaded courses from Workplace:", convertedCourses);
        } else {
          // No courses found in workplace data
          toast({
            title: "No Courses Found",
            description: "Please add some courses in the Workplace first",
            variant: "destructive"
          });
          navigate("/workplace");
        }
      } else {
        // No workplace courses data found
        toast({
          title: "No Course Selection",
          description: "Please complete your course selection in the Workplace first",
          variant: "destructive"
        });
        navigate("/workplace");
      }

    } catch (error) {
      console.error("Error loading courses:", error);
      toast({
        title: "Error Loading Courses",
        description: "Please complete your course selection in the Workplace first",
        variant: "destructive"
      });
      navigate("/workplace");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const resp = await api.get('/students/data/');
        const profile = resp.data;

        if (!profile) {
          setShowNoProfileModal(true);
          setOriginalCourses([]);
          setGrades([]);
          return;
        }

        const selection: Selection = {
          programId: profile.program.id,
          programName: profile.program.name,
          academicYearId: "1",
          academicYear: profile.year,
          semester: profile.semester,
          containsElectives: (profile.courses || []).some((c: { type: 'core' | 'elective' }) => c.type === 'elective'),
          coursesConfirmed: true
        };
        setSelection(selection);

        const profileCourses = (profile.courses || []) as Array<{
          id: string;
          code: string;
          name: string;
          credits: number;
          type: 'core' | 'elective';
          semester: number;
          year: number;
        }>;
        if (profileCourses.length === 0) {
          setShowNoCoursesModal(true);
          setOriginalCourses([]);
          setGrades([]);
          return;
        }

        const convertedCourses: Course[] = profileCourses.map((course) => ({
          id: course.id,
          code: course.code,
          name: course.name,
          credits: course.credits,
          type: course.type,
          semester: course.semester,
          year: course.year,
          program: profile.program.id,
          program_name: profile.program.name
        }));
        setOriginalCourses(convertedCourses);

        const gradesData: GradeEntry[] = convertedCourses.map(course => ({
          courseId: course.id,
          grade: "A"
        }));
        setGrades(gradesData);

        if (gpaData) {
          setGpa(gpaData.gpa);
        }
      } catch (error) {
        console.error('Error fetching student profile for GPA:', error);
        // Show a soft prompt to setup profile instead of navigating away
        setShowNoProfileModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate, toast, gpaData]);

  const handleSaveEdits = async (editedCourses: Course[]) => {
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

      console.log('Saving courses from GPA Calculator:', {
        url: '/api/students/courses/batch/',
        method: 'POST',
        body: { courses: formattedCourses }
      });

      // Save to backend
      await academicApi.saveCoursesBatch(formattedCourses);

      // Update local state
      setOriginalCourses(editedCourses);
      
      // Update grades for new courses
      const updatedGrades = editedCourses.map(course => {
        const existingGrade = grades.find(g => g.courseId === course.id);
        return {
          courseId: course.id,
          grade: existingGrade?.grade || "A"
        };
      });
      setGrades(updatedGrades);
      setGpa(null);

      toast({
        title: "Courses Saved!",
        description: "Your course changes have been saved successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error saving course edits:", error);
      toast({
        title: "Save Issue",
        description: "Failed to save course changes. Please try again.",
        variant: "warning"
      });
    } finally {
      setIsSavingCourses(false);
    }
  };

  const handleGradeChange = (courseId: string, grade: string) => {
    // Update local state only - no backend communication
    setGrades(prevGrades => {
      const newGrades = prevGrades.map(g =>
        g.courseId === courseId ? { ...g, grade } : g
      );
      return newGrades;
    });
    setGpa(null); // Reset GPA so user can recalculate
  };

  const calculateGpa = () => {
    setIsCalculating(true);
    try {
      // Local GPA calculation
      let totalPoints = 0;
      let totalCredits = 0;
      
      originalCourses.forEach(course => {
        const gradeEntry = grades.find(g => g.courseId === course.id);
        if (gradeEntry) {
          const gradePoint = gradePoints.find(gp => gp.grade === gradeEntry.grade);
          if (gradePoint) {
            totalPoints += gradePoint.points * course.credits;
            totalCredits += course.credits;
          }
        }
      });
      
      const calculatedGpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
      setGpa(calculatedGpa);
      
      toast({
        title: "GPA Calculated!",
        description: `Your GPA is ${calculatedGpa.toFixed(2)}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error calculating GPA:", error);
      toast({
        title: "Calculation Issue",
        description: "Failed to calculate GPA. Please try again.",
        variant: "warning"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const generateTargetGrades = () => {
    if (!targetGpa || parseFloat(targetGpa) < 0 || parseFloat(targetGpa) > 5) {
      toast({
        title: "Invalid Target GPA",
        description: "Please enter a valid GPA between 0.0 and 5.0",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingGrades(true);
    try {
      const targetGpaValue = parseFloat(targetGpa);
      
      // Improved target grade generation algorithm
      const totalCredits = originalCourses.reduce((sum, course) => sum + course.credits, 0);
      const totalPointsNeeded = targetGpaValue * totalCredits;
      
      // Sort courses by credits (descending) for better distribution
      const sortedCourses = [...originalCourses].sort((a, b) => b.credits - a.credits);
      
      const newGrades: GradeEntry[] = [];
      let remainingPoints = totalPointsNeeded;
      let remainingCredits = totalCredits;
      
      for (let i = 0; i < sortedCourses.length; i++) {
        const course = sortedCourses[i];
        const isLastCourse = i === sortedCourses.length - 1;
        
        let targetPointsPerCredit: number;
        
        if (isLastCourse) {
          // For the last course, use all remaining points
          targetPointsPerCredit = remainingPoints / course.credits;
        } else {
          // For other courses, calculate based on remaining points and credits
          const remainingCourses = sortedCourses.length - i;
          const averagePointsPerCredit = remainingPoints / remainingCredits;
          
          // Add some variation to make it more realistic
          const variation = (Math.random() - 0.5) * 0.5; // ±0.25 variation
          targetPointsPerCredit = Math.max(0, Math.min(5, averagePointsPerCredit + variation));
        }
        
        // Find the closest grade to the target points per credit
        let bestGrade = "A";
        let bestDiff = Math.abs(5.0 - targetPointsPerCredit);
        
        gradePoints.forEach(gp => {
          const diff = Math.abs(gp.points - targetPointsPerCredit);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestGrade = gp.grade;
          }
        });
        
        const gradePointsValue = gradePoints.find(gp => gp.grade === bestGrade)?.points || 0;
        const coursePoints = gradePointsValue * course.credits;
        
        newGrades.push({
          courseId: course.id,
          grade: bestGrade
        });
        
        remainingPoints -= coursePoints;
        remainingCredits -= course.credits;
      }
      
      setGrades(newGrades);
      setGpa(null);

      // Auto-scroll to the grades section
      setTimeout(() => {
        const gradesSection = document.querySelector('[data-tab="target"] .space-y-3:last-child');
        if (gradesSection) {
          gradesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

      toast({
        title: "Grades Generated!",
        description: `Target grades generated for GPA ${targetGpa}`,
        variant: "default"
      });

    } catch (error) {
      console.error("Error generating grades:", error);
      toast({
        title: "Generation Error",
        description: "Failed to generate grades. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingGrades(false);
    }
  };

  const resetGradesHandler = () => {
    try {
      // Reset all grades to A locally
      const resetGrades: GradeEntry[] = originalCourses.map(course => ({
        courseId: course.id,
        grade: "A"
      }));
      
      setGrades(resetGrades);
      setGpa(null);
      setTargetGpa("");
      
      toast({
        title: "Grades Reset",
        description: "All grades have been reset to A",
        variant: "default"
      });
    } catch (error) {
      console.error("Error resetting grades:", error);
      toast({
        title: "Reset Error",
        description: "Failed to reset grades. Please try again.",
        variant: "destructive"
      });
    }
  };

  const confirmCourses = () => {
    const updatedSelection = {...selection!, coursesConfirmed: true};
    sessionStorage.setItem("selection", JSON.stringify(updatedSelection));
    setSelection(updatedSelection);
    setShowNotification(false);

    toast({
      title: "Courses Confirmed",
      description: "Thank you for confirming the courses.",
      variant: "default"
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };


  // Avoid a local full-screen loader to prevent double overlays; allow page to render progressively

  // Friendly modal when there are no courses
  if (showNoCoursesModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center shadow-xl border border-gray-200">
          <div className="p-4 bg-caluu-blue rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Courses Found</h2>
          <p className="text-gray-600 mb-6">You do not have any enrolled courses yet. Add or confirm your courses in Workplace to use the GPA calculator.</p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => navigate('/workplace')} className="bg-caluu-blue hover:bg-caluu-blue-light text-white">
              Go to Workplace
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="border-gray-300">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Friendly modal when there is no profile at all
  if (showNoProfileModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center shadow-xl border border-gray-200">
          <div className="p-4 bg-caluu-blue rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Needed</h2>
          <p className="text-gray-600 mb-6">Set up your university, program, year and semester in Workplace to enable GPA calculations.</p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => navigate('/workplace')} className="bg-caluu-blue hover:bg-caluu-blue-light text-white">
              Go to Workplace
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="border-gray-300">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>GPA Calculator - Caluu Academic Assistant</title>
        <meta name="description" content="Calculate your GPA and CGPA with our advanced calculator. Track your academic performance, set target grades, and plan your academic journey across Tanzanian universities." />
        <meta name="keywords" content="GPA calculator, CGPA calculator, grade point average, academic performance, Tanzanian universities, grade tracking, academic planning" />
        <meta property="og:title" content="GPA Calculator - Caluu Academic Assistant" />
        <meta property="og:description" content="Calculate your GPA and CGPA with our advanced calculator. Track your academic performance and plan your academic journey." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/calculator`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GPA Calculator - Caluu Academic Assistant" />
        <meta name="twitter:description" content="Calculate your GPA and CGPA with our advanced calculator. Track your academic performance." />
        <link rel="canonical" href={`${window.location.origin}/calculator`} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 lg:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-4">
            <div className="p-3 bg-caluu-blue rounded-full shadow-lg">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">GPA Calculator</h1>
              <p className="text-gray-600">Calculate your GPA or set target grades</p>
            </div>
          </div>
          
  
        </motion.div>

        {showNotification && selection && !selection.coursesConfirmed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-caluu-blue text-white rounded-lg p-4 mb-6 shadow-lg"
          >
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium mb-2">Welcome to our updated GPA portal!</p>
                <p className="text-sm opacity-90 mb-3">Please review the course list and confirm everything is correct.</p>
                <div className="flex gap-2">
              <Button
                onClick={confirmCourses}
                variant="outline"
                    size="sm"
                    className="bg-white text-caluu-blue hover:bg-gray-50 border-white"
              >
                Confirm
              </Button>
              <Button
                onClick={() => setShowFeedbackModal(true)}
                variant="outline"
                    size="sm"
                    className="bg-white/20 text-white hover:bg-white/30 border-white/30"
              >
                Report Issue
              </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {originalCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-12">
                <TabsTrigger value="calculate" className="flex items-center gap-2 text-sm font-medium">
                  <Calculator className="w-4 h-4" />
                  <span className="hidden sm:inline">Calculate GPA</span>
                  <span className="sm:hidden">Calculate</span>
                </TabsTrigger>
                <TabsTrigger value="target" className="flex items-center gap-2 text-sm font-medium">
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Target GPA</span>
                  <span className="sm:hidden">Target</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calculate" className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Enter Your Grades</h2>
                   </div>
                  <div className="flex gap-2 mt-4 sm:mt-0">
                    <Button
                      onClick={() => setShowEditModal(true)}
                      variant="outline"
                      className="flex items-center gap-2 btn-white-secondary"
                      disabled={isSavingCourses}
                    >
                      {isSavingCourses ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          Edit Courses
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={resetGradesHandler}
                      variant="outline"
                      className="flex items-center gap-2 btn-white-outline"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {originalCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-gray-200 rounded-md overflow-hidden hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center py-2 px-3 border-b border-gray-100">
                        <div className="w-16 shrink-0">
                          <span className="text-xs font-semibold text-blue-600">{course.code}</span>
                        </div>
                        <div className="flex-1 min-w-0 px-2">
                          <span className="text-xs text-gray-700 truncate block">{course.name}</span>
                        </div>
                        <div className="w-12 text-center shrink-0">
                          <span className="text-xs text-gray-500">{course.credits}</span>
                        </div>
                        <div className="w-16 shrink-0 ml-2">
                          <Select 
                            value={grades.find(g => g.courseId === course.id)?.grade || "A"}
                            onValueChange={(value) => handleGradeChange(course.id, value)}
                          >
                            <SelectTrigger className="w-full h-6 px-2 text-xs border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="min-w-[60px]">
                              {gradePoints.map(gp => (
                                <SelectItem key={gp.grade} value={gp.grade} className="text-xs">
                                  {gp.grade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={calculateGpa}
                  disabled={isCalculating}
                    className="flex-1 btn-white-primary py-3 text-lg font-medium"
                  >
                    {isCalculating ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-5 h-5 mr-2" />
                        Calculate GPA
                      </>
                    )}
                </Button>

                {gpa !== null && (
                  <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6 text-center min-w-[200px]"
                    >
                      <div className="flex items-center justify-center mb-2">
                        <Award className="w-6 h-6 mr-2" />
                        <span className="text-sm font-medium">Your GPA</span>
                      </div>
                      <div className="text-3xl font-bold">{gpa.toFixed(2)}</div>
                      <div className="text-sm opacity-90">
                        {gpa >= 4.5 ? "Excellent!" : gpa >= 3.5 ? "Good!" : gpa >= 2.5 ? "Average" : "Needs Improvement"}
                    </div>
                  </motion.div>
                )}
                </div>
              </TabsContent>

              <TabsContent value="target" className="p-6">
                <div className="text-center mb-6">
                  
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Set Your Target GPA</h2>
                </div>

                {/* Target GPA Input Section */}
                <div className="max-w-lg mx-auto mb-8">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <Label htmlFor="target-gpa" className="text-sm font-medium text-gray-700 mb-3 block">
                      Target GPA (0.0 - 5.0)
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        id="target-gpa"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={targetGpa}
                        onChange={(e) => setTargetGpa(e.target.value)}
                        placeholder="e.g., 4.0"
                        className="text-center text-lg font-medium border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <Button
                        onClick={generateTargetGrades}
                        disabled={isGeneratingGrades || !targetGpa}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingGrades ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Generate Grades
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Course Cards Section */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Course Grades</h3>
                      <p className="text-gray-600 text-sm">Generated grades to achieve your target GPA</p>
                    </div>
                    <div className="flex gap-2 mt-4 sm:mt-0">
                      <Button
                        onClick={() => setShowEditModal(true)}
                        variant="outline"
                        className="flex items-center gap-2 btn-white-secondary"
                        disabled={isSavingCourses}
                      >
                        {isSavingCourses ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4" />
                            Edit Courses
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={resetGradesHandler}
                        variant="outline"
                        className="flex items-center gap-2 btn-white-outline"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reset
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {originalCourses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-md overflow-hidden hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center py-2 px-3 border-b border-gray-100">
                          <div className="w-16 shrink-0">
                            <span className="text-xs font-semibold text-blue-600">{course.code}</span>
                          </div>
                          <div className="flex-1 min-w-0 px-2">
                            <span className="text-xs text-gray-700 truncate block">{course.name}</span>
                          </div>
                          <div className="w-12 text-center shrink-0">
                            <span className="text-xs text-gray-500">{course.credits}</span>
                          </div>
                          <div className="w-16 shrink-0 ml-2">
                            <Select 
                              value={grades.find(g => g.courseId === course.id)?.grade || "A"}
                              onValueChange={(value) => handleGradeChange(course.id, value)}
                            >
                              <SelectTrigger className="w-full h-6 px-2 text-xs border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="min-w-[60px]">
                                {gradePoints.map(gp => (
                                  <SelectItem key={gp.grade} value={gp.grade} className="text-xs">
                                    {gp.grade}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Calculate and Display GPA */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={calculateGpa}
                    disabled={isCalculating}
                    className="flex-1 btn-white-primary py-3 text-lg font-medium"
                  >
                    {isCalculating ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-5 h-5 mr-2" />
                        Calculate Current GPA
                      </>
                    )}
                  </Button>

                  {gpa !== null && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6 text-center min-w-[200px]"
                    >
                      <div className="flex items-center justify-center mb-2">
                        <Award className="w-6 h-6 mr-2" />
                        <span className="text-sm font-medium">Current GPA</span>
                      </div>
                      <div className="text-3xl font-bold">{gpa.toFixed(2)}</div>
                      <div className="text-sm opacity-90">
                        {gpa >= 4.5 ? "Excellent!" : gpa >= 3.5 ? "Good!" : gpa >= 2.5 ? "Average" : "Needs Improvement"}
                      </div>
                    </motion.div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

      {/* Course Edit Modal */}
        <CourseEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          courses={originalCourses}
          onSave={handleSaveEdits}
          programName={selection?.programName || ''}
          year={selection?.academicYear || 1}
          semester={selection?.semester || 1}
        />

      {/* Feedback Modal */}
      {showFeedbackModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Report an Issue</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="issue">Issue Type</Label>
              <select
                    id="issue"
                value={feedbackIssue}
                onChange={(e) => setFeedbackIssue(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select an issue</option>
                    <option value="missing-course">Missing Course</option>
                    <option value="wrong-credits">Wrong Credits</option>
                    <option value="wrong-course">Wrong Course</option>
                    <option value="other">Other</option>
              </select>
            </div>
                <div>
                  <Label htmlFor="description">Description</Label>
              <textarea
                    id="description"
                value={feedbackDescription}
                onChange={(e) => setFeedbackDescription(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Please describe the issue..."
                  />
            </div>
                <div className="flex gap-2">
              <Button
                    onClick={() => setShowFeedbackModal(false)}
                variant="outline"
                    className="flex-1"
              >
                Cancel
              </Button>
              <Button
                    onClick={() => {/* Handle feedback submission */}}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                    Submit
              </Button>
                </div>
              </div>
            </div>
        </div>
      )}
      </div>
    </div>
    </>
   );
};

export default GpaCalculator;