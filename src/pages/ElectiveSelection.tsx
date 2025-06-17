
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  
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
      const electiveParams = {
        program_id: selection.programId,
        academic_year_id: selection.academicYearId,
        semester: selection.semester.toString(),
        optional: "true"
      };

      const response = await axiosInstance.get("/select-electives/", {
        params: electiveParams
      });
      
      if (!response.data || response.data.length === 0) {
        toast({
          title: "No Electives Available",
          description: "There are no elective courses available for your selection. You will proceed to the GPA calculator.",
          variant: "default"
        });
        sessionStorage.setItem("selectedElectives", JSON.stringify([]));
        navigate("/calculator");
        return;
      }
      
      setCourses(response.data);
      
      // Load any previously selected electives
      const savedElectives = sessionStorage.getItem("selectedElectives");
      if (savedElectives) {
        setSelectedElectives(JSON.parse(savedElectives));
      }
    } catch (error) {
      console.error("Error fetching electives:", error);
      toast({
        title: "No Electives Available",
        description: "There are no elective courses available for your selection. You will proceed to the GPA calculator.",
        variant: "default"
      });
      sessionStorage.setItem("selectedElectives", JSON.stringify([]));
      navigate("/calculator");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleElective = (courseId: string) => {
    setSelectedElectives(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSubmit = () => {
    sessionStorage.setItem("selectedElectives", JSON.stringify(selectedElectives));
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-caluu-blue-dark flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-12 rounded-full bg-white/20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-caluu-blue-dark flex flex-col">
      <motion.div 
        className="p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button 
          onClick={() => navigate("/selection")}
          className="flex items-center text-white opacity-70 hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
      </motion.div>
      
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div 
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <motion.h1 
              className="text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              Select Elective Courses
            </motion.h1>
            
            <motion.p 
              className="text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              Choose the elective courses you want to take
            </motion.p>
          </div>
          
          <motion.div 
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="p-6">
              <div className="space-y-4">
                {courses.map((course) => (
                  <motion.div
                    key={course.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                      selectedElectives.includes(course.id)
                        ? "border-caluu-blue bg-caluu-blue/5"
                        : "border-gray-200 hover:border-caluu-blue/50"
                    }`}
                    onClick={() => toggleElective(course.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{course.name}</h3>
                        <p className="text-sm text-gray-500">{course.code}</p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {course.credit_hours} credits
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-caluu-blue text-white hover:bg-caluu-blue-light"
                >
                  Continue to GPA Calculator
                </Button>
              </div>
            </div>
          </motion.div>
          {/* Add copyright section */}
<motion.div 
  className="mt-4 text-center text-white/60 text-sm"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.4, delay: 0.8 }}
>
  <p>&copy; 2025 Kodin Softwares |{" "}
    <button 
      onClick={() => window.open('https://imancharlie.pythonanywhere.com', '_blank')}
      className="text-white hover:underline"
    >
      Visit us
    </button>
  </p>
</motion.div>
        </motion.div>
      </div>
      
    </div>
  );
};

export default ElectiveSelection;
