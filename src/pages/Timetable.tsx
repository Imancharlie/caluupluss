import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  Download,
  FileText,
  Image as ImageIcon,
  Eye,
  X,
  Loader2,
  AlertCircle,
  Edit3,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import { useStudent } from '@/contexts/StudentContext';
import { timetableApi } from '@/lib/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Types for timetable data
interface ClassInfo {
  id: string;
  course_code: string;
  course_name: string;
  class_type: 'lecture' | 'tutorial' | 'seminar' | 'practical';
  venue: string;
  instructor: string;
  duration: number; // in hours
  description?: string;
}

interface TimetableSlot {
  time_slot: string;
  monday?: ClassInfo;
  tuesday?: ClassInfo;
  wednesday?: ClassInfo;
  thursday?: ClassInfo;
  friday?: ClassInfo;
}

// Backend API response types
interface TimetableResponse {
  success: boolean;
  data: {
    student_id: string;
    semester: string;
    academic_year: string;
    timetable_slots: TimetableSlot[];
  };
  message: string;
}

// Loading and error states
interface TimetableState {
  data: TimetableSlot[];
  loading: boolean;
  error: string | null;
}

// Generate time slots from 07:00 to 20:00 with ranges
const generateTimeSlots = (): string[] => {
  const slots = [];
  for (let hour = 7; hour < 20; hour++) {
    const nextHour = hour + 1;
    slots.push(`${hour.toString().padStart(2, '0')}00-${nextHour.toString().padStart(2, '0')}00`);
  }
  return slots;
};

// Format time slot to ensure HHMM-HHMM format
const formatTimeSlot = (timeSlot: string): string => {
  // If already in correct format, return as is
  if (/^[0-2][0-9][0-5][0-9]-[0-2][0-9][0-5][0-9]$/.test(timeSlot)) {
    return timeSlot;
  }
  
  // Convert from other formats if needed
  // This is a fallback - the time slots should already be in correct format
  return timeSlot;
};


const Timetable: React.FC = () => {
  const { studentProfile, studentCourses } = useStudent();
  const navigate = useNavigate();
  console.log('StudentProfile:', studentProfile); // Debug log
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [selectedClassTime, setSelectedClassTime] = useState<string>('');
  const [selectedClassDay, setSelectedClassDay] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [filteredType, setFilteredType] = useState<ClassInfo['class_type'] | null>(null);
  const [filteredDay, setFilteredDay] = useState<string | null>(null);
  const [timetableState, setTimetableState] = useState<TimetableState>({
    data: [],
    loading: true,
    error: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingClass, setEditingClass] = useState<Partial<ClassInfo>>({});
  const [clickCount, setClickCount] = useState<{[key: string]: number}>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingTime, setPendingTime] = useState('');
  const [pendingDay, setPendingDay] = useState('');
  const [courses, setCourses] = useState<Array<{id: string, code: string, name: string}>>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const timetableRef = useRef<HTMLDivElement>(null);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Derive enrolled courses for the dropdown from StudentContext
  useEffect(() => {
    try {
      const mapped = (Array.isArray(studentCourses) ? studentCourses : []).map(sc => ({
        id: String(sc.course), // backend expects course UUID/id
        code: String(sc.course_code),
        name: String(sc.course_name)
      }));
      setCourses(mapped);
    } catch (e) {
      console.error('Error mapping enrolled courses for timetable:', e);
      setCourses([]);
    }
  }, [studentCourses]);

  // Helper function to reload timetable data
  const reloadTimetable = useCallback(async () => {
    try {
      setTimetableState(prev => ({ ...prev, loading: true, error: null }));
      
      // Prefer new list endpoint
      try {
        const listParams = { 
          student: studentProfile?.id, 
          semester: studentProfile?.semester || 1, 
          academic_year: String(studentProfile?.year || 1) 
        } as const;
        console.log('[Timetable] Student Profile:', { 
        year: studentProfile?.year, 
        semester: studentProfile?.semester 
      });
        console.log('[Timetable] LIST GET /timetable-slots/ params →', listParams);
        const list = await timetableApi.listTimetableSlots(listParams);
        console.log('[Timetable] LIST response raw →', list);
        // Transform flat slot list into TimetableSlot[] grouped by time_slot
        const grouped: Record<string, TimetableSlot> = {};
        type TimetableListItem = {
          id?: string | number;
          time_slot: string | number;
          day_of_week: string;
          course?: string;
          course_code?: string;
          course_name?: string;
          class_type?: 'lecture' | 'tutorial' | 'seminar' | 'practical' | string;
          venue?: string;
          instructor?: string | null;
          duration?: number | string;
          description?: string;
        };
        (Array.isArray(list?.results) ? list.results : Array.isArray(list) ? list : []).forEach((item: TimetableListItem) => {
          const time = String(item.time_slot);
          if (!grouped[time]) grouped[time] = { time_slot: time };
          const day = String(item.day_of_week).toLowerCase();
          const classInfo: ClassInfo = {
            id: String(item.id || `${time}-${day}-${item.course || ''}`),
            course_code: String(item.course_code || item.course || ''),
            course_name: String(item.course_name || ''),
            class_type: (item.class_type || 'lecture') as ClassInfo['class_type'],
            venue: String(item.venue || 'TBA'),
            instructor: item.instructor ?? '',
            duration: Number(item.duration || 1),
            description: item.description || ''
          };
          (grouped[time] as TimetableSlot)[day as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'] = classInfo;
        });
        const slots: TimetableSlot[] = Object.values(grouped).sort((a, b) => a.time_slot.localeCompare(b.time_slot));
        console.log('[Timetable] LIST normalized slots count →', slots.length);
        setTimetableState({ data: slots, loading: false, error: null });
        return;
      } catch (e) {
        // Fall back to legacy endpoints
      }

      let response: TimetableResponse;
      try {
        console.log('[Timetable] LIST (legacy) GET /timetable/my/');
        response = await timetableApi.getMyTimetable();
        console.log('[Timetable] LIST (legacy) /timetable/my/ response →', response);
      } catch (error) {
        console.log('[Timetable] LIST (legacy) GET /students/{id}/timetable/ id →', studentProfile?.id || '');
        response = await timetableApi.getStudentTimetable(studentProfile?.id || '');
        console.log('[Timetable] LIST (legacy) /students/{id}/timetable/ response →', response);
      }
      
      if (response.success) {
        let timetableSlots = response.data.timetable_slots;
        
        if (!timetableSlots && Array.isArray(response.data)) {
          timetableSlots = response.data;
        }
        
        if (!timetableSlots && Array.isArray(response)) {
          timetableSlots = response;
        }
        
        setTimetableState({
          data: timetableSlots || [],
          loading: false,
          error: null
        });
      } else {
        throw new Error(response.message || 'Failed to load timetable');
      }
    } catch (error) {
      console.error('Error reloading timetable:', error);
      setTimetableState(prev => ({ ...prev, loading: false, error: 'Failed to reload timetable' }));
    }
  }, [studentProfile?.id, studentProfile?.semester, studentProfile?.year]);

  // Remove mock course loader; courses now come from enrolled `studentCourses`

  // Load timetable data from backend
  useEffect(() => {
    if (!studentProfile?.id) {
      setTimetableState({
        data: [],
        loading: false,
        error: 'No student ID available'
      });
      return;
    }

    reloadTimetable();
  }, [studentProfile?.id, reloadTimetable]);

  // Guard: prevent access if student has no courses (similar to GPA page)
  const showNoCourses = useMemo(() => {
    if (!studentProfile) return false;
    if (studentProfile.has_courses === false) return true;
    if (Array.isArray(studentCourses) && studentCourses.length === 0) return true;
    return false;
  }, [studentProfile, studentCourses]);

  // Class type styling
  const getClassTypeStyle = (type: ClassInfo['class_type']) => {
    const styles = {
      lecture: 'bg-blue-200 border-blue-300 text-blue-900 hover:bg-blue-300',
      tutorial: 'bg-green-200 border-green-300 text-green-900 hover:bg-green-300',
      seminar: 'bg-purple-200 border-purple-300 text-purple-900 hover:bg-purple-300',
      practical: 'bg-orange-200 border-orange-300 text-orange-900 hover:bg-orange-300'
    };
    return styles[type];
  };

  const getClassTypeIcon = (type: ClassInfo['class_type']) => {
    const icons = {
      lecture: '🟦',
      tutorial: '🟩',
      seminar: '🟪',
      practical: '🟧'
    };
    return icons[type];
  };

  // Handle edit class
  const handleEditClass = () => {
    if (selectedClass) {
      setEditingClass({ ...selectedClass });
      
      // Find the course ID that matches the selected class
      const matchingCourse = courses.find(course => 
        course.code === selectedClass.course_code || 
        course.name === selectedClass.course_name
      );
      
      if (matchingCourse) {
        setSelectedCourseId(matchingCourse.id);
      } else {
        setSelectedCourseId('');
      }
      
      setIsEditing(true);
    }
  };

  // Handle add new class
  const handleAddNewClass = (time: string, day: string) => {
    setEditingClass({
      course_code: '',
      course_name: '',
      class_type: 'lecture',
      venue: '',
      instructor: '',
      duration: 1,
      description: ''
    });
    setSelectedCourseId('');
    setSelectedClassTime(time);
    setSelectedClassDay(day);
    setIsAddingNew(true);
    setIsEditing(true);
  };

  // Validate time slot format (HHMM-HHMM)
  const validateTimeSlot = (timeSlot: string): boolean => {
    const timeSlotRegex = /^([0-1]?[0-9]|2[0-3])[0-5][0-9]-([0-1]?[0-9]|2[0-3])[0-5][0-9]$/;
    return timeSlotRegex.test(timeSlot);
  };

  // Accept any non-empty course identifier (code, UUID, or name)
  const validateCourse = (course: string): boolean => {
    return typeof course === 'string' && course.trim().length > 0;
  };

  // Manual validation function
  const validateSlotData = (data: Record<string, unknown>) => {
    const errors = [];
    
    // Check required fields
    if (!data.course) errors.push('Course is required');
    if (!data.time_slot) errors.push('Time slot is required');
    if (!data.day_of_week) errors.push('Day of week is required');
    if (data.semester === undefined || data.semester === null) errors.push('Semester is required');
    if (!data.academic_year) errors.push('Academic year is required');
    
    // Check data types
    if (data.semester !== undefined && typeof data.semester !== 'number') {
      errors.push('Semester must be a number');
    }
    if (data.academic_year && typeof data.academic_year !== 'string') {
      errors.push('Academic year must be a string');
    }
    if (data.time_slot && !validateTimeSlot(String(data.time_slot))) {
      errors.push('Time slot must be in HHMM-HHMM format');
    }
    if (data.day_of_week && !['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(String(data.day_of_week))) {
      errors.push('Day of week must be one of: monday, tuesday, wednesday, thursday, friday');
    }
    if (data.course && typeof data.course !== 'string') {
      errors.push('Course must be a string');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Handle save class (edit or add)
  const handleSaveClass = async () => {
    try {
      // Validation
      if (!selectedCourseId && (!editingClass.course_code || !editingClass.course_name)) {
        alert('Please select a course or fill in course details');
        return;
      }

      if (!selectedClassTime || !selectedClassDay) {
        alert('Time and day are required');
        return;
      }

      if (!validateTimeSlot(selectedClassTime)) {
        alert('Invalid time format. Please use HHMM-HHMM format (e.g., 0900-1000)');
        return;
      }

      // Build course value: prefer selected course ID, then fallback to course code/name
      let courseValue = '';
      if (selectedCourseId) {
        // Use the selected course ID
        courseValue = selectedCourseId;
      } else if (editingClass.course_code) {
        // Use the course code
        courseValue = editingClass.course_code;
      } else if (editingClass.course_name) {
        // Use the course name
        courseValue = editingClass.course_name;
      } else if (selectedClass && !isAddingNew) {
        // Fallback to original class data when editing
        courseValue = selectedClass.course_code || selectedClass.course_name || '';
      }
      
      if (!validateCourse(courseValue)) {
        alert('Course is required (code, UUID or name)');
        return;
      }

      const slotData = {
        course: courseValue,
        time_slot: formatTimeSlot(selectedClassTime),
        day_of_week: selectedClassDay as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday',
        class_type: (editingClass.class_type || 'lecture') as 'lecture' | 'tutorial' | 'seminar' | 'practical',
        venue: editingClass.venue || 'TBA',
        instructor: editingClass.instructor || null,
        description: editingClass.description || '',
        semester: studentProfile?.semester || 1,
        academic_year: String(studentProfile?.year || 1)
      };

      console.log('[Timetable] Saving class with academic year:', {
        studentYear: studentProfile?.year,
        academicYear: String(studentProfile?.year || 1),
        semester: studentProfile?.semester || 1
      });

      // Manual validation
      const validation = validateSlotData(slotData);
      console.log('🔍 Manual Validation:', validation);
      
      // Debug logging
      const debugData = {
        slotData,
        dataTypes: {
          course: typeof slotData.course,
          time_slot: typeof slotData.time_slot,
          day_of_week: typeof slotData.day_of_week,
          semester: typeof slotData.semester,
          academic_year: typeof slotData.academic_year,
          class_type: typeof slotData.class_type,
          venue: typeof slotData.venue,
          instructor: typeof slotData.instructor,
          description: typeof slotData.description
        },
        validation
      };
      
      console.log('🔍 Debug - Request Data:', debugData);
      setDebugInfo(JSON.stringify(debugData, null, 2));
      
      if (!validation.isValid) {
        alert(`Validation Errors:\n${validation.errors.join('\n')}`);
        return;
      }

      // Try debug validation first (if available)
      try {
        console.log('🔍 Debug - Testing validation...');
        const debugResult = await timetableApi.debugValidation(slotData);
        console.log('🔍 Debug - Validation Result:', debugResult);
        setDebugInfo(prev => prev + '\n\n✅ Validation Result:\n' + JSON.stringify(debugResult, null, 2));
      } catch (debugError) {
        console.log('🔍 Debug - Validation endpoint not available or failed:', debugError);
        const errorInfo = debugError && typeof debugError === 'object' && 'response' in debugError 
          ? `Status: ${(debugError as { response?: { status?: number; data?: { detail?: string } } }).response?.status}\nMessage: ${(debugError as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail || 'Debug validation endpoint not available'}`
          : 'Debug validation endpoint not available';
        setDebugInfo(prev => prev + '\n\n⚠️ Validation Endpoint: ' + errorInfo);
      }

      // Try debug request first (if available)
      try {
        console.log('🔍 Debug - Testing request data...');
        const requestResult = await timetableApi.debugRequest(slotData);
        console.log('🔍 Debug - Request Data Result:', requestResult);
        setDebugInfo(prev => prev + '\n\n✅ Request Data Result:\n' + JSON.stringify(requestResult, null, 2));
      } catch (debugError) {
        console.log('🔍 Debug - Request debug endpoint not available or failed:', debugError);
        const errorInfo = debugError && typeof debugError === 'object' && 'response' in debugError 
          ? `Status: ${(debugError as { response?: { status?: number; data?: { detail?: string } } }).response?.status}\nMessage: ${(debugError as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail || 'Debug request endpoint not available'}`
          : 'Debug request endpoint not available';
        setDebugInfo(prev => prev + '\n\n⚠️ Request Debug Endpoint: ' + errorInfo);
      }

      if (isAddingNew) {
        // Create new slot
        console.log('[Timetable] CREATE POST /timetable-slots/ payload →', slotData);
        const createResp = await timetableApi.createTimetableSlot(slotData);
        console.log('[Timetable] CREATE response →', createResp);
      } else if (selectedClass?.id) {
        // Update existing slot
        console.log('[Timetable] UPDATE PATCH /timetable-slots/{id}/ id,payload →', selectedClass.id, slotData);
        const updateResp = await timetableApi.updateTimetableSlot(selectedClass.id, slotData);
        console.log('[Timetable] UPDATE response →', updateResp);
      }
      
      // Reload timetable data
      await reloadTimetable();
      
      // Close modal
      setIsEditing(false);
      setIsAddingNew(false);
      setSelectedClass(null);
      setEditingClass({});
      setSelectedCourseId('');
    } catch (error) {
      console.error('Error saving class:', error);
      
      // Handle specific validation errors
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: Record<string, unknown> } };
        if (axiosError.response?.status === 400) {
          const errorData = axiosError.response.data;
          if (typeof errorData === 'object' && errorData !== null) {
            // Handle field-specific validation errors
            const errorMessages = [];
            if (errorData.course) errorMessages.push(`Course: ${Array.isArray(errorData.course) ? errorData.course.join(', ') : errorData.course}`);
            if (errorData.time_slot) errorMessages.push(`Time Slot: ${Array.isArray(errorData.time_slot) ? errorData.time_slot.join(', ') : errorData.time_slot}`);
            if (errorData.day_of_week) errorMessages.push(`Day: ${Array.isArray(errorData.day_of_week) ? errorData.day_of_week.join(', ') : errorData.day_of_week}`);
            if (errorData.semester) errorMessages.push(`Semester: ${Array.isArray(errorData.semester) ? errorData.semester.join(', ') : errorData.semester}`);
            if (errorData.academic_year) errorMessages.push(`Academic Year: ${Array.isArray(errorData.academic_year) ? errorData.academic_year.join(', ') : errorData.academic_year}`);
            
            if (errorMessages.length > 0) {
              alert(`Validation Error:\n${errorMessages.join('\n')}`);
              return;
            }
          }
          alert('Invalid data format. Please check your input and try again.');
          return;
        }
      }
      
      alert('Failed to save class. Please try again.');
    }
  };

  // Handle delete class
  const handleDeleteClass = async () => {
    if (selectedClass && !isAddingNew) {
      try {
        if (!selectedClass.id) {
          alert('Cannot delete class: missing ID');
          return;
        }

        // Confirm deletion
        if (!confirm('Are you sure you want to delete this class?')) {
          return;
        }

        // Delete slot
        console.log('[Timetable] DELETE /timetable-slots/{id}/ id →', selectedClass.id);
        const delResp = await timetableApi.deleteTimetableSlot(selectedClass.id);
        console.log('[Timetable] DELETE response →', delResp);
        
        // Reload timetable data
        await reloadTimetable();
        
        // Close modal
        setIsEditing(false);
        setIsAddingNew(false);
        setSelectedClass(null);
        setEditingClass({});
        setSelectedCourseId('');
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('Failed to delete class. Please try again.');
      }
    }
  };

  // Handle empty cell click
  const handleEmptyCellClick = (time: string, day: string) => {
    const cellKey = `${time}-${day}`;
    const currentCount = clickCount[cellKey] || 0;
    const newCount = currentCount + 1;
    
    setClickCount(prev => ({ ...prev, [cellKey]: newCount }));
    
    if (newCount >= 3) {
      setPendingTime(time);
      setPendingDay(day);
      setShowAddModal(true);
      setClickCount(prev => ({ ...prev, [cellKey]: 0 }));
    }
  };

  // Handle add new class from modal
  const handleConfirmAddClass = () => {
    handleAddNewClass(pendingTime, pendingDay);
    setShowAddModal(false);
    setPendingTime('');
    setPendingDay('');
  };

  // Export to PDF
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // Create a temporary container for table-style export
      const exportContainer = document.createElement('div');
      exportContainer.style.cssText = `
        width: 1000px;
        background: white;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      // Add title
      const title = document.createElement('h1');
      title.textContent = 'My Timetable';
      title.style.cssText = `
        text-align: center;
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 20px;
        color: #1f2937;
      `;
      exportContainer.appendChild(title);

      // Add color key
      const colorKey = document.createElement('div');
      colorKey.style.cssText = `
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-bottom: 30px;
        flex-wrap: wrap;
      `;
      
      const classTypes = [
        { type: 'lecture', label: 'Lecture', color: '#dbeafe' },
        { type: 'tutorial', label: 'Tutorial', color: '#dcfce7' },
        { type: 'seminar', label: 'Seminar', color: '#e9d5ff' },
        { type: 'practical', label: 'Practical', color: '#fed7aa' }
      ];

      classTypes.forEach(({ type, label, color }) => {
        const keyItem = document.createElement('div');
        keyItem.style.cssText = `
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          background: ${color};
          border: 1px solid ${color.replace('aa', 'cc')};
        `;
        
        const colorBox = document.createElement('div');
        colorBox.style.cssText = `
          width: 12px;
          height: 12px;
          background: ${color};
          border: 1px solid ${color.replace('aa', 'cc')};
          border-radius: 2px;
        `;
        
        const labelText = document.createElement('span');
        labelText.textContent = label;
        labelText.style.cssText = `
          font-size: 12px;
          font-weight: 500;
        `;
        
        keyItem.appendChild(colorBox);
        keyItem.appendChild(labelText);
        colorKey.appendChild(keyItem);
      });
      
      exportContainer.appendChild(colorKey);

      // Create table
      const table = document.createElement('table');
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        border: 2px solid #374151;
      `;

      // Create table header
      const thead = document.createElement('thead');
      thead.style.cssText = `
        background: #f3f4f6;
        border-bottom: 2px solid #374151;
      `;

      const headerRow = document.createElement('tr');
      const headers = ['Time', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      
      headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.cssText = `
          padding: 12px 8px;
          text-align: center;
          font-weight: 700;
          color: #000000;
          border-right: 2px solid #374151;
          font-size: 12px;
          ${index === 0 ? 'width: 80px;' : 'width: 180px;'}
        `;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Create table body
      const tbody = document.createElement('tbody');

      timeSlots.forEach((time) => {
        const row = document.createElement('tr');
        row.style.cssText = `
          border-bottom: 1px solid #6b7280;
        `;

        // Time cell
        const timeCell = document.createElement('td');
        timeCell.textContent = time;
        timeCell.style.cssText = `
          padding: 8px;
          text-align: center;
          font-weight: 600;
          color: #000000;
          border-right: 2px solid #374151;
          background: #f9fafb;
          font-size: 11px;
        `;
        row.appendChild(timeCell);

        // Day cells
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        days.forEach(day => {
          const slotData = timetableState.data.find(slot => slot.time_slot === time);
          const classInfo = slotData?.[day as keyof TimetableSlot] as ClassInfo;
          
          const dayCell = document.createElement('td');
          dayCell.style.cssText = `
            padding: 0;
            border-right: 2px solid #374151;
            height: 60px;
            vertical-align: top;
          `;

          if (classInfo) {
            const classTypeColors = {
              lecture: { bg: '#dbeafe', border: '#1e40af', text: '#000000' },
              tutorial: { bg: '#dcfce7', border: '#166534', text: '#000000' },
              seminar: { bg: '#e9d5ff', border: '#7c3aed', text: '#000000' },
              practical: { bg: '#fed7aa', border: '#c2410c', text: '#000000' }
            };
            
            const colors = classTypeColors[classInfo.class_type];
            
            const classDiv = document.createElement('div');
            classDiv.style.cssText = `
              height: 60px;
              padding: 4px;
              border: 2px solid ${colors.border};
              background: ${colors.bg};
              color: ${colors.text};
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
            `;

            classDiv.innerHTML = `
              <div style="font-size: 11px; font-weight: 700; margin-bottom: 2px; line-height: 1.1; color: #000000;">
                ${classInfo.course_code}
              </div>
              <div style="font-size: 9px; color: #000000; line-height: 1.1; font-weight: 500;">
                ${classInfo.venue}
              </div>
            `;

            dayCell.appendChild(classDiv);
          } else {
            // Empty cell
            const emptyDiv = document.createElement('div');
            emptyDiv.style.cssText = `
              height: 60px;
              padding: 4px;
              border: 1px solid #9ca3af;
              background: #f9fafb;
              display: flex;
              align-items: center;
              justify-content: center;
            `;
            dayCell.appendChild(emptyDiv);
          }

          row.appendChild(dayCell);
        });

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      exportContainer.appendChild(table);

      // Add to DOM temporarily
      document.body.appendChild(exportContainer);

      // Generate canvas
      const canvas = await html2canvas(exportContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1000,
        height: exportContainer.scrollHeight
      });

      // Remove from DOM
      document.body.removeChild(exportContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('timetable.pdf');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Export to Image
  const exportToImage = async () => {
    if (!timetableRef.current) return;
    
    setIsExporting(true);
    try {
      // Create a temporary container for table-style export
      const exportContainer = document.createElement('div');
      exportContainer.style.cssText = `
        width: 900px;
        background: white;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      // Add title
      const title = document.createElement('h1');
      title.textContent = 'My Timetable';
      title.style.cssText = `
        text-align: center;
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 20px;
        color: #1f2937;
      `;
      exportContainer.appendChild(title);

      // Add color key
      const colorKey = document.createElement('div');
      colorKey.style.cssText = `
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-bottom: 30px;
        flex-wrap: wrap;
      `;
      
      const classTypes = [
        { type: 'lecture', label: 'Lecture', color: '#dbeafe' },
        { type: 'tutorial', label: 'Tutorial', color: '#dcfce7' },
        { type: 'seminar', label: 'Seminar', color: '#e9d5ff' },
        { type: 'practical', label: 'Practical', color: '#fed7aa' }
      ];

      classTypes.forEach(({ type, label, color }) => {
        const keyItem = document.createElement('div');
        keyItem.style.cssText = `
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          background: ${color};
          border: 1px solid ${color.replace('aa', 'cc')};
        `;
        
        const colorBox = document.createElement('div');
        colorBox.style.cssText = `
          width: 12px;
          height: 12px;
          background: ${color};
          border: 1px solid ${color.replace('aa', 'cc')};
          border-radius: 2px;
        `;
        
        const labelText = document.createElement('span');
        labelText.textContent = label;
        labelText.style.cssText = `
          font-size: 12px;
          font-weight: 500;
        `;
        
        keyItem.appendChild(colorBox);
        keyItem.appendChild(labelText);
        colorKey.appendChild(keyItem);
      });
      
      exportContainer.appendChild(colorKey);

      // Create table
      const table = document.createElement('table');
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        border: 2px solid #374151;
      `;

      // Create table header
      const thead = document.createElement('thead');
      thead.style.cssText = `
        background: #f3f4f6;
        border-bottom: 2px solid #374151;
      `;

      const headerRow = document.createElement('tr');
      const headers = ['Time', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      
      headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.cssText = `
          padding: 12px 8px;
          text-align: center;
          font-weight: 700;
          color: #000000;
          border-right: 2px solid #374151;
          font-size: 12px;
          ${index === 0 ? 'width: 80px;' : 'width: 150px;'}
        `;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Create table body
      const tbody = document.createElement('tbody');

      timeSlots.forEach((time) => {
        const row = document.createElement('tr');
        row.style.cssText = `
          border-bottom: 1px solid #6b7280;
        `;

        // Time cell
        const timeCell = document.createElement('td');
        timeCell.textContent = time;
        timeCell.style.cssText = `
          padding: 8px;
          text-align: center;
          font-weight: 600;
          color: #000000;
          border-right: 2px solid #374151;
          background: #f9fafb;
          font-size: 11px;
        `;
        row.appendChild(timeCell);

        // Day cells
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        days.forEach(day => {
          const slotData = timetableState.data.find(slot => slot.time_slot === time);
          const classInfo = slotData?.[day as keyof TimetableSlot] as ClassInfo;
          
          const dayCell = document.createElement('td');
          dayCell.style.cssText = `
            padding: 0;
            border-right: 2px solid #374151;
            height: 80px;
            vertical-align: top;
          `;

          if (classInfo) {
            const classTypeColors = {
              lecture: { bg: '#dbeafe', border: '#1e40af', text: '#000000' },
              tutorial: { bg: '#dcfce7', border: '#166534', text: '#000000' },
              seminar: { bg: '#e9d5ff', border: '#7c3aed', text: '#000000' },
              practical: { bg: '#fed7aa', border: '#c2410c', text: '#000000' }
            };
            
            const colors = classTypeColors[classInfo.class_type];
            
            const classDiv = document.createElement('div');
            classDiv.style.cssText = `
              height: 80px;
              padding: 6px;
              border: 2px solid ${colors.border};
              background: ${colors.bg};
              color: ${colors.text};
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
            `;

            classDiv.innerHTML = `
              <div style="font-size: 12px; font-weight: 700; margin-bottom: 3px; line-height: 1.1; color: #000000;">
                ${classInfo.course_code}
              </div>
              <div style="font-size: 10px; color: #000000; line-height: 1.1; font-weight: 500;">
                ${classInfo.venue}
              </div>
            `;

            dayCell.appendChild(classDiv);
          } else {
            // Empty cell
            const emptyDiv = document.createElement('div');
            emptyDiv.style.cssText = `
              height: 80px;
              padding: 6px;
              border: 1px solid #9ca3af;
              background: #f9fafb;
              display: flex;
              align-items: center;
              justify-content: center;
            `;
            dayCell.appendChild(emptyDiv);
          }

          row.appendChild(dayCell);
        });

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      exportContainer.appendChild(table);

      // Add to DOM temporarily
      document.body.appendChild(exportContainer);

      // Generate canvas
      const canvas = await html2canvas(exportContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 900,
        height: exportContainer.scrollHeight
      });

      // Remove from DOM
      document.body.removeChild(exportContainer);
      
      const link = document.createElement('a');
      link.download = 'timetable.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error exporting to image:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Render class cell
  const renderClassCell = (classInfo: ClassInfo | undefined, day: string, time: string, duration: number = 1) => {
    const isFiltered = filteredType && filteredType !== classInfo?.class_type;
    const opacityClass = isFiltered ? 'opacity-50' : 'opacity-100';
    
    // Empty cell
    if (!classInfo) {
      return (
        <div
          className={`h-9 sm:h-12 p-1 border border-gray-300 cursor-pointer transition-all duration-200 flex flex-col justify-center hover:bg-gray-100 ${opacityClass}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleEmptyCellClick(time, day);
          }}
          title="Click 3 times to add class"
          style={{
            height: `${36 * duration}px`,
            minHeight: `${36 * duration}px`,
            backgroundColor: 'rgba(0,0,0,0.02)',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div className="h-full flex flex-col justify-center items-center text-gray-400 hover:text-gray-600">
            {/* Click counter hidden for production */}
          </div>
        </div>
      );
    }
    
    // Class cell
    const handleClassClick = () => {
      setSelectedClass(classInfo);
      setSelectedClassTime(time);
      setSelectedClassDay(day);
    };
    
    return (
      <div
        className={`h-9 sm:h-12 p-1 border border-gray-300 cursor-pointer transition-all duration-200 flex flex-col justify-center ${opacityClass}`}
        onClick={handleClassClick}
        title={`${classInfo.course_code} - ${classInfo.course_name}`}
        style={{
          height: `${36 * duration}px`,
          minHeight: `${36 * duration}px`
        }}
      >
        <div className={`${getClassTypeStyle(classInfo.class_type)} h-full flex flex-col justify-center`}>
          <div className="text-[8px] font-medium truncate leading-tight text-center">
            {classInfo.course_code}
          </div>
          <div className="text-[7px] truncate leading-tight text-gray-600 text-center">
            {classInfo.venue}
          </div>
        </div>
      </div>
    );
  };

  // Error state
  if (timetableState.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Timetable</h2>
            <p className="text-gray-600 mb-4">{timetableState.error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No courses guard modal
  if (showNoCourses) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl">No Courses Found</CardTitle>
            <CardDescription>
              You need to enroll or confirm your courses before using the Timetable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2">
              <Button onClick={() => navigate('/workplace')} className="bg-caluu-blue hover:bg-caluu-blue-light text-white">
                Go to Workplace
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="border-gray-300">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="w-full px-1 sm:px-2">
        {/* Header */}
        <div className="mb-6 mt-4">
          <div className="text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Calendar className="w-8 h-8 text-caluu-blue" />
              My Timetable
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <p className="text-gray-600">
                View your weekly class schedule
             
              </p>
              <Button
                onClick={() => setViewMode(viewMode === 'table' ? 'list' : 'table')}
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1 h-6"
              >
                {viewMode === 'table' ? 'List' : 'Table'}
              </Button>
            </div>
          </div>
        </div>

        {/* Color Filter for Table View */}
        {viewMode === 'table' && (
          <Card className="mb-3">
            <CardContent className="p-2">
              <div className="flex flex-wrap gap-2 text-xs justify-center">
                <button 
                  className={`flex items-center gap-2 px-2 py-1 rounded transition-all duration-200 ${
                    filteredType === 'lecture' ? 'bg-blue-200' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setFilteredType(filteredType === 'lecture' ? null : 'lecture')}
                >
                  <div className="w-3 h-3 bg-blue-200 border border-blue-300"></div>
                  <span className="text-[10px]">Lecture</span>
                </button>
                <button 
                  className={`flex items-center gap-2 px-2 py-1 rounded transition-all duration-200 ${
                    filteredType === 'tutorial' ? 'bg-green-200' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setFilteredType(filteredType === 'tutorial' ? null : 'tutorial')}
                >
                  <div className="w-3 h-3 bg-green-200 border border-green-300"></div>
                  <span className="text-[10px]">Tutorial</span>
                </button>
                <button 
                  className={`flex items-center gap-2 px-2 py-1 rounded transition-all duration-200 ${
                    filteredType === 'seminar' ? 'bg-purple-200' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setFilteredType(filteredType === 'seminar' ? null : 'seminar')}
                >
                  <div className="w-3 h-3 bg-purple-200 border border-purple-300"></div>
                  <span className="text-[10px]">Seminar</span>
                </button>
                <button 
                  className={`flex items-center gap-2 px-2 py-1 rounded transition-all duration-200 ${
                    filteredType === 'practical' ? 'bg-orange-200' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setFilteredType(filteredType === 'practical' ? null : 'practical')}
                >
                  <div className="w-3 h-3 bg-orange-200 border border-orange-300"></div>
                  <span className="text-[10px]">Practical</span>
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Day Filter for List View */}
        {viewMode === 'list' && (
          <Card className="mb-3">
            <CardContent className="p-2">
              <div className="flex flex-wrap gap-2 text-xs justify-center">
                <button 
                  className={`px-3 py-1 rounded transition-all duration-200 text-[10px] ${
                    filteredDay === 'monday' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilteredDay(filteredDay === 'monday' ? null : 'monday')}
                >
                  Mon
                </button>
                <button 
                  className={`px-3 py-1 rounded transition-all duration-200 text-[10px] ${
                    filteredDay === 'tuesday' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilteredDay(filteredDay === 'tuesday' ? null : 'tuesday')}
                >
                  Tue
                </button>
                <button 
                  className={`px-3 py-1 rounded transition-all duration-200 text-[10px] ${
                    filteredDay === 'wednesday' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilteredDay(filteredDay === 'wednesday' ? null : 'wednesday')}
                >
                  Wed
                </button>
                <button 
                  className={`px-3 py-1 rounded transition-all duration-200 text-[10px] ${
                    filteredDay === 'thursday' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilteredDay(filteredDay === 'thursday' ? null : 'thursday')}
                >
                  Thu
                </button>
                <button 
                  className={`px-3 py-1 rounded transition-all duration-200 text-[10px] ${
                    filteredDay === 'friday' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilteredDay(filteredDay === 'friday' ? null : 'friday')}
                >
                  Fri
                </button>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Timetable */}
        <Card className="overflow-hidden">
          {timetableState.loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading timetable...</span>
              </div>
            </div>
          )}
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div ref={timetableRef} className={`overflow-x-auto ${viewMode === 'list' ? 'hidden sm:block' : ''}`}>
              <table className="w-full text-xs min-w-[350px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-300">
                    <th className="w-14 p-1 text-center font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 text-[10px] border-r border-gray-300">Time</th>
                    <th className="w-12 p-1 text-center font-semibold text-gray-700 text-[10px] border-r border-gray-300">Mon</th>
                    <th className="w-12 p-1 text-center font-semibold text-gray-700 text-[10px] border-r border-gray-300">Tue</th>
                    <th className="w-12 p-1 text-center font-semibold text-gray-700 text-[10px] border-r border-gray-300">Wed</th>
                    <th className="w-12 p-1 text-center font-semibold text-gray-700 text-[10px] border-r border-gray-300">Thu</th>
                    <th className="w-12 p-1 text-center font-semibold text-gray-700 text-[10px]">Fri</th>
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, timeIndex) => {
                    const slotData = timetableState.data.find(slot => slot.time_slot === time);
                    
                    
                    // Check if this is a continuation of a multi-hour class
                    const isContinuation = (day: string) => {
                      if (!slotData?.[day as keyof TimetableSlot]) return false;
                      const classInfo = slotData[day as keyof TimetableSlot] as ClassInfo;
                      if (classInfo.duration <= 1) return false;
                      
                      // Check if this class started in a previous time slot
                      for (let i = 0; i < timeIndex; i++) {
                        const prevSlot = timetableState.data[i];
                        const prevClass = prevSlot?.[day as keyof TimetableSlot] as ClassInfo;
                        if (prevClass && prevClass.id === classInfo.id) {
                          return true;
                        }
                      }
                      return false;
                    };
                    
                    // Check if this is the first hour of a multi-hour class
                    const isFirstHour = (day: string) => {
                      if (!slotData?.[day as keyof TimetableSlot]) return false;
                      const classInfo = slotData[day as keyof TimetableSlot] as ClassInfo;
                      if (classInfo.duration <= 1) return true;
                      
                      // Check if this class appears in previous time slots
                      for (let i = 0; i < timeIndex; i++) {
                        const prevSlot = timetableState.data[i];
                        const prevClass = prevSlot?.[day as keyof TimetableSlot] as ClassInfo;
                        if (prevClass && prevClass.id === classInfo.id) {
                          return false;
                        }
                      }
                      return true;
                    };
                    
                    return (
                      <tr key={time} className="hover:bg-gray-50 border-b border-gray-300">
                        <td className="p-1 font-medium text-gray-600 sticky left-0 bg-white z-10 text-center text-[9px] border-r border-gray-300">{time}</td>
                        <td className="p-0 border-r border-gray-300">
                          {renderClassCell(slotData?.monday, 'monday', time, slotData?.monday?.duration)}
                        </td>
                        <td className="p-0 border-r border-gray-300">
                          {renderClassCell(slotData?.tuesday, 'tuesday', time, slotData?.tuesday?.duration)}
                        </td>
                        <td className="p-0 border-r border-gray-300">
                          {renderClassCell(slotData?.wednesday, 'wednesday', time, slotData?.wednesday?.duration)}
                        </td>
                        <td className="p-0 border-r border-gray-300">
                          {renderClassCell(slotData?.thursday, 'thursday', time, slotData?.thursday?.duration)}
                        </td>
                        <td className="p-0">
                          {renderClassCell(slotData?.friday, 'friday', time, slotData?.friday?.duration)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className={`${viewMode === 'list' ? 'block sm:hidden' : 'hidden'} p-2`}>
              <div className="space-y-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => {
                  // Apply day filtering
                  if (filteredDay && filteredDay !== day) return null;
                  
                  const dayClasses = timetableState.data
                    .map(slot => ({
                      time: slot.time_slot,
                      class: slot[day as keyof TimetableSlot] as ClassInfo
                    }))
                    .filter(item => item.class)
                    .sort((a, b) => a.time.localeCompare(b.time));

                  if (dayClasses.length === 0) return null;

                  return (
                    <div key={day} className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-700 capitalize border-b border-gray-200 pb-1">
                        {day}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {dayClasses.map(({ time, class: classInfo }) => (
                          <div
                            key={`${time}-${day}`}
                            className={`p-2 border border-gray-300 cursor-pointer transition-all duration-200 ${getClassTypeStyle(classInfo!.class_type)}`}
                            onClick={() => {
                              setSelectedClass(classInfo!);
                              setSelectedClassTime(time);
                              setSelectedClassDay(day);
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium">{time}</span>
                                <Badge variant="outline" className="text-[8px] px-1 py-0">
                                  {classInfo!.class_type.charAt(0).toUpperCase() + classInfo!.class_type.slice(1)}
                                </Badge>
                              </div>
                              <span className="text-xs">
                                {getClassTypeIcon(classInfo!.class_type)}
                              </span>
                            </div>
                            <div className="text-xs font-medium truncate">{classInfo!.course_code}</div>
                            <div className="text-[10px] text-gray-600 truncate mb-1">{classInfo!.course_name}</div>
                            <div className="text-[9px] text-gray-500">
                              <div>📍 {classInfo!.venue}</div>
                              <div>👨‍🏫 {classInfo!.instructor}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Buttons */}
        <div className="mt-4 flex gap-2 justify-center">
          <Button
            onClick={exportToPDF}
            disabled={isExporting}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'PDF'}
          </Button>
          <Button
            onClick={exportToImage}
            disabled={isExporting}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Image'}
          </Button>
      
                </div>


        {/* Add Class Confirmation Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Class
                </CardTitle>
                <CardDescription>
                  Add a new class session for {pendingDay.charAt(0).toUpperCase() + pendingDay.slice(1)} at {pendingTime}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 pt-4">
                  <Button
                    onClick={handleConfirmAddClass}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Class
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setPendingTime('');
                      setPendingDay('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Class Details Modal */}
        {(selectedClass || isAddingNew) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {isAddingNew ? 'Add New Class' : (isEditing ? 'Edit Class' : selectedClass?.course_code)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!isEditing && selectedClass && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditClass}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedClass(null);
                        setSelectedClassTime('');
                        setSelectedClassDay('');
                        setIsEditing(false);
                        setIsAddingNew(false);
                        setEditingClass({});
                        setSelectedCourseId('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {isAddingNew ? 'Fill in the details for the new class session' : 
                   isEditing ? 'Edit the class details below' : 
                   selectedClass?.course_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  // Edit Form
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Select Course</label>
                      <select
                        value={selectedCourseId}
                        onChange={(e) => {
                          setSelectedCourseId(e.target.value);
                          const selectedCourse = courses.find(c => c.id === e.target.value);
                          if (selectedCourse) {
                            setEditingClass(prev => ({
                              ...prev,
                              course_code: selectedCourse.code,
                              course_name: selectedCourse.name
                            }));
                          }
                        }}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a course...</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.code} - {course.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Course Code</label>
                        <input
                          type="text"
                          value={editingClass.course_code || ''}
                          onChange={(e) => setEditingClass(prev => ({ ...prev, course_code: e.target.value }))}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., CS101"
                          readOnly={!!selectedCourseId}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Class Type</label>
                        <select
                          value={editingClass.class_type || 'lecture'}
                          onChange={(e) => setEditingClass(prev => ({ ...prev, class_type: e.target.value as ClassInfo['class_type'] }))}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="lecture">Lecture</option>
                          <option value="tutorial">Tutorial</option>
                          <option value="seminar">Seminar</option>
                          <option value="practical">Practical</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Course Name</label>
                      <input
                        type="text"
                        value={editingClass.course_name || ''}
                        onChange={(e) => setEditingClass(prev => ({ ...prev, course_name: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Introduction to Programming"
                        readOnly={!!selectedCourseId}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Venue</label>
                        <input
                          type="text"
                          value={editingClass.venue || ''}
                          onChange={(e) => setEditingClass(prev => ({ ...prev, venue: e.target.value }))}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., A101"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Duration (hours)</label>
                        <input
                          type="number"
                          min="1"
                          max="3"
                          value={editingClass.duration || 1}
                          onChange={(e) => setEditingClass(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Instructor</label>
                      <input
                        type="text"
                        value={editingClass.instructor || ''}
                        onChange={(e) => setEditingClass(prev => ({ ...prev, instructor: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Dr. Smith"
                      />
                    </div>
                    
                
                    
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <Button
                        onClick={handleSaveClass}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4" />
                        {isAddingNew ? 'Add Class' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setIsAddingNew(false);
                          setEditingClass({});
                          setSelectedCourseId('');
                        }}
                      >
                        Cancel
                      </Button>
                      {!isAddingNew && selectedClass && (
                        <Button
                          variant="destructive"
                          onClick={handleDeleteClass}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getClassTypeStyle(selectedClass!.class_type)}>
                        {selectedClass!.class_type.charAt(0).toUpperCase() + selectedClass!.class_type.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {getClassTypeIcon(selectedClass!.class_type)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Time:</span>
                        <span>{selectedClassTime} ({selectedClassDay.charAt(0).toUpperCase() + selectedClassDay.slice(1)})</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Venue:</span>
                        <span>{selectedClass!.venue}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Duration:</span>
                        <span>{selectedClass!.duration} hour{selectedClass!.duration > 1 ? 's' : ''}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Instructor:</span>
                        <span>{selectedClass!.instructor}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timetable;
