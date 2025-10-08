import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Quote, Plus, Edit, Trash2, Search } from 'lucide-react';

const StaffQuotes: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-caluu-blue rounded-full shadow-lg">
            <Quote className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quotes Management</h1>
            <p className="text-gray-600">Create, edit, and manage inspirational quotes</p>
          </div>
        </div>

        <Card className="bg-white border-gray-200 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Search</CardTitle>
            <CardDescription>Find quotes by text or author</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input className="pl-9" placeholder="Search quotes..." />
              </div>
              <Button className="bg-caluu-blue text-white w-full sm:w-auto">Search</Button>
              <Button className="bg-green-600 text-white w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-1" /> New Quote
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-white border-gray-200 shadow-sm lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Results</CardTitle>
              <CardDescription>Quotes list (wire to API next)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">No data yet. Implement API in the next step.</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
              <CardDescription>Actions for selected quote</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline"><Edit className="w-4 h-4 mr-1" /> Edit</Button>
              <Button variant="outline" className="text-red-600"><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffQuotes;


