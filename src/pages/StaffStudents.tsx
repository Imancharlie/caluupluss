import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Plus, Edit, Trash2, Search } from 'lucide-react';
import { searchStudents, listStudents, type StaffStudent } from '@/services/staffService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const StaffStudents: React.FC = () => {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StaffStudent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  React.useEffect(() => {
    // initial list load
    (async () => {
      setLoading(true);
      try {
        const { results, count } = await listStudents({ page });
        setResults(results);
        setCount(count || results.length);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  const runSearch = async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const { results, count } = await listStudents({ search: q.trim(), page: 1 });
      setResults(results);
      setCount(count || results.length);
      setPage(1);
    } catch (e) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-caluu-blue rounded-full shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
            <p className="text-gray-600">Search, view, and manage student records</p>
          </div>
        </div>

        <Card className="bg-white border-gray-200 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Search</CardTitle>
            <CardDescription>Find students by name, email, or university</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input className="pl-9" placeholder="Search students..." value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && runSearch()} />
              </div>
              <Button className="bg-caluu-blue text-white w-full sm:w-auto" onClick={runSearch} disabled={loading}>{loading ? 'Searching...' : 'Search'}</Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-white border-gray-200 shadow-sm lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Results</CardTitle>
              <CardDescription>Student list</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-gray-600">Loading...</div>
              ) : results.length === 0 ? (
                <div className="text-sm text-gray-600">No results</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-gray-500">
                      <tr>
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Program</th>
                        <th className="py-2 pr-4">Year/Sem</th>
                        <th className="py-2 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((s)=>{
                        const fullName = (s.display_name && s.display_name.trim()) || [s.first_name, s.last_name].filter(Boolean).join(' ').trim() || '—';
                        return (
                          <tr key={s.id} className="border-t">
                            <td className="py-2 pr-4 whitespace-nowrap">{fullName}</td>
                            <td className="py-2 pr-4 whitespace-nowrap">{s.email || '—'}</td>
                            <td className="py-2 pr-4 whitespace-nowrap">{s.program_name || '—'}</td>
                            <td className="py-2 pr-4 whitespace-nowrap">{s.year ? `Y${s.year}` : ''}{s.semester ? ` / S${s.semester}` : ''}</td>
                            <td className="py-2 pr-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={()=>setSelectedId(String(s.id))}><Edit className="w-4 h-4 mr-1"/> View</Button>
                                <Button size="sm" variant="outline" onClick={()=>{ if(s.email) window.location.href = `mailto:${s.email}`; else toast.error('No email available');}}>Email</Button>
                                <Button size="sm" variant="outline" className="text-red-600" onClick={()=>setResults(prev=>prev.filter(r=>String(r.id)!==String(s.id)))}><Trash2 className="w-4 h-4 mr-1"/> Remove</Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
                    <div>Total: {count}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Button>
                      <Button variant="outline" size="sm" onClick={()=>setPage(p=>p+1)}>Next</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={!!selectedId} onOpenChange={(o)=>{ if(!o) setSelectedId(null); }}>
          <DialogContent className="bg-white border-gray-200">
            {(()=>{
              const s = results.find(r=>String(r.id)===selectedId);
              if(!s) return (
                <div className="p-4 text-sm text-gray-600">No student selected</div>
              );
              const fullName = (s.display_name && s.display_name.trim()) || [s.first_name, s.last_name].filter(Boolean).join(' ').trim() || '—';
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-gray-900">{fullName}</DialogTitle>
                    <DialogDescription className="text-gray-600">Student details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-500">Email:</span> <span className="font-medium">{s.email || '—'}</span></div>
                    <div><span className="text-gray-500">Program:</span> <span className="font-medium">{s.program_name || '—'}</span></div>
                    <div><span className="text-gray-500">Year/Sem:</span> <span className="font-medium">{s.year ? `Y${s.year}` : '—'} {s.semester ? `/ S${s.semester}` : ''}</span></div>
                    <div><span className="text-gray-500">University:</span> <span className="font-medium">{s.university_name || '—'}</span></div>
                    <div className="pt-2 flex gap-2">
                      <Button variant="outline" onClick={()=>{ if(s.email){ window.location.href = `mailto:${s.email}`; } }}>
                        Email Student
                      </Button>
                      <Button variant="outline" onClick={()=>{ navigator.clipboard.writeText(fullName + (s.email?` <${s.email}>`:'')); toast.success('Copied'); }}>
                        Copy Contact
                      </Button>
                    </div>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StaffStudents;


