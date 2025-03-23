
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Upload, FileText, CheckCircle, XCircle, Trash } from "lucide-react";
import axios from "axios";

// API base URL
const API_BASE_URL = "https://caluu.pythonanywhere.com/api";

const AdminUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Auth check
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  // Selection state
  const [collegeId, setCollegeId] = useState("");
  const [programId, setProgramId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Data state
  const [colleges, setColleges] = useState<{id: string, name: string}[]>([]);
  const [programs, setPrograms] = useState<{id: string, name: string}[]>([]);
  const [years, setYears] = useState<{year: number}[]>([]);
  const [isCollegesLoading, setIsCollegesLoading] = useState(false);
  const [isProgramsLoading, setIsProgramsLoading] = useState(false);
  const [isYearsLoading, setIsYearsLoading] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authToken = sessionStorage.getItem("adminAuth");
      if (authToken !== "true") {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the admin area.",
          variant: "destructive"
        });
        navigate("/admin/login");
      } else {
        setIsAuthorized(true);
        // Load colleges after auth check
        fetchColleges();
      }
      setIsChecking(false);
    };

    // Add a slight delay to show animation
    setTimeout(checkAuth, 500);
  }, [navigate, toast]);

  // Fetch colleges from API
  const fetchColleges = async () => {
    setIsCollegesLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/colleges/`);
      setColleges(response.data);
    } catch (error) {
      console.error("Error fetching colleges:", error);
      toast({
        title: "Error",
        description: "Failed to load colleges. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCollegesLoading(false);
    }
  };

  // Fetch programs based on college selection
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

  // Fetch academic years based on program selection
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

  // Handle college selection
  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCollegeId = e.target.value;
    setCollegeId(selectedCollegeId);
    fetchPrograms(selectedCollegeId);
    
    // Reset dependent fields
    setProgramId("");
    setAcademicYear("");
    setSemester("");
  };

  // Handle program selection
  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProgramId = e.target.value;
    setProgramId(selectedProgramId);
    fetchAcademicYears(selectedProgramId);
    
    // Reset dependent fields
    setAcademicYear("");
    setSemester("");
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      // Check if it's a CSV file
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file.",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadSuccess(false);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!collegeId || !programId || !academicYear || !semester) {
      toast({
        title: "Missing Selection",
        description: "Please select all required fields before uploading.",
        variant: "destructive"
      });
      return;
    }
    
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('college_id', collegeId);
      formData.append('program_id', programId);
      formData.append('academic_year', academicYear);
      formData.append('semester', semester);
      
      // Get auth token from session storage
      const authToken = sessionStorage.getItem("adminAuth");
      
      // Send the file to your Django API endpoint
      await axios.post(`${API_BASE_URL}/courses/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Token ${authToken}`
        }
      });
      
      setUploadSuccess(true);
      toast({
        title: "Upload Successful",
        description: "The course data has been uploaded successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Clear the file selection
  const clearFile = () => {
    setFile(null);
    setUploadSuccess(false);
  };

  // Sign out function
  const handleSignOut = () => {
    sessionStorage.removeItem("adminAuth");
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
      variant: "default"
    });
    navigate("/");
  };

  // Check if form is valid
  const isFormValid = collegeId && programId && academicYear && semester && file;

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
      transition: { duration: 0.4 }
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-caluu-blue-dark flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-12 rounded-full bg-white/20"></div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-caluu-blue-dark flex flex-col">
      {/* Header with back button */}
      <motion.div 
        className="p-4 flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button 
          onClick={() => navigate("/")}
          className="flex items-center text-white opacity-70 hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={20} />
          <span>Back to Main</span>
        </button>
        
        <button 
          onClick={handleSignOut}
          className="text-white opacity-70 hover:opacity-100 transition-opacity text-sm"
        >
          Sign Out
        </button>
      </motion.div>
      
      {/* Page Title */}
      <motion.div 
        className="text-center mt-4 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold text-white">Admin Upload</h1>
        <p className="text-white/70 mt-1">Upload course data via CSV file</p>
      </motion.div>
      
      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <motion.div 
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Course Selection Form */}
                <motion.div variants={itemVariants}>
                  <h2 className="text-xl font-semibold mb-4 text-caluu-blue-dark">
                    Course Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* College Selection */}
                    <div>
                      <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">
                        College
                      </label>
                      <select
                        id="college"
                        value={collegeId}
                        onChange={handleCollegeChange}
                        disabled={isCollegesLoading}
                        className="form-select"
                      >
                        <option value="">
                          {isCollegesLoading ? "Loading colleges..." : "Select College"}
                        </option>
                        {colleges.map((college) => (
                          <option key={college.id} value={college.id}>
                            {college.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Program Selection */}
                    <div>
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
                    </div>

                    {/* Academic Year Selection */}
                    <div>
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
                    </div>

                    {/* Semester Selection */}
                    <div>
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
                    </div>
                  </div>
                </motion.div>
                
                {/* File Upload Section */}
                <motion.div variants={itemVariants}>
                  <h2 className="text-xl font-semibold mb-4 text-caluu-blue-dark">
                    Upload CSV File
                  </h2>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {!file ? (
                      <div>
                        <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                        <p className="mb-4 text-gray-600">
                          Drag and drop your CSV file here, or click to browse
                        </p>
                        <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-caluu-blue text-white font-medium rounded-lg shadow-md hover:bg-caluu-blue-light hover:shadow-lg transition-all duration-300">
                          <Upload size={18} className="mr-2" />
                          Select File
                          <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-center mb-4">
                          {uploadSuccess ? (
                            <CheckCircle size={32} className="text-green-500 mr-2" />
                          ) : (
                            <FileText size={32} className="text-caluu-blue mr-2" />
                          )}
                          <span className="font-medium">
                            {file.name}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-500 mb-4">
                          {uploadSuccess ? (
                            <span className="text-green-600">File uploaded successfully!</span>
                          ) : (
                            <span>{(file.size / 1024).toFixed(2)} KB</span>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={clearFile}
                          className="inline-flex items-center justify-center px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-red-600 transition-colors duration-300"
                        >
                          <Trash size={14} className="mr-1" />
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* CSV Template Note */}
                  <div className="mt-3 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Note:</span> The CSV file should have columns for Course Code, Course Name, and Credit Hours.
                    </p>
                  </div>
                </motion.div>
                
                {/* Upload Button */}
                <motion.div variants={itemVariants} className="pt-4">
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!isFormValid || isUploading || uploadSuccess}
                    className={`w-full py-3 px-4 flex items-center justify-center font-medium rounded-lg transition-all duration-300 ${
                      !isFormValid || uploadSuccess
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : isUploading
                          ? "bg-caluu-blue text-white opacity-75 cursor-wait"
                          : "bg-caluu-blue text-white hover:bg-caluu-blue-light shadow-md hover:shadow-lg"
                    }`}
                  >
                    {uploadSuccess ? (
                      <>
                        <CheckCircle size={18} className="mr-2" />
                        Uploaded Successfully
                      </>
                    ) : isUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="mr-2" />
                        Upload Courses
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminUpload;
