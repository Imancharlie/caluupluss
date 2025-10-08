import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building2, GraduationCap, BookOpen, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaffUniversity: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-caluu-blue rounded-full shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">University Management</h1>
            <p className="text-gray-600">Manage universities, colleges, programs and courses</p>
          </div>
        </div>

        <Card className="bg-white border-gray-200 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Search</CardTitle>
            <CardDescription>Find universities, colleges or programs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input className="pl-9" placeholder="Search university/college/program..." />
              </div>
              <Button className="bg-caluu-blue text-white w-full sm:w-auto">Search</Button>
              <Button className="bg-green-600 text-white w-full sm:w-auto" onClick={() => navigate('/workplace')}>
                <Plus className="w-4 h-4 mr-1" /> Open Workspace
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-gray-200 shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Universities</CardTitle>
              <CardDescription>Create and manage universities</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button className="bg-caluu-blue text-white" onClick={() => navigate('/workplace')}>Manage</Button>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Colleges & Programs</CardTitle>
              <CardDescription>Manage organizational hierarchy</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" disabled>Manage</Button>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Courses</CardTitle>
              <CardDescription>Manage courses catalog</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" disabled>Manage</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffUniversity;


