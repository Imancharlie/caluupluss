import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, ChevronLeft, Edit } from "lucide-react";
import axios from "axios";
import CourseEditModal from "@/components/CourseEditModal"; // Import the modal
import {
  loadCourseEdits,
  saveCourseEdits,
  mergeCourses,
  coursesToEdits,
  getEditStatistics
} from "@/utils/courseEditUtils"; // Import utilities

const API_BASE_URL = "https://caluu.pythonanywhere.com/api";

interface AcademicYearInfo {
  program_name: string;
  year: number;
  program_id: number;
}

interface ApiCourse {
  id: string;
  code: string;
  name: string;
  credit_hours: string; // From API, it might be a string
  academic_year_info: AcademicYearInfo;
  optional: boolean;
  semester: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  credit_hours: number; // Stored as number in frontend state
  academic_year_info: AcademicYearInfo;
  is_elective?: boolean;
  isEdited?: boolean; // Added for modal logic
  isAdded?: boolean; // Added for modal logic
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

const GpaCalculator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selection, setSelection] = useState<Selection | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [originalCourses, setOriginalCourses] = useState<Course[]>([]); // Store original API courses
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [gpa, setGpa] = useState<number | null>(null);
  const [selectedElectives, setSelectedElectives] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackIssue, setFeedbackIssue] = useState("");
  const [feedbackDescription, setFeedbackDescription] = useState("");

  const [showNotification, setShowNotification] = useState(true);

  // New state for edit functionality
  const [showEditModal, setShowEditModal] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);

  const gradePoints: GradePoint[] = [
    { grade: "A", points: 5.0 },
    { grade: "B+", points: 4.0 },
    { grade: "B", points: 3.0 },
    { grade: "C", points: 2.0 },
    { grade: "D", points: 1.0 },
    { grade: "E", points: 0.0 },
    { grade: "F", points: 0.0 }, // Ensure 'F' is also covered
  ];

  useEffect(() => {
    const selectionData = sessionStorage.getItem("selection");

    if (!selectionData) {
      toast({
        title: "No Selection",
        description: "Please select your academic details first",
        variant: "destructive"
      });
      navigate("/selection");
      return;
    }

    const parsedSelection = JSON.parse(selectionData);
    console.log('Loaded selection:', parsedSelection);
    setSelection(parsedSelection);

    // Load selected electives
    const electivesData = sessionStorage.getItem("selectedElectives");
    if (electivesData) {
      setSelectedElectives(JSON.parse(electivesData));
    }

    // Only show the notification if courses are not confirmed
    if (parsedSelection.coursesConfirmed === false) {
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }

    fetchCourses(parsedSelection);
  }, [navigate, toast]);

  const fetchCourses = async (selection: Selection) => {
    setIsLoading(true);
    try {
      // First fetch core courses
      const coreParams = {
        program_id: selection.programId,
        academic_year_id: selection.academicYearId,
        semester: selection.semester.toString(),
        optional: "false"
      };

      const coreUrl = `${API_BASE_URL}/courses/?${new URLSearchParams(coreParams).toString()}`;
      console.log('Fetching core courses from:', coreUrl);

      const coreResponse = await axios.get<ApiCourse[]>(coreUrl);
      console.log('Core courses response:', coreResponse.data);

      // Update program name from the first course's academic_year_info
      if (coreResponse.data.length > 0 && coreResponse.data[0].academic_year_info) {
        const programName = coreResponse.data[0].academic_year_info.program_name;
        const updatedSelection = { ...selection, programName };
        setSelection(updatedSelection);
        sessionStorage.setItem("selection", JSON.stringify(updatedSelection));
      }

      // Then fetch elective courses
      const electiveParams = {
        program_id: selection.programId,
        academic_year_id: selection.academicYearId,
        semester: selection.semester.toString(),
        optional: "true"
      };

      const electiveUrl = `${API_BASE_URL}/select-electives/?${new URLSearchParams(electiveParams).toString()}`;
      console.log('Fetching elective courses from:', electiveUrl);

      const electiveResponse = await axios.get<ApiCourse[]>(electiveUrl);
      console.log('Elective courses response:', electiveResponse.data);

      // Get selected electives from session storage
      const selectedElectivesData = sessionStorage.getItem("selectedElectives");
      const selectedElectiveIds = selectedElectivesData ? JSON.parse(selectedElectivesData) : [];

      // Filter elective courses to only include selected ones and format them
      const selectedElectiveCourses = electiveResponse.data
        .filter((course: ApiCourse) => selectedElectiveIds.includes(course.id))
        .map((course: ApiCourse): Course => ({
          id: course.id,
          code: course.code,
          name: course.name,
          credit_hours: parseFloat(course.credit_hours),
          academic_year_info: course.academic_year_info,
          is_elective: true
        }));

      // Format core courses
      const formattedCoreCourses = coreResponse.data.map((course: ApiCourse): Course => ({
        id: course.id,
        code: course.code,
        name: course.name,
        credit_hours: parseFloat(course.credit_hours),
        academic_year_info: course.academic_year_info
      }));

      // Combine core courses with selected elective courses
      const apiCourses = [...formattedCoreCourses, ...selectedElectiveCourses];
      setOriginalCourses(apiCourses); // Store original courses

      // Load and merge with local edits
      // Use 'true' for preferBackend if you want backend to override local changes on initial load
      // For GPA calculation, you want to apply *current* local edits, so merge appropriately.
      const localEdits = await loadCourseEdits(selection, false);
      const mergedCourses = mergeCourses(apiCourses, localEdits);

      setCourses(mergedCourses);
      setHasEdits(Object.keys(localEdits).length > 0);

      // Initialize grades with 'A' as default for all courses
      // Try to load existing grades from session storage first
      const savedGrades = sessionStorage.getItem("courseGrades");
      const initialGrades = mergedCourses.map(course => {
        const existingGrade = savedGrades ? JSON.parse(savedGrades).find((g: GradeEntry) => g.courseId === course.id) : null;
        return {
          courseId: course.id,
          grade: existingGrade?.grade || "A"
        };
      });
      setGrades(initialGrades);

      // Save initial grades to session storage (this will overwrite if grades were already saved)
      sessionStorage.setItem("courseGrades", JSON.stringify(initialGrades));

    } catch (error) {
      console.error("Error fetching courses:", error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
      }
      toast({
        title: "Error",
        description: `Failed to fetch courses: ${axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // New function to handle course edits
  const handleSaveEdits = async (editedCourses: Course[]) => {
    try {
      // Convert edited courses to edits format
      const edits = coursesToEdits(editedCourses, originalCourses);

      // Save edits (hybrid approach - localStorage + optional backend sync)
      const saveResult = await saveCourseEdits(selection, edits, false); // syncToBackend = false for now

      if (saveResult.local) {
        // Update the courses state
        setCourses(editedCourses);
        setHasEdits(Object.keys(edits).length > 0);

        // Update grades to match new course list
        // Preserve existing grades for courses that are still present
        const updatedGrades = editedCourses.map(course => {
          const existingGrade = grades.find(g => g.courseId === course.id);
          return {
            courseId: course.id,
            grade: existingGrade?.grade || "A"
          };
        });
        setGrades(updatedGrades);
        sessionStorage.setItem("courseGrades", JSON.stringify(updatedGrades));

        // Clear existing GPA calculation, forcing a recalculation with new credits
        setGpa(null);
        setShowEditModal(false); // Close the modal on successful save

        const stats = getEditStatistics(editedCourses, originalCourses);
        toast({
          title: "Changes Saved",
          description: `${stats.edited} edited, ${stats.added} added, ${stats.deleted} removed`,
          variant: "default"
        });
      } else {
        throw new Error("Failed to save changes locally");
      }
    } catch (error) {
      console.error("Error saving course edits:", error);
      toast({
        title: "Save Error",
        description: "Failed to save course edits. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGradeChange = (courseId: string, grade: string) => {
    setGrades(prevGrades => {
      const newGrades = prevGrades.map(g =>
        g.courseId === courseId ? { ...g, grade } : g
      );
      // Save to session storage
      sessionStorage.setItem("courseGrades", JSON.stringify(newGrades));
      return newGrades;
    });

    setGpa(null);
  };

  const calculateGpa = async () => {
    setIsCalculating(true);

    try {
      // Transform the data to match backend expectations
      // IMPORTANT: Include credit_hours from the `courses` state (which holds the edited courses)
      const coursesData = grades.map(entry => {
        const course = courses.find(c => c.id === entry.courseId);
        if (!course) {
          console.warn(`Course with ID ${entry.courseId} not found in current courses state.`);
          return null; // Skip if course data is missing
        }
        return {
          id: entry.courseId,
          grade: entry.grade,
          credit_hours: course.credit_hours // Use the credit_hours from the *current* `courses` state
        };
      }).filter(Boolean); // Filter out any null entries

      // Add a check to ensure coursesData is not empty after filtering
      if (coursesData.length === 0) {
        toast({
          title: "Calculation Error",
          description: "No valid courses with credit hours found for GPA calculation.",
          variant: "destructive"
        });
        setIsCalculating(false);
        return;
      }

      // Send data to backend for calculation
      const response = await axios.post(`${API_BASE_URL}/calculate-gpa/`, {
        courses: coursesData, // This now includes credit_hours
        program_id: selection?.programId,
        academic_year: selection?.academicYear,
        save_data: true // This will save the GPA data
      });

      const calculatedGpa = response.data.gpa;
      setGpa(calculatedGpa);

      toast({
        title: "GPA Calculated",
        description: `Your GPA is ${calculatedGpa.toFixed(2)}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error calculating GPA:", error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
      }
      toast({
        title: "Calculation Error",
        description: error.response?.data?.error || "There was an error calculating your GPA. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const submitFeedback = async () => {
    if (!feedbackIssue) {
      toast({
        title: "Error",
        description: "Please select an issue type",
        variant: "destructive"
      });
      return;
    }

    if (!feedbackDescription) {
      toast({
        title: "Error",
        description: "Please provide a description of the issue",
        variant: "destructive"
      });
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/submit-feedback/`, {
        issue_type: feedbackIssue,
        description: feedbackDescription,
        program_id: selection?.programId,
        academic_year_id: selection?.academicYearId,
        semester: selection?.semester
      });

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
        variant: "default"
      });

      setShowFeedbackModal(false);
      setFeedbackIssue("");
      setFeedbackDescription("");
      setShowNotification(false);

      // Update the selection to mark courses as confirmed
      const updatedSelection = {...selection!, coursesConfirmed: true};
      sessionStorage.setItem("selection", JSON.stringify(updatedSelection));
      setSelection(updatedSelection);

    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive"
      });
    }
  };

  const confirmCourses = () => {
    // Update the selection to mark courses as confirmed
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

    return (
  <>
    <style>{`
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .animate-shimmer {
        animation: shimmer 3s infinite;
      }
      @keyframes glow-pulse {
        0%, 100% { 
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1);
        }
        50% { 
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.5), 0 0 50px rgba(59, 130, 246, 0.3);
        }
      }
      .glow-button {
        animation: glow-pulse 2s infinite;
      }
    `}</style>
    <div className="min-h-screen bg-caluu-blue-dark pb-12">
      <div className="container-app py-4 sm:py-8">
        {selection && courses.length > 0 && (
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 text-white mb-4 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-1">
              {courses[0]?.academic_year_info?.program_name || selection.programName}
            </h2>
            <div className="text-sm sm:text-base text-white/70">
              <p>Year {courses[0]?.academic_year_info?.year || selection.academicYear}</p>
              <p>Semester {selection.semester}</p>
              {hasEdits && (
                <p className="text-yellow-300 text-xs mt-1">
                  ⚠ You have custom course edits applied
                </p>
              )}
            </div>
          </motion.div>
        )}

        {showNotification && selection && !selection.coursesConfirmed && (
          <motion.div
            className="bg-caluu-blue rounded-xl p-3 sm:p-4 mb-4 sm:mb-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-start sm:items-center text-white">
              <Check size={18} className="mr-2 flex-shrink-0 mt-1 sm:mt-0" />
              <p className="text-sm sm:text-base">Welcome to our updated GPA portal! Please review the course list and confirm everything is correct.</p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={confirmCourses}
                variant="outline"
                className="bg-white text-caluu-blue hover:bg-white/90 text-sm sm:text-base"
              >
                Confirm
              </Button>
              <Button
                onClick={() => setShowFeedbackModal(true)}
                variant="outline"
                className="bg-white/20 text-white hover:bg-white/30 border-white/30 text-sm sm:text-base"
              >
                Report Issue
              </Button>
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="p-6 sm:p-12 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-6 sm:h-8 bg-gray-200 rounded w-3/4 mb-4 sm:mb-6"></div>
                <div className="h-24 sm:h-32 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ) : courses.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="p-3 sm:p-6"
            >
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-caluu-blue-dark">
                    Enter Your Grades
                  </h2>
                  <button
  onClick={() => setShowEditModal(true)}
  className="glow-button relative flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-caluu-blue to-blue-600 hover:from-blue-600 hover:to-caluu-blue rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:animate-none border-2 border-transparent hover:border-white/20"
>
  <Edit size={16} className="drop-shadow-sm" />
  <span className="drop-shadow-sm">Edit Courses</span>
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg animate-shimmer"></div>
</button>
                </div>
              </motion.div>

              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full min-w-[300px]">
                  <thead>
                    <motion.tr variants={itemVariants}>
                      <th className="text-left pb-2 sm:pb-4 pl-2 text-gray-600 text-sm sm:text-base w-[60%] sm:w-[60%]">Course</th>
                      <th className="text-center pb-2 sm:pb-4 text-gray-600 text-sm sm:text-base w-[10%] sm:w-[10%]">Credits</th>
                      <th className="text-center pb-2 sm:pb-4 text-gray-600 text-sm sm:text-base w-[30%] sm:w-[30%]">Grade</th>
                    </motion.tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {courses.map((course, index) => (
                      <motion.tr
                        key={course.id}
                        variants={itemVariants}
                        custom={index}
                        className={`hover:bg-gray-50 transition-colors ${course.is_elective ? 'bg-blue-50' : ''}`}
                      >
                        <td className="py-2 sm:py-4 pl-2 pr-1">
                          <div className="font-medium text-gray-900 text-sm sm:text-base">
                            {course.code}
                            {course.is_elective && <span className="ml-1 sm:ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">Elective</span>}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 leading-tight">{course.name}</div>
                        </td>
                        <td className="py-2 sm:py-4 text-center px-1">
                          <div className="bg-caluu-blue/10 text-caluu-blue font-semibold px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full inline-block text-sm sm:text-base">
                            {course.credit_hours}
                          </div>
                        </td>
                        <td className="py-2 sm:py-4 text-center px-1">
                          <select
                            value={grades.find(g => g.courseId === course.id)?.grade || "A"}
                            onChange={(e) => handleGradeChange(course.id, e.target.value)}
                            className="form-select w-full max-w-[90px] sm:max-w-[100px] mx-auto text-center bg-white border-gray-300 focus:border-caluu-blue focus:ring-caluu-blue text-sm sm:text-base rounded-md"
                          >
                            {gradePoints.map(gp => (
                              <option key={gp.grade} value={gp.grade}>
                                {gp.grade}
                              </option>
                            ))}
                          </select>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <motion.div
                variants={itemVariants}
                className="mt-6 sm:mt-8 flex flex-col items-center"
              >
                <Button
                  onClick={calculateGpa}
                  disabled={isCalculating}
                  className="w-full max-w-xs py-4 sm:py-6 text-base sm:text-lg bg-caluu-blue hover:bg-caluu-blue-light transition-all duration-300"
                >
                  {isCalculating ? "Calculating..." : "Calculate GPA"}
                </Button>

                {gpa !== null && (
                  <motion.div
                    className="mt-4 sm:mt-6 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="bg-caluu-blue-dark text-white py-2 sm:py-3 px-6 sm:px-8 rounded-lg inline-block">
                      <p className="text-xs sm:text-sm uppercase tracking-wider mb-0.5 sm:mb-1 text-white/70">Your GPA</p>
                      <p className="text-2xl sm:text-3xl font-bold">{gpa.toFixed(2)}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>

            </motion.div>

          ) : (
            <div className="p-6 sm:p-12 text-center">
              <div className="text-caluu-blue-dark">
                <AlertTriangle size={36} className="mx-auto mb-3 sm:mb-4 text-amber-500" />
                <h2 className="text-lg sm:text-xl font-semibold mb-2">No Courses Available</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  It looks like courses haven't been added yet for this selection.
                </p>
                <Button
                  onClick={() => navigate("/selection")}
                  className="bg-caluu-blue hover:bg-caluu-blue-light text-sm sm:text-base"
                >
                  Go Back to Selection
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Edit Modal */}
      {showEditModal && selection && ( // Ensure selection is not null when opening modal
        <CourseEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          courses={courses}
          originalCourses={originalCourses}
          onSave={handleSaveEdits}
          selection={{
            programId: selection.programId,
            academicYear: selection.academicYear,
            semester: selection.semester,
          }}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-caluu-blue-dark">Report an Issue</h2>

            <div className="mb-3 sm:mb-4">
              <label htmlFor="issueCategory" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Select the issue:
              </label>
              <select
                id="issueCategory"
                value={feedbackIssue}
                onChange={(e) => setFeedbackIssue(e.target.value)}
                className="form-select text-sm sm:text-base w-full"
              >
                <option value="">-- Choose an issue --</option>
                <option value="incomplete">Incomplete Courses</option>
                <option value="wrong_credit">Wrong Credit</option>
                <option value="typing_error">Typing Error</option>
              </select>
            </div>

            <div className="mb-4 sm:mb-6">
              <label htmlFor="issueDescription" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Please describe the issue:
              </label>
              <textarea
                id="issueDescription"
                value={feedbackDescription}
                onChange={(e) => setFeedbackDescription(e.target.value)}
                placeholder="Additional details..."
                className="form-input min-h-[80px] sm:min-h-[100px] text-sm sm:text-base w-full"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 sm:space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowFeedbackModal(false)}
                className="text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={submitFeedback}
                className="bg-caluu-blue hover:bg-caluu-blue-light text-sm sm:text-base"
              >
                Submit Feedback
              </Button>
            </div>

          </motion.div>
        </div>
      )}

      {/* Add copyright section */}
      <motion.div
        className="mt-4 text-center text-white/60 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <p>&copy; 2025 Kodin Softwares |{" "}
          <Button
            onClick={() => navigate("/selection")}
            className="text-white hover:underline bg-transparent p-0 h-auto"
            variant="ghost"
          >
            back
          </Button>
          {" "} | {" "}
          <button
            onClick={() => window.open('https://imancharlie.pythonanywhere.com', '_blank')}
            className="text-white hover:underline"
          >
            Visit us
          </button>
        </p>
      </motion.div>
    </div>
    </>  // Add the closing fragment here
   );
};

export default GpaCalculator;