import React, { useEffect, useState } from 'react';
import { useStudent } from '@/contexts/StudentContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { universities, colleges, programs, loadUniversities, loadColleges, loadPrograms, createStudentProfile } = useStudent();
  const [universityId, setUniversityId] = useState<string>('');
  const [collegeId, setCollegeId] = useState<string>('');
  const [programId, setProgramId] = useState<string>('');
  const [year, setYear] = useState<number>(1);
  const [semester, setSemester] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadUniversities(false); }, [loadUniversities]);
  useEffect(() => { if (universityId) loadColleges(universityId); }, [universityId, loadColleges]);
  useEffect(() => { if (collegeId) loadPrograms(collegeId); }, [collegeId, loadPrograms]);

  useEffect(() => {
    try {
      const extras = localStorage.getItem('pending_profile_extras');
      if (extras) {
        // Placeholder for sending gender/phone to backend later
      }
    } catch {}
  }, []);

  const save = async () => {
    if (!universityId || !collegeId || !programId) {
      navigate('/dashboard');
      return;
    }
    setSaving(true);
    try {
      await createStudentProfile({ university: universityId, college: collegeId, program: programId, year, semester });
      navigate('/dashboard', { replace: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="bg-white border-gray-200 rounded-xl shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-xl">Complete your profile</CardTitle>
            <CardDescription className="text-gray-600">This helps personalize your dashboard. You can skip and do it later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div>
              <Label className="text-gray-700">University</Label>
              <Select value={universityId} onValueChange={(v) => { setUniversityId(v); setCollegeId(''); setProgramId(''); }}>
                <SelectTrigger className="border-gray-300"><SelectValue placeholder="Select University" /></SelectTrigger>
                <SelectContent>
                  {universities.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-700">College</Label>
              <Select value={collegeId} onValueChange={(v) => { setCollegeId(v); setProgramId(''); }}>
                <SelectTrigger className="border-gray-300"><SelectValue placeholder="Select College" /></SelectTrigger>
                <SelectContent>
                  {colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-700">Program</Label>
              <Select value={programId} onValueChange={(v) => setProgramId(v)}>
                <SelectTrigger className="border-gray-300"><SelectValue placeholder="Select Program" /></SelectTrigger>
                <SelectContent>
                  {programs.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">Year</Label>
                <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
                  <SelectTrigger className="border-gray-300"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map(y => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700">Semester</Label>
                <Select value={String(semester)} onValueChange={(v) => setSemester(parseInt(v))}>
                  <SelectTrigger className="border-gray-300"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" className="border-gray-300 text-gray-700" onClick={() => navigate('/dashboard')}>Skip for now</Button>
              <Button onClick={save} disabled={saving} className="bg-caluu-blue hover:bg-caluu-blue-light text-white">{saving ? 'Saving...' : 'Save & Continue'}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteProfile;



