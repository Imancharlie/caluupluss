import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Calendar, Clock, Edit, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface ClassSession {
  id: string;
  title: string;
  location: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  notes?: string;
  remind: boolean;
  minutesBefore: number;
}

const DAYS: DayOfWeek[] = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const STORAGE_KEY = 'classes_timetable_v1';
const MinutesOptions = [5,10,15,30,60,120];

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getNextOccurrenceMillis(day: DayOfWeek, timeHHMM: string): number {
  const now = new Date();
  const [h, m] = timeHHMM.split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  const dowMap: Record<DayOfWeek, number> = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
  const targetDow = dowMap[day];
  const currentDow = now.getDay();
  let delta = targetDow - currentDow;
  if (delta < 0 || (delta === 0 && target <= now)) delta += 7;
  const next = new Date(now);
  next.setDate(now.getDate() + delta);
  next.setHours(h, m, 0, 0);
  return next.getTime();
}

const ClassesTimetable: React.FC = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ClassSession, 'id'>>({
    title: '', location: '', dayOfWeek: 'Monday', startTime: '08:00', endTime: '09:00', notes: '', remind: true, minutesBefore: 15,
  });
  const timersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSessions(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    scheduleReminders();
  }, [sessions]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const grouped = useMemo(() => {
    const map: Record<DayOfWeek, ClassSession[]> = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] };
    for (const s of sessions) map[s.dayOfWeek].push(s);
    for (const d of DAYS) map[d].sort((a,b) => a.startTime.localeCompare(b.startTime));
    return map;
  }, [sessions]);

  function scheduleReminders() {
    Object.values(timersRef.current).forEach(t => clearTimeout(t));
    timersRef.current = {};
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    sessions.forEach(s => {
      if (!s.remind) return;
      const triggerAt = getNextOccurrenceMillis(s.dayOfWeek, s.startTime) - s.minutesBefore * 60000;
      const delay = triggerAt - Date.now();
      if (delay <= 0 || delay > 7 * 24 * 60 * 60 * 1000) return;
      timersRef.current[s.id] = window.setTimeout(() => {
        try {
          new Notification(`${s.title} starts soon`, { body: `${s.minutesBefore} min • ${s.dayOfWeek} ${s.startTime} @ ${s.location}` });
        } catch {}
      }, delay);
    });
  }

  function resetForm() {
    setForm({ title: '', location: '', dayOfWeek: 'Monday', startTime: '08:00', endTime: '09:00', notes: '', remind: true, minutesBefore: 15 });
    setEditingId(null);
  }

  function saveSession() {
    if (!form.title.trim()) { toast({ title: 'Title required' }); return; }
    if (form.endTime <= form.startTime) { toast({ title: 'End time must be after start time' }); return; }
    if (editingId) {
      setSessions(prev => prev.map(s => s.id === editingId ? { id: editingId, ...form } as ClassSession : s));
      toast({ title: 'Class updated' });
    } else {
      setSessions(prev => [...prev, { id: generateId(), ...form }]);
      toast({ title: 'Class added' });
    }
    resetForm();
  }

  function editSession(id: string) {
    const s = sessions.find(x => x.id === id);
    if (!s) return;
    const { id: _id, ...rest } = s;
    setForm(rest);
    setEditingId(id);
  }

  function deleteSession(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id));
    const t = timersRef.current[id];
    if (t) clearTimeout(t);
    toast({ title: 'Class removed' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-caluu-blue" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Classes Timetable</h1>
          </div>
        </div>

        <Card className="mb-8 bg-white border-gray-200 rounded-xl shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-lg"><Bell className="w-4 h-4" /> Add / Edit Class</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0">
            <div>
              <Label htmlFor="title" className="text-gray-700">Course / Class</Label>
              <Input id="title" value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} placeholder="e.g., Calculus I" className="border-gray-300" />
            </div>
            <div>
              <Label htmlFor="location" className="text-gray-700">Location</Label>
              <Input id="location" value={form.location} onChange={e => setForm(v => ({ ...v, location: e.target.value }))} placeholder="e.g., LH3" className="border-gray-300" />
            </div>
            <div>
              <Label className="text-gray-700">Day</Label>
              <Select value={form.dayOfWeek} onValueChange={(val) => setForm(v => ({ ...v, dayOfWeek: val as DayOfWeek }))}>
                <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Day of Week</SelectLabel>
                    {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start" className="text-gray-700">Start Time</Label>
                <Input id="start" type="time" value={form.startTime} onChange={e => setForm(v => ({ ...v, startTime: e.target.value }))} className="border-gray-300" />
              </div>
              <div>
                <Label htmlFor="end" className="text-gray-700">End Time</Label>
                <Input id="end" type="time" value={form.endTime} onChange={e => setForm(v => ({ ...v, endTime: e.target.value }))} className="border-gray-300" />
              </div>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="notes" className="text-gray-700">Notes</Label>
              <Textarea id="notes" value={form.notes} onChange={e => setForm(v => ({ ...v, notes: e.target.value }))} placeholder="Lecture outline, lecturer, etc." className="border-gray-300" />
            </div>
            <div className="flex items-center gap-4 md:col-span-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch id="remind" checked={form.remind} onCheckedChange={(val) => setForm(v => ({ ...v, remind: val }))} />
                <Label htmlFor="remind">Remind me</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="minutes">Minutes before</Label>
                <Select value={String(form.minutesBefore)} onValueChange={(v) => setForm(f => ({ ...f, minutesBefore: parseInt(v, 10) }))}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {MinutesOptions.map(m => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button onClick={saveSession} className="bg-caluu-blue hover:bg-caluu-blue-light text-white"><Save className="w-4 h-4 mr-2" /> {editingId ? 'Update' : 'Save'}</Button>
                {editingId && (<Button variant="ghost" onClick={resetForm}>Cancel</Button>)}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DAYS.map(day => (
            <Card key={day} className="bg-white border-gray-200 rounded-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-lg"><Clock className="w-4 h-4" /> {day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {grouped[day].length === 0 && (<div className="text-sm text-gray-500">No classes</div>)}
                {grouped[day].map(item => (
                  <div key={item.id} className="p-3 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-600">{item.location}</div>
                        <div className="text-xs mt-1">{item.startTime} - {item.endTime}</div>
                        {item.notes && <div className="text-xs mt-2 text-gray-700">{item.notes}</div>}
                        {item.remind && (<div className="mt-2 text-xs text-amber-600">Reminder {item.minutesBefore} min before</div>)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" onClick={() => editSession(item.id)}><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteSession(item.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassesTimetable;



