
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, ChevronLeft } from "lucide-react";

// Types
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
  
  // Selection state from previous page
  const [selection, setSelection] = useState<any>(null);
  
  // Courses and grades
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [gpa, setGpa] = useState<number | null>(null);
  
  // Loading and UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackIssue, setFeedbackIssue] = useState("");
  const [feedbackDescription, setFeedbackDescription] = useState("");
  
  // Notification banner
  const [showNotification, setShowNotification] = useState(true);

  // Grade points configuration
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

  // Initialize component with data
  useEffect(() => {
    // Get selection from sessionStorage
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
    
    setSelection(JSON.parse(selectionData));
    
    // Mock fetch courses - replace with actual API call
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        // Mock data - replace with API call
        setTimeout(() => {
          const mockCourses: Course[] = [
            { id: "1", code: "CSC1101", name: "Introduction to Programming", creditHours: 4 },
            { id: "2", code: "CSC1102", name: "Discrete Mathematics", creditHours: 3 },
            { id: "3", code: "CSC1103", name: "Computer Architecture", creditHours: 3 },
            { id: "4", code: "CSC1104", name: "Introduction to Information Systems", creditHours: 3 },
            { id: "5", code: "CSC1105", name: "Communication Skills", creditHours: 2 }
          ];
          
          setCourses(mockCourses);
          
          // Initialize grades
          setGrades(mockCourses.map(course => ({
            courseId: course.id,
            grade: ""
          })));
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [navigate, toast]);

  // Handle grade change
  const handleGradeChange = (courseId: string, grade: string) => {
    setGrades(prevGrades => 
      prevGrades.map(entry => 
        entry.courseId === courseId 
          ? { ...entry, grade } 
          : entry
      )
    );
    
    // Reset GPA when grades change
    setGpa(null);
  };

  // Calculate GPA
  const calculateGpa = () => {
    // Validate that all courses have grades
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
    
    // Mock API call for calculation - replace with actual API
    setTimeout(() => {
      let totalPoints = 0;
      let totalCredits = 0;
      
      grades.forEach(entry => {
        const course = courses.find(c => c.id === entry.courseId);
        const gradePoint = gradePoints.find(gp => gp.grade === entry.grade);
        
        if (course && gradePoint) {
          totalPoints += gradePoint.points * course.creditHours;
          totalCredits += course.creditHours;
        }
      });
      
      const calculatedGpa = totalCredits > 0 
        ? Number((totalPoints / totalCredits).toFixed(2)) 
        : 0;
      
      setGpa(calculatedGpa);
      setIsCalculating(false);
      
      toast({
        title: "GPA Calculated",
        description: `Your GPA is ${calculatedGpa}`,
        variant: "default"
      });
    }, 800);
  };

  // Submit feedback
  const submitFeedback = () => {
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
    
    // Mock API call - replace with actual API
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback!",
      variant: "default"
    });
    
    setShowFeedbackModal(false);
    setFeedbackIssue("");
    setFeedbackDescription("");
    setShowNotification(false);
  };

  // Animation variants
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
      {/* Header */}
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
          
          <div className="w-20"></div> {/* For balance */}
        </div>
      </motion.div>

      <div className="container-app py-8">
        {/* Program Info */}
        {selection && (
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-1">
              {selection.programId === "101" ? "Bachelor of Science in Computer Science" : 
               selection.programId === "102" ? "Bachelor of Science in Software Engineering" :
               selection.programId === "103" ? "Bachelor of Information Technology" : 
               "Selected Program"}
            </h2>
            <p className="text-white/70">
              Year {selection.academicYear} - Semester {selection.semester}
            </p>
          </motion.div>
        )}

        {/* Notification */}
        {showNotification && (
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
                onClick={() => setShowNotification(false)}
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

        {/* Main Content */}
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

      {/* Feedback Modal */}
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
