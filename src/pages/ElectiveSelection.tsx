
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft } from "lucide-react";
import axios from "axios";

const API_BASE_URL = "https://caluu.pythonanywhere.com/api";

interface Course {
  id: string;
  code: string;
  name: string;
  creditHours: number;
  isOptional: boolean;
}

const ElectiveSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selection, setSelection] = useState<any>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [optionalCourses, setOptionalCourses] = useState<Course[]>([]);
  const [selectedElectives, setSelectedElectives] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      
      const fetchedCourses = response.data.map((course: any) => ({
        ...course,
        isOptional: course.is_optional || false // Ensure the backend includes this field
      }));
      
      setAllCourses(fetchedCourses);
      
      // Filter out optional courses
      const optionals = fetchedCourses.filter((course: Course) => course.isOptional);
      setOptionalCourses(optionals);
      
      if (optionals.length === 0) {
        // If no optional courses, go directly to calculator
        sessionStorage.setItem("selectedElectives", JSON.stringify([]));
        navigate("/calculator");
      }
      
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive"
      });
      navigate("/selection");
    } finally {
      setIsLoading(false);
    }
  };

  const handleElectiveToggle = (courseId: string) => {
    setSelectedElectives(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedElectives.length === 0) {
      toast({
        title: "No Electives Selected",
        description: "Please select at least one elective course",
        variant: "destructive"
      });
      return;
    }
    
    // Save selected electives to session storage
    sessionStorage.setItem("selectedElectives", JSON.stringify(selectedElectives));
    
    // Proceed to calculator
    navigate("/calculator");
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
    <div className="min-h-screen bg-[#031f45] pb-12">
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
              Elective Course Selection
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
        
        <motion.div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-6 pb-0">
            <h1 className="text-2xl font-bold text-center text-caluu-blue-dark mb-6">
              Select Your Elective Course(s)
            </h1>
          </div>
          
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="h-32 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ) : (
            <motion.div
              className="p-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {optionalCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    variants={itemVariants}
                    className="bg-[#0a2747] text-white rounded-lg p-4 flex items-start"
                  >
                    <Checkbox
                      id={course.id}
                      checked={selectedElectives.includes(course.id)}
                      onCheckedChange={() => handleElectiveToggle(course.id)}
                      className="h-5 w-5 mt-1 border-white data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                    />
                    <label 
                      htmlFor={course.id}
                      className="ml-3 cursor-pointer flex-1"
                    >
                      <div className="font-bold">{course.code}: {course.name}</div>
                      <div className="text-sm text-white/70 mt-1">Credit Hours: {course.creditHours}</div>
                    </label>
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                variants={itemVariants}
                className="mt-8"
              >
                <Button
                  onClick={handleContinue}
                  className="w-full py-6 text-lg bg-blue-500 hover:bg-blue-600 transition-all duration-300"
                >
                  Continue
                </Button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ElectiveSelection;
