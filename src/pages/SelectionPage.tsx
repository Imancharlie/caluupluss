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
  year: number;
}

const SelectionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [collegeId, setCollegeId] = useState("");
  const [programId, setProgramId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  
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
    setAcademicYear("");
    setSemester("");
  };

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProgramId = e.target.value;
    setProgramId(selectedProgramId);
    fetchAcademicYears(selectedProgramId);
    
    setAcademicYear("");
    setSemester("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!collegeId || !programId || !academicYear || !semester) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields before proceeding.",
        variant: "destructive"
      });
      return;
    }

    sessionStorage.setItem('selection', JSON.stringify({
      collegeId,
      programId,
      academicYear,
      semester
    }));

    navigate("/calculator");
  };

  const isFormValid = collegeId && programId && academicYear && semester;

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
            Academic Selection
          </motion.h1>
          <motion.p 
            className="text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Select your college, program, year, and semester
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
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
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
                    <option key={year.year} value={year.year.toString()}>
                      Year {year.year}
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
                  disabled={!academicYear}
                  className="form-select"
                >
                  <option value="">
                    {academicYear ? "Select Semester" : "Please select an academic year first"}
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
          <button 
            onClick={() => navigate("/admin/login")}
            className="text-white/60 hover:text-white text-sm transition-colors duration-300"
          >
            Admin Access
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SelectionPage;
