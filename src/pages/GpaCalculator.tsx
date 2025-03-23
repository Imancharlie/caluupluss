
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, ChevronLeft } from "lucide-react";
import axios from "axios";

const API_BASE_URL = "https://caluu.pythonanywhere.com/api";

interface Course {
  id: string;
  code: string;
  name: string;
  creditHours: number;
}

interface GradeEntry {
  courseId: string;
  grade: string;
}

interface GradePoint {
  grade: string;
  points: number;
}

const GpaCalculator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selection, setSelection] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [gpa, setGpa] = useState<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackIssue, setFeedbackIssue] = useState("");
  const [feedbackDescription, setFeedbackDescription] = useState("");
  
  const [showNotification, setShowNotification] = useState(true);

  const gradePoints: GradePoint[] = [
    { grade: "A", points: 5.0 },
    { grade: "B+", points: 4.5 },
    { grade: "B", points: 4.0 },
    { grade: "C+", points: 3.5 },
    { grade: "C", points: 3.0 },
    { grade: "D+", points: 2.5 },
    { grade: "D", points: 2.0 },
    { grade: "F", points: 0.0 }
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
    setSelection(parsedSelection);
    
    // Only show the notification if courses are not confirmed
    if (parsedSelection.coursesConfirmed === false) {
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
    
    fetchCourses(parsedSelection);
  }, [navigate, toast]);

  const fetchCourses = async (selection: any) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/`, {
        params: {
          program_id: selection.programId,
          academic_year: selection.academicYear,
          semester: selection.semester
        }
      });
      
      const fetchedCourses = response.data;
      setCourses(fetchedCourses);
      
      setGrades(fetchedCourses.map((course: Course) => ({
        courseId: course.id,
        grade: ""
      })));
      
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeChange = (courseId: string, grade: string) => {
    setGrades(prevGrades => 
      prevGrades.map(entry => 
        entry.courseId === courseId 
          ? { ...entry, grade } 
          : entry
      )
    );
    
    setGpa(null);
  };

  const calculateGpa = async () => {
    const missingGrades = grades.some(entry => !entry.grade);
    
    if (missingGrades) {
      toast({
        title: "Missing Grades",
        description: "Please select a grade for all courses",
        variant: "destructive"
      });
      return;
    }
    
    setIsCalculating(true);
    
    try {
      // Transform the data to match backend expectations
      const coursesData = grades.map(entry => {
        const course = courses.find(c => c.id === entry.courseId);
        return {
          id: entry.courseId,
          grade: entry.grade,
          credit_hours: course?.creditHours
        };
      });
      
      // Update API call to send the data in the format backend expects
      const response = await axios.post(`${API_BASE_URL}/calculate-gpa/`, {
        courses: coursesData,
        program_id: selection.programId,
        academic_year: selection.academicYear
      });
      
      setGpa(response.data.gpa);
      
      toast({
        title: "GPA Calculated",
        description: `Your GPA is ${response.data.gpa}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error calculating GPA:", error);
      toast({
        title: "Calculation Error",
        description: "There was an error calculating your GPA. Please try again.",
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
        program_id: selection.programId,
        academic_year: selection.academicYear,
        semester: selection.semester
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
      const updatedSelection = {...selection, coursesConfirmed: true};
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
    const updatedSelection = {...selection, coursesConfirmed: true};
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
    <div className="min-h-screen bg-caluu-blue-dark pb-12">
      <motion.div 
        className="bg-white py-4 px-6 shadow-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-app flex items-center">
          <button 
            onClick={() => navigate("/selection")}
            className="flex items-center text-caluu-blue-dark hover:text-caluu-blue mr-4"
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
          
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-center text-caluu-blue-dark">
              GPA Calculator
            </h1>
          </div>
          
          <div className="w-20"></div>
        </div>
      </motion.div>

      <div className="container-app py-8">
        {selection && (
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-1">
              {selection.programName || "Selected Program"}
            </h2>
            <p className="text-white/70">
              Year {selection.academicYear} - Semester {selection.semester}
            </p>
          </motion.div>
        )}

        {showNotification && selection && !selection.coursesConfirmed && (
          <motion.div 
            className="bg-caluu-blue rounded-xl p-4 mb-8 shadow-lg flex items-center justify-between"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center text-white">
              <Check size={20} className="mr-2 flex-shrink-0" />
              <p>Welcome to our updated GPA portal! Please review the course list and confirm everything is correct.</p>
            </div>
            <div className="flex space-x-2 ml-4">
              <Button
                onClick={confirmCourses}
                variant="outline"
                className="bg-white text-caluu-blue hover:bg-white/90"
              >
                Confirm
              </Button>
              <Button
                onClick={() => setShowFeedbackModal(true)}
                variant="outline"
                className="bg-white/20 text-white hover:bg-white/30 border-white/30"
              >
                Report Issue
              </Button>
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="h-32 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ) : courses.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="p-6"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-xl font-semibold mb-6 text-caluu-blue-dark">
                  Enter Your Grades
                </h2>
              </motion.div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <motion.tr variants={itemVariants}>
                      <th className="text-left pb-4 pl-2 text-gray-600">Course Code</th>
                      <th className="text-left pb-4 text-gray-600">Course Name</th>
                      <th className="text-center pb-4 text-gray-600">Credit Hours</th>
                      <th className="text-center pb-4 text-gray-600">Grade</th>
                    </motion.tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {courses.map((course, index) => (
                      <motion.tr 
                        key={course.id}
                        variants={itemVariants}
                        custom={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 pl-2 font-medium text-gray-900">{course.code}</td>
                        <td className="py-4 text-gray-600">{course.name}</td>
                        <td className="py-4 text-center text-gray-600">{course.creditHours}</td>
                        <td className="py-4 text-center">
                          <select
                            value={grades.find(g => g.courseId === course.id)?.grade || ""}
                            onChange={(e) => handleGradeChange(course.id, e.target.value)}
                            className="form-select max-w-[100px] mx-auto text-center"
                          >
                            <option value="">Select</option>
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
                className="mt-8 flex flex-col items-center"
              >
                <Button
                  onClick={calculateGpa}
                  disabled={isCalculating}
                  className="w-full max-w-xs py-6 text-lg bg-caluu-blue hover:bg-caluu-blue-light transition-all duration-300"
                >
                  {isCalculating ? "Calculating..." : "Calculate GPA"}
                </Button>
                
                {gpa !== null && (
                  <motion.div 
                    className="mt-6 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="bg-caluu-blue-dark text-white py-3 px-8 rounded-lg inline-block">
                      <p className="text-sm uppercase tracking-wider mb-1 text-white/70">Your GPA</p>
                      <p className="text-3xl font-bold">{gpa.toFixed(2)}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-caluu-blue-dark">
                <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
                <h2 className="text-xl font-semibold mb-2">No Courses Available</h2>
                <p className="text-gray-600 mb-6">
                  It looks like courses haven't been added yet for this selection.
                </p>
                <Button
                  onClick={() => navigate("/selection")}
                  className="bg-caluu-blue hover:bg-caluu-blue-light"
                >
                  Go Back to Selection
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-caluu-blue-dark">Report an Issue</h2>
            
            <div className="mb-4">
              <label htmlFor="issueCategory" className="block text-sm font-medium text-gray-700 mb-1">
                Select the issue:
              </label>
              <select
                id="issueCategory"
                value={feedbackIssue}
                onChange={(e) => setFeedbackIssue(e.target.value)}
                className="form-select"
              >
                <option value="">-- Choose an issue --</option>
                <option value="incomplete">Incomplete Courses</option>
                <option value="wrong_credit">Wrong Credit</option>
                <option value="typing_error">Typing Error</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Please describe the issue:
              </label>
              <textarea
                id="issueDescription"
                value={feedbackDescription}
                onChange={(e) => setFeedbackDescription(e.target.value)}
                placeholder="Additional details..."
                className="form-input min-h-[100px]"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowFeedbackModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={submitFeedback}
                className="bg-caluu-blue hover:bg-caluu-blue-light"
              >
                Submit Feedback
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GpaCalculator;
