import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  BarChart3,
  BookOpen,
  Quote,
  Images,
  GraduationCap,
  FileSpreadsheet,
  LayoutDashboard,
  Sparkles,
  Bell,
  Megaphone,
  MessageSquareMore,
  Newspaper,
  Building2,
  TrendingUp,
  Activity,
  UserCheck,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { fetchMyRoles, assignAmbassador, revokeAmbassador, fetchUniversities, StaffRoles, SimpleUniversity } from '@/services/staffService';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

const StaffDashboard: React.FC = () => {
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<StaffRoles | null>(null);
  const [userId, setUserId] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [search, setSearch] = useState('');
  const [universities, setUniversities] = useState<SimpleUniversity[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyRoles();
        setRoles(data);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchUniversities();
        setUniversities(list);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const kpis = useMemo(() => ([
    { label: 'Active Students', value: '1.2k' },
    { label: 'Articles', value: '42' },
    { label: 'Slides', value: '7' },
    { label: 'Quotes', value: '18' },
  ]), []);

  const usageTrend = useMemo(() => ([
    { month: 'May', usage: 320 },
    { month: 'Jun', usage: 410 },
    { month: 'Jul', usage: 520 },
    { month: 'Aug', usage: 680 },
  ]), []);

  const contentStats = useMemo(() => ([
    { name: 'Articles', count: 42 },
    { name: 'Quotes', count: 18 },
    { name: 'Slides', count: 7 },
    { name: 'Announcements', count: 9 },
  ]), []);

  const [tab, setTab] = useState<'overview' | 'workplace' | 'ambassadors'>('overview');
  const [ambTab, setAmbTab] = useState<'amb-overview' | 'amb-workplace'>('amb-overview');
  const touchStartXRef = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartXRef.current;
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const threshold = 50; // px
    if (Math.abs(dx) > threshold) {
      // Determine next/prev for main tabs
      const order: Array<'overview' | 'workplace' | 'ambassadors'> = ['overview', 'workplace', 'ambassadors'];
      const idx = order.indexOf(tab);
      if (dx < 0 && idx < order.length - 1) setTab(order[idx + 1]);
      if (dx > 0 && idx > 0) setTab(order[idx - 1]);
    }
    touchStartXRef.current = null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-96 right-20 w-80 h-80 bg-gradient-to-r from-emerald-400/8 to-teal-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-64 h-64 bg-gradient-to-r from-orange-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <LayoutDashboard className="w-8 h-8 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">Staff Dashboard</h1>
              <p className="text-slate-600 text-sm sm:text-base">Manage students, content, and ambassadors</p>
            </div>
          </div>

          {/* Quick Stats Badge */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-100 shadow-sm">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-700">Active</span>
          </div>
        </div>

        {/* Enhanced KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {kpis.map((k, index) => (
            <Card key={k.label} className="group bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${index === 0 ? 'bg-blue-100' : index === 1 ? 'bg-emerald-100' : index === 2 ? 'bg-purple-100' : 'bg-orange-100'}`}>
                    {index === 0 ? <Users className="w-4 h-4 text-blue-600" /> :
                     index === 1 ? <BookOpen className="w-4 h-4 text-emerald-600" /> :
                     index === 2 ? <Images className="w-4 h-4 text-purple-600" /> :
                     <Quote className="w-4 h-4 text-orange-600" />}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">{k.label}</div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{k.value}</div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all duration-1000 ${index === 0 ? 'bg-blue-500 w-3/4' : index === 1 ? 'bg-emerald-500 w-2/3' : index === 2 ? 'bg-purple-500 w-1/2' : 'bg-orange-500 w-4/5'}`}></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={tab} onValueChange={(v)=>setTab(v as typeof tab)} className="w-full">
          <TabsList className="grid grid-cols-3 w-full bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm h-12">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-200">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="workplace" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-200">
              <Building2 className="w-4 h-4 mr-2" />
              Workplace
            </TabsTrigger>
            <TabsTrigger value="ambassadors" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-200">
              <UserCheck className="w-4 h-4 mr-2" />
              Ambassadors
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border border-white/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 xl:col-span-2 group">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    Usage Trend
                  </CardTitle>
                  <CardDescription className="text-sm">Recent activity across staff modules</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="month"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="usage"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#3b82f6' }}
                        activeDot={{ r: 7, fill: '#1d4ed8' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-white/50 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                      <BarChart3 className="w-5 h-5 text-emerald-600" />
                    </div>
                    Content Mix
                  </CardTitle>
                  <CardDescription className="text-sm">Distribution of managed content</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contentStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="count" fill="#10b981" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Activity Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500 rounded-full">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Active Students</p>
                      <p className="text-2xl font-bold text-blue-900">1,247</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500 rounded-full">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 font-medium">Tasks Completed</p>
                      <p className="text-2xl font-bold text-emerald-900">89</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500 rounded-full">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Content Created</p>
                      <p className="text-2xl font-bold text-purple-900">156</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Workplace */}
          <TabsContent value="workplace" className="mt-6">
            <Card className="bg-white/90 backdrop-blur-sm border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  Management Hub
                </CardTitle>
                <CardDescription className="text-base">Access all staff management tools and features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Students Management */}
                  <Button
                    variant="outline"
                    className="group h-auto p-6 justify-start bg-white/80 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 hover:scale-105"
                    onClick={()=>navigate('/staff/students')}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-slate-900">Students</div>
                        <div className="text-sm text-slate-600">Manage student data</div>
                      </div>
                    </div>
                  </Button>

                  {/* Chatbot */}
                  <Button
                    variant="outline"
                    className="group h-auto p-6 justify-start bg-white/80 hover:bg-purple-50 hover:border-purple-200 transition-all duration-300 hover:scale-105"
                    onClick={()=>navigate('/chatbot')}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                        <MessageSquareMore className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-slate-900">AI Assistant</div>
                        <div className="text-sm text-slate-600">Chat with Mr. Caluu</div>
                      </div>
                    </div>
                  </Button>

                  {/* University Management */}
                  <Button
                    variant="outline"
                    className="group h-auto p-6 justify-start bg-white/80 hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300 hover:scale-105"
                    onClick={()=>navigate('/staff/university')}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                        <Building2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-slate-900">Universities</div>
                        <div className="text-sm text-slate-600">Manage institutions</div>
                      </div>
                    </div>
                  </Button>

                  {/* Articles */}
                  <Button
                    variant="outline"
                    className="group h-auto p-6 justify-start bg-white/80 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 hover:scale-105"
                    onClick={()=>navigate('/staff/articles')}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                        <Newspaper className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-slate-900">Articles</div>
                        <div className="text-sm text-slate-600">Educational content</div>
                      </div>
                    </div>
                  </Button>

                  {/* Slides */}
                  <Button
                    variant="outline"
                    className="group h-auto p-6 justify-start bg-white/80 hover:bg-pink-50 hover:border-pink-200 transition-all duration-300 hover:scale-105"
                    onClick={()=>navigate('/staff/slides')}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="p-3 bg-pink-100 rounded-xl group-hover:bg-pink-200 transition-colors">
                        <Images className="w-6 h-6 text-pink-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-slate-900">Slides</div>
                        <div className="text-sm text-slate-600">Presentation content</div>
                      </div>
                    </div>
                  </Button>

                  {/* Quotes */}
                  <Button
                    variant="outline"
                    className="group h-auto p-6 justify-start bg-white/80 hover:bg-amber-50 hover:border-amber-200 transition-all duration-300 hover:scale-105"
                    onClick={()=>navigate('/staff/quotes')}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                        <Quote className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-slate-900">Quotes</div>
                        <div className="text-sm text-slate-600">Inspirational content</div>
                      </div>
                    </div>
                  </Button>

                  {/* Notifications */}
                  <Button
                    variant="outline"
                    className="group h-auto p-6 justify-start bg-white/80 hover:bg-red-50 hover:border-red-200 transition-all duration-300 hover:scale-105"
                    onClick={()=>navigate('/staff/notifications')}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                        <Bell className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-slate-900">Notifications</div>
                        <div className="text-sm text-slate-600">System alerts</div>
                      </div>
                    </div>
                  </Button>

                  {/* Announcements */}
                  <Button
                    variant="outline"
                    className="group h-auto p-6 justify-start bg-white/80 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300 hover:scale-105"
                    onClick={()=>navigate('/admin/send-email')}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
                        <Megaphone className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-slate-900">Announcements</div>
                        <div className="text-sm text-slate-600">Broadcast messages</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ambassadors */}
          <TabsContent value="ambassadors" className="mt-6">
            <Tabs value={ambTab} onValueChange={(v)=>setAmbTab(v as typeof ambTab)} className="w-full">
              <TabsList className="grid grid-cols-2 w-full bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm h-12 mb-6">
                <TabsTrigger value="amb-overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-200">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="amb-workplace" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-200">
                  <Building2 className="w-4 h-4 mr-2" />
                  Management
                </TabsTrigger>
              </TabsList>
              <TabsContent value="amb-overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* My Roles Card */}
                  {roles && (
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg">
                          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                            <Shield className="w-5 h-5 text-blue-600" />
                          </div>
                          My Roles & Permissions
                        </CardTitle>
                        <CardDescription className="text-sm">Your current staff access levels</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${roles?.is_admin ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="font-medium">Administrator</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roles?.is_admin ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {roles?.is_admin ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${roles?.is_ambassador ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                            <span className="font-medium">University Ambassador</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roles?.is_ambassador ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {roles?.is_ambassador ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {roles?.ambassador_university_ids && roles.ambassador_university_ids.length > 0 && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 mb-2">Assigned Universities:</p>
                            <div className="flex flex-wrap gap-2">
                              {roles.ambassador_university_ids.map((id, index) => (
                                <span key={id} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-mono">
                                  {id}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Ambassador Management Card */}
                  {roles?.is_admin && (
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/50 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 group">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg">
                          <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                            <UserCheck className="w-5 h-5 text-emerald-600" />
                          </div>
                          Ambassador Management
                        </CardTitle>
                        <CardDescription className="text-sm">Assign or revoke ambassador permissions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">User ID</label>
                            <Input
                              value={userId}
                              onChange={(e) => setUserId(e.target.value)}
                              placeholder="Enter user UUID"
                              className="bg-slate-50 border-slate-200 focus:bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">University</label>
                            <Select value={universityId} onValueChange={setUniversityId}>
                              <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white">
                                <SelectValue placeholder="Select university" />
                              </SelectTrigger>
                              <SelectContent>
                                {universities.map(u => (
                                  <SelectItem key={u.id} value={u.id}>
                                    {u.name}{u.country ? ` — ${u.country}` : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            disabled={!userId || !universityId}
                            onClick={async () => {
                              try {
                                if (!userId || !universityId) return;
                                await assignAmbassador(userId, universityId);
                                toastSuccess({ title: 'Ambassador assigned successfully' });
                              } catch {
                                toastError({ title: 'Failed to assign ambassador' });
                              }
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Assign Ambassador
                          </Button>
                          <Button
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            disabled={!userId || !universityId}
                            onClick={async () => {
                              try {
                                if (!userId || !universityId) return;
                                await revokeAmbassador(userId, universityId);
                                toastSuccess({ title: 'Ambassador revoked successfully' });
                              } catch {
                                toastError({ title: 'Failed to revoke ambassador' });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Revoke Access
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="amb-workplace" className="space-y-6">
                <Card className="bg-white/90 backdrop-blur-sm border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      Ambassador Management Hub
                    </CardTitle>
                    <CardDescription className="text-base">Access ambassador-specific management tools</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Students Management */}
                      <Button
                        variant="outline"
                        className="group h-auto p-6 justify-start bg-white/80 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 hover:scale-105"
                        onClick={()=>navigate('/staff/students')}
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-semibold text-slate-900">Students</div>
                            <div className="text-sm text-slate-600">Manage student data</div>
                          </div>
                        </div>
                      </Button>

                      {/* Chatbot */}
                      <Button
                        variant="outline"
                        className="group h-auto p-6 justify-start bg-white/80 hover:bg-purple-50 hover:border-purple-200 transition-all duration-300 hover:scale-105"
                        onClick={()=>navigate('/chatbot')}
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                            <MessageSquareMore className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-semibold text-slate-900">AI Assistant</div>
                            <div className="text-sm text-slate-600">Chat with Mr. Caluu</div>
                          </div>
                        </div>
                      </Button>

                      {/* University Management */}
                      <Button
                        variant="outline"
                        className="group h-auto p-6 justify-start bg-white/80 hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300 hover:scale-105"
                        onClick={()=>navigate('/staff/university')}
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                            <Building2 className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-semibold text-slate-900">Universities</div>
                            <div className="text-sm text-slate-600">Manage institutions</div>
                          </div>
                        </div>
                      </Button>

                      {/* Articles */}
                      <Button
                        variant="outline"
                        className="group h-auto p-6 justify-start bg-white/80 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 hover:scale-105"
                        onClick={()=>navigate('/staff/articles')}
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                            <Newspaper className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-semibold text-slate-900">Articles</div>
                            <div className="text-sm text-slate-600">Educational content</div>
                          </div>
                        </div>
                      </Button>

                      {/* Slides */}
                      <Button
                        variant="outline"
                        className="group h-auto p-6 justify-start bg-white/80 hover:bg-pink-50 hover:border-pink-200 transition-all duration-300 hover:scale-105"
                        onClick={()=>navigate('/staff/slides')}
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="p-3 bg-pink-100 rounded-xl group-hover:bg-pink-200 transition-colors">
                            <Images className="w-6 h-6 text-pink-600" />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-semibold text-slate-900">Slides</div>
                            <div className="text-sm text-slate-600">Presentation content</div>
                          </div>
                        </div>
                      </Button>

                      {/* Quotes */}
                      <Button
                        variant="outline"
                        className="group h-auto p-6 justify-start bg-white/80 hover:bg-amber-50 hover:border-amber-200 transition-all duration-300 hover:scale-105"
                        onClick={()=>navigate('/staff/quotes')}
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                            <Quote className="w-6 h-6 text-amber-600" />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-semibold text-slate-900">Quotes</div>
                            <div className="text-sm text-slate-600">Inspirational content</div>
                          </div>
                        </div>
                      </Button>

                      {/* Notifications */}
                      <Button
                        variant="outline"
                        className="group h-auto p-6 justify-start bg-white/80 hover:bg-red-50 hover:border-red-200 transition-all duration-300 hover:scale-105"
                        onClick={()=>navigate('/staff/notifications')}
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                            <Bell className="w-6 h-6 text-red-600" />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-semibold text-slate-900">Notifications</div>
                            <div className="text-sm text-slate-600">System alerts</div>
                          </div>
                        </div>
                      </Button>

                      {/* Announcements */}
                      <Button
                        variant="outline"
                        className="group h-auto p-6 justify-start bg-white/80 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300 hover:scale-105"
                        onClick={()=>navigate('/admin/send-email')}
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
                            <Megaphone className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-semibold text-slate-900">Announcements</div>
                            <div className="text-sm text-slate-600">Broadcast messages</div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StaffDashboard;


