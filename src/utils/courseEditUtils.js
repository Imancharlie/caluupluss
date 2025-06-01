// courseEditUtils.js
import axios from 'axios';

const API_BASE_URL = "https://caluu.pythonanywhere.com/api";

// Storage key generation
export const getStorageKey = (selection) => 
  `courseEdits_${selection.programId}_${selection.academicYear}_${selection.semester}`;

// Local storage operations
export const saveEditsToLocal = (selection, edits) => {
  try {
    const key = getStorageKey(selection);
    localStorage.setItem(key, JSON.stringify(edits));
    console.log('Course edits saved to localStorage:', key);
    return true;
  } catch (error) {
    console.error('Error saving course edits to localStorage:', error);
    return false;
  }
};

export const loadEditsFromLocal = (selection) => {
  try {
    const key = getStorageKey(selection);
    const edits = localStorage.getItem(key);
    return edits ? JSON.parse(edits) : null;
  } catch (error) {
    console.error('Error loading course edits from localStorage:', error);
    return null;
  }
};

export const clearLocalEdits = (selection) => {
  try {
    const key = getStorageKey(selection);
    localStorage.removeItem(key);
    console.log('Course edits cleared from localStorage:', key);
    return true;
  } catch (error) {
    console.error('Error clearing course edits from localStorage:', error);
    return false;
  }
};

// Course merging logic
export const mergeCourses = (apiCourses, localEdits) => {
  if (!localEdits || Object.keys(localEdits).length === 0) {
    return apiCourses;
  }

  const mergedCourses = [];
  const processedIds = new Set();

  // Process existing API courses with edits
  apiCourses.forEach(apiCourse => {
    const edit = localEdits[apiCourse.id];
    if (edit && !edit.isDeleted) {
      // Course has edits
      mergedCourses.push({
        ...apiCourse,
        ...edit,
        isEdited: true,
        originalId: apiCourse.id
      });
    } else if (!edit || !edit.isDeleted) {
      // Course unchanged or no edits
      mergedCourses.push(apiCourse);
    }
    // If edit.isDeleted is true, we skip this course
    processedIds.add(apiCourse.id);
  });

  // Add new courses from edits
  Object.values(localEdits).forEach(edit => {
    if (edit.isAdded && !processedIds.has(edit.id)) {
      mergedCourses.push({
        ...edit,
        isAdded: true
      });
    }
  });

  return mergedCourses;
};

// Convert courses to edits format for storage
export const coursesToEdits = (courses, originalCourses = []) => {
  const edits = {};
  
  courses.forEach(course => {
    if (course.isAdded) {
      // New course
      edits[course.id] = {
        id: course.id,
        code: course.code,
        name: course.name,
        credit_hours: course.credit_hours,
        isAdded: true
      };
    } else if (course.isEdited) {
      // Edited existing course
      edits[course.id] = {
        id: course.id,
        code: course.code,
        name: course.name,
        credit_hours: course.credit_hours,
        isEdited: true,
        originalId: course.originalId || course.id
      };
    }
  });

  // Check for deleted courses
  originalCourses.forEach(originalCourse => {
    const stillExists = courses.find(c => c.id === originalCourse.id);
    if (!stillExists && !originalCourse.isAdded) {
      edits[originalCourse.id] = {
        id: originalCourse.id,
        isDeleted: true,
        originalId: originalCourse.id
      };
    }
  });

  return edits;
};

// Backend sync functions (for future implementation)
export const syncEditsToBackend = async (selection, edits) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/course-edits/`, {
      program_id: selection.programId,
      academic_year: selection.academicYear,
      semester: selection.semester,
      edits: edits
    });
    
    console.log('Course edits synced to backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error syncing course edits to backend:', error);
    throw error;
  }
};

export const loadEditsFromBackend = async (selection) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/course-edits/${selection.programId}/${selection.academicYear}/${selection.semester}/`
    );
    
    console.log('Course edits loaded from backend:', response.data);
    return response.data.edits || {};
  } catch (error) {
    if (error.response?.status === 404) {
      // No edits found, return empty object
      return {};
    }
    console.error('Error loading course edits from backend:', error);
    throw error;
  }
};

// Hybrid loading function
export const loadCourseEdits = async (selection, preferBackend = false) => {
  if (preferBackend) {
    try {
      // Try backend first
      const backendEdits = await loadEditsFromBackend(selection);
      if (backendEdits && Object.keys(backendEdits).length > 0) {
        return backendEdits;
      }
    } catch (error) {
      console.warn('Backend edits not available, falling back to local storage');
    }
  }
  
  // Fall back to local storage
  return loadEditsFromLocal(selection) || {};
};

// Hybrid saving function
export const saveCourseEdits = async (selection, edits, syncToBackend = false) => {
  // Always save to local storage
  const localSaved = saveEditsToLocal(selection, edits);
  
  if (syncToBackend) {
    try {
      await syncEditsToBackend(selection, edits);
      return { local: localSaved, backend: true };
    } catch (error) {
      console.warn('Failed to sync to backend, but local storage succeeded');
      return { local: localSaved, backend: false, error: error.message };
    }
  }
  
  return { local: localSaved, backend: false };
};

// Validation functions
export const validateCourse = (course) => {
  const errors = [];
  
  if (!course.code || !course.code.trim()) {
    errors.push('Course code is required');
  }
  
  if (!course.name || !course.name.trim()) {
    errors.push('Course name is required');
  }
  
  if (!course.credit_hours || course.credit_hours <= 0) {
    errors.push('Credit hours must be greater than 0');
  }
  
  if (course.credit_hours > 10) {
    errors.push('Credit hours cannot exceed 10');
  }
  
  return errors;
};

export const validateCourses = (courses) => {
  const allErrors = {};
  let hasErrors = false;
  
  courses.forEach((course, index) => {
    const errors = validateCourse(course);
    if (errors.length > 0) {
      allErrors[course.id] = errors;
      hasErrors = true;
    }
  });
  
  return { hasErrors, errors: allErrors };
};

// Statistics functions
export const getEditStatistics = (courses, originalCourses) => {
  const stats = {
    total: courses.length,
    original: 0,
    edited: 0,
    added: 0,
    deleted: 0
  };
  
  courses.forEach(course => {
    if (course.isAdded) {
      stats.added++;
    } else if (course.isEdited) {
      stats.edited++;
    } else {
      stats.original++;
    }
  });
  
  // Count deleted courses
  if (originalCourses) {
    originalCourses.forEach(originalCourse => {
      const stillExists = courses.find(c => c.id === originalCourse.id);
      if (!stillExists && !originalCourse.isAdded) {
        stats.deleted++;
      }
    });
  }
  
  return stats;
};