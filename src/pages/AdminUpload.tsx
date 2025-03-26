import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, File, X, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/lib/axios";

const AdminUpload = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
        navigate("/admin/login");
    }
  }, [user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError("Please select at least one file");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      
      await axiosInstance.post("/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setFiles([]);
      // Show success message or redirect
    } catch (error) {
      setError("Failed to upload files. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate("/admin/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-caluu-blue-dark flex flex-col">
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
          <span>Back</span>
        </button>
        
        <button 
          onClick={handleSignOut}
          className="text-white opacity-70 hover:opacity-100 transition-opacity"
        >
          Sign Out
        </button>
      </motion.div>
      
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center mb-8">
              <motion.div 
              className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <span className="text-caluu-blue-dark text-4xl font-bold">C</span>
            </motion.div>
            
            <motion.h1 
              className="text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              Admin Upload
            </motion.h1>
            
            <motion.p 
              className="text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              Upload files to the system
            </motion.p>
                    </div>

          <motion.div 
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Files
                      </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <input
                            type="file"
                    multiple
                            onChange={handleFileChange}
                            className="hidden"
                    id="file-upload"
                    accept=".csv,.xlsx,.xls"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-gray-600">
                      Drag and drop files here, or click to select
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      Supported formats: CSV, Excel
                    </span>
                        </label>
                      </div>
              </div>
              
              {files.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Selected Files
                  </h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                      >
                        <div className="flex items-center">
                          <File className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                  </div>
              )}
                
                  <button
                type="submit"
                disabled={isLoading || files.length === 0}
                className={`w-full py-3 px-4 bg-caluu-blue text-white font-medium rounded-lg shadow-md transition-all duration-300 ${
                  isLoading || files.length === 0
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-caluu-blue-light hover:shadow-lg"
                }`}
              >
                {isLoading ? "Uploading..." : "Upload Files"}
                  </button>
            </form>
              </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminUpload;
