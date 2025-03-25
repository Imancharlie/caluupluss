import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import axios from "axios";

const API_BASE_URL = "https://caluu.pythonanywhere.com/api";

interface Course {
  id: string;
  name: string;
  code: string;
  credit_hours: number;
}

interface Selection {
  programId: string;
  academicYearId: string;
  semester: number;
}

const ElectiveSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedElectives, setSelectedElectives] = useState<string[]>([]);

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
    
    const selection = JSON.parse(selectionData);
    
    // If there are no electives, navigate directly to calculator
    if (!selection.containsElectives) {
      sessionStorage.setItem("selectedElectives", JSON.stringify([]));
      navigate("/calculator");
      return;
    }
    
    fetchElectives(selection);
  }, [navigate, toast]);

  const fetchElectives = async (selection: Selection) => {
    setIsLoading(true);
    try {
      const params = {
          program_id: selection.programId,
        academic_year_id: selection.academicYearId,
        semester: selection.semester.toString(),
        optional: "true"
      };

      // Log the full URL with parameters for debugging
      const url = `${API_BASE_URL}/select-electives/?${new URLSearchParams(params).toString()}`;
      console.log('Fetching electives from:', url);

      const response = await axios.get(url);
      console.log('API Response:', response.data);
      
      setCourses(response.data);
      
      // Load any previously selected electives
      const savedElectives = sessionStorage.getItem("selectedElectives");
      if (savedElectives) {
        setSelectedElectives(JSON.parse(savedElectives));
      }
    } catch (error) {
      console.error("Error fetching electives:", error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
      }
      toast({
        title: "Error",
        description: `Failed to fetch elective courses: ${axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleElectiveToggle = (courseId: string) => {
    setSelectedElectives(prev => {
      const newSelection = prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId];
      
      // Save to session storage immediately
      sessionStorage.setItem("selectedElectives", JSON.stringify(newSelection));
      return newSelection;
    });
  };

  const handleSubmit = () => {
    // Navigate to GPA calculator
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
    <div className="min-h-screen bg-caluu-blue-dark pb-12">
      <motion.div 
        className="bg-gradient-to-r from-caluu-blue to-caluu-blue-dark py-6 px-6 shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-app flex items-center">
          <button 
            onClick={() => navigate("/selection")}
            className="flex items-center text-white hover:text-white/80 mr-4 transition-colors duration-200"
          >
            <ChevronLeft size={24} />
            <span className="ml-1">Back</span>
          </button>
          
          <div className="flex-1">
            <motion.h1 
              className="text-4xl font-extrabold text-white tracking-tight text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              CALUU
            </motion.h1>
          </div>
          
          <div className="w-20"></div>
        </div>
      </motion.div>
      
      <div className="container-app py-4 sm:py-8">
          {isLoading ? (
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        ) : courses.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            className="space-y-6"
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white"
              variants={itemVariants}
            >
              <h2 className="text-xl font-semibold mb-2">Select Your Electives</h2>
              <p className="text-white/70">
                Choose the elective courses you want to take this semester.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden"
              variants={itemVariants}
            >
              <div className="p-4">
                <div className="grid gap-4">
                  {courses.map((course) => (
                  <motion.div
                    key={course.id}
                    variants={itemVariants}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedElectives.includes(course.id)
                          ? 'border-caluu-blue bg-caluu-blue/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleElectiveToggle(course.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{course.code}</h3>
                          <p className="text-sm text-gray-600">{course.name}</p>
                          <p className="text-xs text-gray-500">Credit Hours: {course.credit_hours}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedElectives.includes(course.id)
                            ? 'border-caluu-blue bg-caluu-blue text-white'
                            : 'border-gray-300'
                        }`}>
                          {selectedElectives.includes(course.id) && (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                  </motion.div>
                ))}
                </div>
              </div>
            </motion.div>
              
              <motion.div 
              className="flex justify-center"
                variants={itemVariants}
              >
                <Button
                onClick={handleSubmit}
                className="w-full max-w-xs py-6 text-lg bg-caluu-blue hover:bg-caluu-blue-light transition-all duration-300"
                >
                Continue to GPA Calculator
                </Button>
              </motion.div>
            </motion.div>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center">
            <p className="text-gray-600">No elective courses available.</p>
            <Button
              onClick={() => navigate("/calculator")}
              className="mt-4 bg-caluu-blue hover:bg-caluu-blue-light"
            >
              Continue to Calculate
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectiveSelection;
