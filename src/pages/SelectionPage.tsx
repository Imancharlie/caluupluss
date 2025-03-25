import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const API_BASE_URL = "https://caluu.pythonanywhere.com/api";

interface College {
  id: string;
  name: string;
}

interface Program {
  id: string;
  name: string;
}

interface AcademicYear {
  id: string;
  year: number;
  contains_electives: boolean;
  courses_confirmed: boolean;
}

const SelectionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [collegeId, setCollegeId] = useState("");
  const [programId, setProgramId] = useState("");
  const [programName, setProgramName] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [containsElectives, setContainsElectives] = useState(false);
  const [coursesConfirmed, setCoursesConfirmed] = useState(false);
  
  const [colleges, setColleges] = useState<College[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProgramsLoading, setIsProgramsLoading] = useState(false);
  const [isYearsLoading, setIsYearsLoading] = useState(false);

  useEffect(() => {
    const fetchColleges = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/colleges/`);
        setColleges(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching colleges:", error);
        toast({
          title: "Error",
          description: "Failed to load colleges. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchColleges();
  }, [toast]);

  const fetchPrograms = async (collegeId: string) => {
    if (!collegeId) return;
    
    setIsProgramsLoading(true);
    setProgramId("");
    setProgramName("");
    setPrograms([]);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/programs/`, {
        params: { college_id: collegeId }
      });
      setPrograms(response.data);
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast({
        title: "Error",
        description: "Failed to load programs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProgramsLoading(false);
    }
  };

  const fetchAcademicYears = async (programId: string) => {
    if (!programId) return;
    
    setIsYearsLoading(true);
    setAcademicYearId("");
    setAcademicYear("");
    setYears([]);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/academic-years/`, {
        params: { program_id: programId }
      });
      setYears(response.data);
    } catch (error) {
      console.error("Error fetching academic years:", error);
      toast({
        title: "Error",
        description: "Failed to load academic years. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsYearsLoading(false);
    }
  };

  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCollegeId = e.target.value;
    setCollegeId(selectedCollegeId);
    fetchPrograms(selectedCollegeId);
    
    setProgramId("");
    setProgramName("");
    setAcademicYearId("");
    setSemester("");
    setContainsElectives(false);
    setCoursesConfirmed(false);
  };

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProgramId = e.target.value;
    setProgramId(selectedProgramId);
    
    const selectedProgram = programs.find(program => program.id === selectedProgramId);
    if (selectedProgram) {
      setProgramName(selectedProgram.name);
    }
    
    fetchAcademicYears(selectedProgramId);
    
    setAcademicYearId("");
    setSemester("");
    setContainsElectives(false);
    setCoursesConfirmed(false);
  };

  const handleAcademicYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYearId = e.target.value;
    setAcademicYearId(selectedYearId);
    
    const selectedYearObj = years.find(year => year.id === selectedYearId);
    if (selectedYearObj) {
      setAcademicYear(selectedYearObj.year.toString());
      setContainsElectives(selectedYearObj.contains_electives);
      setCoursesConfirmed(selectedYearObj.courses_confirmed);
    }
    
    setSemester("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!programId || !academicYearId || !semester) {
      toast({
        title: "Missing Information",
        description: "Please select all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // First check if there are elective courses
      const electiveParams = {
        program_id: programId,
        academic_year_id: academicYearId,
        semester: semester.toString(),
        optional: "true"
      };

      const electiveUrl = `${API_BASE_URL}/select-electives/?${new URLSearchParams(electiveParams).toString()}`;
      console.log('Checking elective courses at:', electiveUrl);

      const electiveResponse = await axios.get(electiveUrl);
      const hasElectives = electiveResponse.data && electiveResponse.data.length > 0;

      // Save selection to session storage
      const selection = {
        programId: programId,
        programName: programName,  // Use the programName from state
        academicYearId: academicYearId,
        academicYear: parseInt(academicYear),
        semester: parseInt(semester),
        containsElectives: hasElectives,
        coursesConfirmed: coursesConfirmed
      };
      
      console.log('Saving selection:', selection);  // Debug log
      sessionStorage.setItem("selection", JSON.stringify(selection));
      
      // If there are electives, navigate to elective selection
      // If no electives, navigate directly to GPA calculator
      if (hasElectives) {
        navigate("/elective-selection");
      } else {
        // Set empty array for selected electives since there are none
        sessionStorage.setItem("selectedElectives", JSON.stringify([]));
        navigate("/calculator");
      }
    } catch (error) {
      console.error("Error checking elective courses:", error);
      toast({
        title: "Error",
        description: "Failed to check elective courses. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isFormValid = collegeId && programId && academicYearId && semester;

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
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-caluu-blue-dark p-4">
      <motion.div 
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <motion.h1 
            className="text-3xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            GPA CALCULATOR
          </motion.h1>
          <motion.p 
            className="text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
           
          </motion.p>
        </div>

        <motion.div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="p-6">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">
                  College
                </label>
                <select
                  id="college"
                  value={collegeId}
                  onChange={handleCollegeChange}
                  disabled={isLoading}
                  className="form-select"
                >
                  <option value="">
                    {isLoading ? "Loading colleges..." : "Select College"}
                  </option>
                  {colleges.map((college) => (
                    <option key={college.id} value={college.id}>
                      {college.name}
                    </option>
                  ))}
                </select>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
                  Program
                </label>
                <select
                  id="program"
                  value={programId}
                  onChange={handleProgramChange}
                  disabled={isProgramsLoading || !collegeId}
                  className="form-select"
                >
                  <option value="">
                    {isProgramsLoading 
                      ? "Loading programs..." 
                      : collegeId 
                        ? "Select Program" 
                        : "Please select a college first"}
                  </option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year
                </label>
                <select
                  id="year"
                  value={academicYearId}
                  onChange={handleAcademicYearChange}
                  disabled={isYearsLoading || !programId}
                  className="form-select"
                >
                  <option value="">
                    {isYearsLoading 
                      ? "Loading years..." 
                      : programId 
                        ? "Select Year" 
                        : "Please select a program first"}
                  </option>
                  {years.map((year) => (
                    <option key={year.id} value={year.id}>
                      Year {year.year}
                      {!year.courses_confirmed && " (Unconfirmed)"}
                    </option>
                  ))}
                </select>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  disabled={!academicYearId}
                  className="form-select"
                >
                  <option value="">
                    {academicYearId ? "Select Semester" : "Please select an academic year first"}
                  </option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </motion.div>

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-all duration-300 ${
                    isFormValid
                      ? "bg-caluu-blue hover:bg-caluu-blue-light shadow-md hover:shadow-lg"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          </form>
        </motion.div>

        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
         
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SelectionPage;
