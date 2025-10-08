import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Mail, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Database,
  BookOpen,
  Building,
  MessageSquare,
  Calendar,
  Search,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from 'sonner';
import academicApi from '@/services/academicApi';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface StatCardProps {
  title: string;
  count: number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  className?: string;
  onClick?: () => void;
}

const StatCard = ({ title, count, icon: Icon, trend, trendValue, className, onClick }: StatCardProps) => (
  <div 
    className={`bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-white/20 ${className || ''} ${onClick ? 'cursor-pointer hover:bg-white/20 transition-all duration-300' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-white/70 text-xs md:text-sm">{title}</p>
        <p className="text-2xl md:text-3xl font-bold text-white">{count?.toLocaleString() || 0}</p>
        {trend && trendValue && (
          <div className={`flex items-center mt-1 md:mt-2 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp size={14} className="md:w-4 md:h-4" /> : <TrendingDown size={14} className="md:w-4 md:h-4" />}
            <span className="ml-1 text-xs md:text-sm">{trendValue}%</span>
          </div>
        )}
      </div>
      <Icon size={32} className="text-white/50 md:w-10 md:h-10" />
    </div>
  </div>
);

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    counts: {
      user_count: 0,
      data_count: 0,
      program_count: 0,
      college_count: 0,
      course_count: 0,
      feedback_count: 0,
      confirmed_count: 0
    },
    usageData: [],
    dataByYear: [],
    programsByCollege: [],
    recent_activities: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [uniName, setUniName] = useState('');
  const [uniCountry, setUniCountry] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [collegeUniversityId, setCollegeUniversityId] = useState('');

  useEffect(() => {
    // Check authentication status first
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('AdminPanel loaded');
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!user);
    
    if (!token || !user) {
      console.log('No authentication found, redirecting to login');
      toast.error('Please log in to access the admin panel');
      navigate('/login');
      return;
    }
    
    // If authenticated, fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const { data } = await api.get('/admin/dashboard/');
      
      // Ensure the data structure matches our expected format
      setDashboardData({
        counts: data.counts || {
          user_count: 0,
          data_count: 0,
          program_count: 0,
          college_count: 0,
          course_count: 0,
          feedback_count: 0,
          confirmed_count: 0
        },
        usageData: data.usageData || [],
        dataByYear: data.dataByYear || [],
        programsByCollege: data.programsByCollege || [],
        recent_activities: data.recent_activities || []
      });
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        toast.error('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const { data } = await api.get(`/admin/search/`, { params: { q: searchQuery } });
      console.log('Search results:', data);
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('Search failed');
    }
  };

  const QuickAction = ({ title, description, onClick, icon: Icon }) => (
    <div 
      className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
      onClick={onClick}
    >
      <div className="flex items-center mb-3">
        <Icon size={24} className="text-white mr-3" />
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <p className="text-white/70">{description}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-caluu-blue-dark flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-white mb-4" size={48} />
          <p className="text-white text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-caluu-blue-dark p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/70">Welcome back, Admin</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
              <input
                type="text"
                placeholder="Search courses, programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full md:w-auto bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <button
              onClick={fetchDashboardData}
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-2 text-white transition-colors"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard 
            title="Total Users" 
            count={dashboardData.counts.user_count} 
            icon={Users}
          />
          <StatCard 
            title="Data Entries" 
            count={dashboardData.counts.data_count} 
            icon={Database}
          />
          <StatCard 
            title="Programs" 
            count={dashboardData.counts.program_count} 
            icon={BookOpen}
            className="hidden md:block"
          />
          <StatCard 
            title="Colleges" 
            count={dashboardData.counts.college_count} 
            icon={Building}
            className="hidden md:block"
          />
          <StatCard 
            title="Courses" 
            count={dashboardData.counts.course_count} 
            icon={Calendar}
            className="hidden md:block"
          />
          <StatCard 
            title="Feedback" 
            count={dashboardData.counts.feedback_count} 
            icon={MessageSquare}
            onClick={() => window.open('https://caluu.pythonanywhere.com/dashboard_feedback//', '_blank')}
          />
          <StatCard 
            title="Confirmed Years" 
            count={dashboardData.counts.confirmed_count} 
            icon={BookOpen}
            className="hidden md:block"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Usage Trend Chart */}
          <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-white/20">
            <h3 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="mr-2" size={20} />
              Usage Trend (Last 4 Months)
            </h3>
            <div className="h-48 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#4F46E5" 
                    strokeWidth={3}
                    dot={{ fill: '#4F46E5', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        {/* Top 6 Programs with Highest Usage Chart */}
<div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
    <BarChart3 className="mr-2" size={20} />
    Top 6 Programs by Usage
  </h3>
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={dashboardData.programsByCollege}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis
          dataKey="program__name"
          stroke="rgba(255,255,255,0.7)"
          angle={-45}
          textAnchor="end"
          height={100}
          fontSize={12}
        />
        <YAxis stroke="rgba(255,255,255,0.7)" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            border: 'none',
            borderRadius: '8px',
            color: 'white'
          }}
          formatter={(value, name) => [value, 'Usage Count']}
          labelFormatter={(label) => `Program: ${label}`}
        />
        <Bar dataKey="total" fill="#10B981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
  {/* Optional: Show college info in a subtle way */}
  <div className="mt-4 text-sm text-white/60">
    Showing programs with highest data usage across all colleges
  </div>
