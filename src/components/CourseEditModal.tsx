import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Plus, Trash2, RotateCcw } from 'lucide-react';

interface Course {
  id: string;
  code: string;
  name: string;
  credit_hours: number;
  is_elective?: boolean;
  isEdited?: boolean; // Flag if this course has been locally edited
  isAdded?: boolean;  // Flag if this is a newly added course
  isDeleted?: boolean; // Flag if this course is marked for deletion (though we just filter it out)
  // originalId?: string; // Not strictly needed with current ID handling for existing courses
}

interface CourseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[]; // Current courses (potentially already merged with local edits)
  originalCourses: Course[]; // The courses fetched directly from the API
  onSave: (editedCourses: Course[]) => void; // Renamed from onSaveEdits
  selection: {
    programId: string;
    academicYear: number;
    semester: number;
  };
}

const CourseEditModal: React.FC<CourseEditModalProps> = ({
  isOpen,
  onClose,
  courses,
  originalCourses, // Pass originalCourses
  onSave, // Use the correct prop name
  selection // Keep selection if needed for future logic, though not directly used in this modal's render
}) => {
  // State to hold the courses being edited in the modal
  const [editedCourses, setEditedCourses] = useState<Course[]>([]);
  // Counter for generating unique IDs for new courses
  const [newCourseCounter, setNewCourseCounter] = useState(1);

  // When the modal opens or the 'courses' prop changes,
  // initialize the 'editedCourses' state with a deep copy of 'courses'.
  // We explicitly mark courses based on whether they differ from originalCourses.
  useEffect(() => {
    if (isOpen) {
      const initialEditedCourses = courses.map(course => {
        const original = originalCourses.find(oc => oc.id === course.id);
        const isAdded = !original; // If no original, it's a new course
        const isEdited = !isAdded && (
          original?.code !== course.code ||
          original?.name !== course.name ||
          original?.credit_hours !== course.credit_hours
        );
        return { ...course, isAdded, isEdited };
      }).filter(course => !course.isDeleted); // Ensure initially deleted ones aren't shown if not intended

      setEditedCourses(initialEditedCourses);
    }
  }, [isOpen, courses, originalCourses]); // Depend on originalCourses as well

  const handleCourseChange = (courseId: string, field: keyof Course, value: string | number) => {
    setEditedCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const updatedCourse = { ...course, [field]: value };
        // Mark as edited if it's an existing course and its value changes
        // Don't mark as edited if it's a newly added course
        if (!course.isAdded) {
          const original = originalCourses.find(oc => oc.id === course.id);
          const changed = original && (
            (field === 'code' && original.code !== value) ||
            (field === 'name' && original.name !== value) ||
            (field === 'credit_hours' && original.credit_hours !== value)
          );
          updatedCourse.isEdited = changed || course.isEdited; // Retain edited status if already edited
        }
        return updatedCourse;
      }
      return course;
    }));
  };

  const addNewCourse = () => {
    const newCourse: Course = {
      id: `new_course_${Date.now()}_${newCourseCounter}`, // Unique ID for new course
      code: '',
      name: '',
      credit_hours: 3, // Default credit hours
      isAdded: true, // Mark as newly added
      isEdited: false, // Not edited yet
    };

    setEditedCourses(prev => [...prev, newCourse]);
    setNewCourseCounter(prev => prev + 1); // Increment counter for next new course
  };

  const deleteCourse = (courseId: string) => {
    setEditedCourses(prev => prev.filter(course => course.id !== courseId));
    // For robust tracking of deletions, you might want to add an isDeleted flag
    // and filter based on it, instead of immediately removing.
    // However, for this implementation, filtering them out is simpler as they won't be saved.
  };

  const resetCourse = (courseId: string) => {
    const originalCourse = originalCourses.find(c => c.id === courseId);
    if (originalCourse) {
      setEditedCourses(prev => prev.map(course =>
        course.id === courseId
          ? { ...originalCourse, isEdited: false, isAdded: false } // Reset flags
          : course
      ));
    } else {
      // If no original course, it means it was a newly added course.
      // In this case, "resetting" means deleting it.
      setEditedCourses(prev => prev.filter(course => course.id !== courseId));
    }
  };

  const resetAllCourses = () => {
    // Reset to the original state fetched from the API
    setEditedCourses(originalCourses.map(course => ({ ...course, isEdited: false, isAdded: false })));
    setNewCourseCounter(1); // Reset new course counter as well
  };

  const handleSave = () => {
    // Basic validation
    const invalidCourses = editedCourses.filter(course =>
      !course.code.trim() || !course.name.trim() || course.credit_hours <= 0
    );

    if (invalidCourses.length > 0) {
      alert('Please fill in all required fields (Code, Name, Credits) for all courses and ensure credit hours are greater than 0.');
      return;
    }

    // Pass the edited courses back to the parent component
    onSave(editedCourses);
    // onClose(); // onClose is called by onSave to ensure modal closes after successful save
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-caluu-blue-dark">
            Edit Courses
          </h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={resetAllCourses}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset All
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
          <div className="space-y-4">
            {editedCourses.map((course, index) => (
              <motion.div
                key={course.id}
                className={`border rounded-lg p-4 ${
                  course.isEdited ? 'border-orange-300 bg-orange-50' :
                  course.isAdded ? 'border-green-300 bg-green-50' :
                  'border-gray-200 bg-white'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }} // Slightly adjusted delay for better feel
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {course.isEdited && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                        Edited
                      </span>
                    )}
                    {course.isAdded && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                    {course.is_elective && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Elective
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Show reset button only if it's an edited existing course */}
                    {course.isEdited && !course.isAdded && (
                      <button
                        onClick={() => resetCourse(course.id)}
                        className="text-orange-600 hover:text-orange-800 p-1"
                        title="Reset to original"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Code *
                    </label>
                    <input
                      type="text"
                      value={course.code}
                      onChange={(e) => handleCourseChange(course.id, 'code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-caluu-blue focus:border-transparent"
                      placeholder="e.g., CS101"
                      required
                    />
                  </div>

                  <div className="sm:col-span-7">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) => handleCourseChange(course.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-caluu-blue focus:border-transparent"
                      placeholder="e.g., Introduction to Computer Science"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credits *
                    </label>
                    <input
                      type="number"
                      min="0.5" // Minimum credit hours to avoid 0 or negative
                      max="10"
                      step="0.5"
                      value={course.credit_hours}
                      onChange={(e) => handleCourseChange(course.id, 'credit_hours', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-caluu-blue focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add New Course Button */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              onClick={addNewCourse}
              variant="outline"
              className="w-full border-dashed border-2 border-gray-300 hover:border-caluu-blue hover:bg-caluu-blue/5 py-4"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Course
            </Button>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600">
            {editedCourses.filter(c => c.isEdited).length} edited, {editedCourses.filter(c => c.isAdded).length} added
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-caluu-blue hover:bg-caluu-blue-light"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseEditModal;