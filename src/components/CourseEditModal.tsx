import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: 'core' | 'elective';
  semester: number;
  year: number;
  program: string;
  program_name: string;
}

interface CourseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onSave: (courses: Course[]) => void;
  programName: string;
  year: number;
    semester: number;
}

const CourseEditModal: React.FC<CourseEditModalProps> = ({
  isOpen,
  onClose,
  courses,
  onSave,
  programName,
  year,
  semester
}) => {
  const [editedCourses, setEditedCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState({ code: '', name: '', credits: 0, type: 'core' as 'core' | 'elective' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEditedCourses([...courses]);
    }
  }, [isOpen, courses]);

  const handleAddCourse = () => {
    if (newCourse.code && newCourse.name && newCourse.credits > 0) {
      const course: Course = {
        id: `temp-${Date.now()}`,
        code: newCourse.code,
        name: newCourse.name,
        credits: newCourse.credits,
        type: newCourse.type,
        program: '',
        program_name: programName,
        year: year,
        semester: semester
      };
      
      setEditedCourses(prev => [...prev, course]);
      setNewCourse({ code: '', name: '', credits: 0, type: 'core' });
      setShowAddForm(false);
      toast.success('Course added!');
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setNewCourse({
      code: course.code,
      name: course.name,
      credits: course.credits,
      type: course.type
    });
    setShowAddForm(true);
  };

  const handleUpdateCourse = () => {
    if (editingCourse && newCourse.code && newCourse.name && newCourse.credits > 0) {
      setEditedCourses(prev => prev.map(c => 
        c.id === editingCourse.id 
          ? { ...c, code: newCourse.code, name: newCourse.name, credits: newCourse.credits, type: newCourse.type }
          : c
      ));
      setEditingCourse(null);
      setNewCourse({ code: '', name: '', credits: 0, type: 'core' });
      setShowAddForm(false);
      toast.success('Course updated!');
    }
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    setNewCourse({ code: '', name: '', credits: 0, type: 'core' });
    setShowAddForm(false);
  };

  const handleDeleteCourse = (courseId: string) => {
    setEditedCourses(prev => prev.filter(c => c.id !== courseId));
    toast.success('Course removed!');
  };

  const handleSave = () => {
    onSave(editedCourses);
    onClose();
  };

  const coreCourses = editedCourses.filter(c => c.type === 'core');
  const electiveCourses = editedCourses.filter(c => c.type === 'elective');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Courses</DialogTitle>
          <DialogDescription>
            Manage your courses for {programName} - Year {year}, Semester {semester}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Course Form */}
          {showAddForm && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                    <X className="w-4 h-4" />
            </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                    placeholder="Course Code"
                    className="text-xs h-8"
                  />
                  <Input
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                    placeholder="Course Name"
                    className="text-xs h-8"
                  />
                  <Input
                      type="number"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 0 })}
                    placeholder="Credits"
                    className="text-xs h-8"
                  />
                  <Select
                    value={newCourse.type}
                    onValueChange={(value: 'core' | 'elective') => setNewCourse({ ...newCourse, type: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="core">Core</SelectItem>
                      <SelectItem value="elective">Elective</SelectItem>
                    </SelectContent>
                  </Select>
                  </div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    onClick={editingCourse ? handleUpdateCourse : handleAddCourse} 
                    className="bg-green-600 hover:bg-green-700 text-xs h-7 px-3"
                    size="sm"
                  >
                    {editingCourse ? 'Update' : 'Add'}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} className="text-xs h-7 px-3" size="sm">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Core Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Core Courses ({coreCourses.length})
              </h3>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Core
              </Button>
            </div>
            <div className="space-y-1">
              {coreCourses.map((course) => (
                <div key={course.id} className="bg-green-50 border border-green-200 rounded-md p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-900 flex-shrink-0">{course.code}</span>
                        <span className="text-xs text-gray-600 truncate max-w-[180px]">{course.name}</span>
                        
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
                        onClick={() => handleEditCourse(course)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-600 hover:bg-red-100"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Elective Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Elective Courses ({electiveCourses.length})
              </h3>
            <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowAddForm(true)}
            >
                <Plus className="w-4 h-4 mr-1" />
                Add Elective
            </Button>
            </div>
            <div className="space-y-1">
              {electiveCourses.map((course) => (
                <div key={course.id} className="bg-blue-50 border border-blue-200 rounded-md p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-900 flex-shrink-0">{course.code}</span>
                        <span className="text-xs text-gray-600 truncate max-w-[200px]">{course.name}</span>
                        
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
                        onClick={() => handleEditCourse(course)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-600 hover:bg-red-100"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-caluu-blue hover:bg-caluu-blue-light text-white">
            <Save className="w-4 h-4 mr-1" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CourseEditModal;