</div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <QuickAction
              title="Send Email to Users"
              description="Send announcements and updates to all users"
              icon={Mail}
              onClick={() => navigate('/admin/send-email')}
            />
            <QuickAction
              title="Content Management"
              description="Manage courses, programs, and colleges"
              icon={BookOpen}
              onClick={() => window.open('https://caluu.pythonanywhere.com/admin_site/', '_blank')}
            />
            {/* Create University */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-3">Create University</h3>
              <div className="space-y-3">
                <input
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                  placeholder="University name"
                  value={uniName}
                  onChange={(e) => setUniName(e.target.value)}
                />
                <input
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                  placeholder="Country"
                  value={uniCountry}
                  onChange={(e) => setUniCountry(e.target.value)}
                />
                <button
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-white"
                  onClick={async () => {
                    try {
                      if (!uniName.trim() || !uniCountry.trim()) {
                        toast.error('Name and country are required');
                        return;
                      }
                      const created = await academicApi.createUniversity({ name: uniName.trim(), country: uniCountry.trim() });
                      toastSuccess({ title: `University created: ${created.name}` });
                      setUniName('');
                      setUniCountry('');
                    } catch (err: any) {
                      const msg = err?.response?.data?.error || err?.response?.data?.detail || 'Failed to create university';
                      toast.error(msg);
                    }
                  }}
                >
                  Create
                </button>
              </div>
            </div>

            {/* Create College */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-3">Create College</h3>
              <div className="space-y-3">
                <input
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                  placeholder="College name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                />
                <input
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                  placeholder="University ID (UUID)"
                  value={collegeUniversityId}
                  onChange={(e) => setCollegeUniversityId(e.target.value)}
                />
                <button
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-white"
                  onClick={async () => {
                    try {
                      if (!collegeName.trim() || !collegeUniversityId.trim()) {
                        toast.error('Name and university ID are required');
                        return;
                      }
                      const created = await academicApi.createCollege({ name: collegeName.trim(), university: collegeUniversityId.trim() });
                      toastSuccess({ title: `College created: ${created.name}` });
                      setCollegeName('');
                      setCollegeUniversityId('');
                    } catch (err: any) {
                      const msg = err?.response?.data?.error || err?.response?.data?.detail || 'Failed to create college';
                      toast.error(msg);
                    }
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-white/20">
          <h3 className="text-lg md:text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {dashboardData.recent_activities.map((activity, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-white/10 last:border-b-0 gap-2">
                <span className="text-white text-sm md:text-base">{activity.action}</span>
                <span className="text-white/50 text-xs md:text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;