import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Plus, CheckCircle2 } from 'lucide-react';

interface PollOption { id: string; text: string; votes: number; }
interface Poll { id: string; question: string; options: PollOption[]; }

const Voting: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [question, setQuestion] = useState('');
  const [optionText, setOptionText] = useState('');
  const [draftOptions, setDraftOptions] = useState<PollOption[]>([]);
  const totalVotes = (p: Poll) => p.options.reduce((a,b)=>a+b.votes,0);

  const createPoll = () => {
    if (!question.trim() || draftOptions.length < 2) return;
    const poll: Poll = { id: Math.random().toString(36), question, options: draftOptions.map(o => ({...o, votes: 0})) };
    setPolls(prev => [poll, ...prev]);
    setQuestion('');
    setDraftOptions([]);
  };

  const addOption = () => {
    const t = optionText.trim();
    if (!t) return;
    setDraftOptions(prev => [...prev, { id: Math.random().toString(36), text: t, votes: 0 }]);
    setOptionText('');
  };

  const vote = (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(p => p.id === pollId ? { ...p, options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o) } : p));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Tabs defaultValue="create">
          <TabsList>
            <TabsTrigger value="create">Create Poll</TabsTrigger>
            <TabsTrigger value="browse">Vote</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <Card className="bg-white border-gray-200 rounded-xl shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-lg"><Plus className="w-4 h-4" /> New Poll</CardTitle>
                <CardDescription className="text-gray-600">Quickly create a poll for your class or community.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div>
                  <Label htmlFor="q" className="text-gray-700">Question</Label>
                  <Input id="q" value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g., Best time for revision?" className="border-gray-300" />
                </div>
                <div>
                  <Label className="text-gray-700">Options</Label>
                  <div className="flex gap-2">
                    <Input value={optionText} onChange={e => setOptionText(e.target.value)} placeholder="Add option" className="border-gray-300" />
                    <Button onClick={addOption} className="bg-caluu-blue hover:bg-caluu-blue-light text-white">Add</Button>
                  </div>
                  <div className="mt-2 text-sm text-gray-700 flex flex-wrap gap-2">
                    {draftOptions.map(o => (
                      <span key={o.id} className="px-2 py-1 rounded bg-gray-100 text-gray-800">{o.text}</span>
                    ))}
                  </div>
                </div>
                <Button onClick={createPoll} disabled={!question.trim() || draftOptions.length < 2} className="bg-caluu-blue hover:bg-caluu-blue-light text-white"><CheckCircle2 className="w-4 h-4 mr-2" /> Create</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="browse">
            <div className="grid md:grid-cols-2 gap-4">
              {polls.map(p => (
                <Card key={p.id} className="bg-white border-gray-200 rounded-xl shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-gray-900 text-base">{p.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {p.options.map(o => (
                      <Button key={o.id} variant="outline" className="w-full justify-between border-gray-300" onClick={() => vote(p.id, o.id)}>
                        <span className="text-sm">{o.text}</span>
                        <span className="text-xs text-gray-500">{o.votes}</span>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              ))}
              {polls.length === 0 && (
                <div className="text-sm text-gray-600">No polls yet. Create one in the Create tab.</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="results">
            <div className="grid md:grid-cols-2 gap-4">
              {polls.map(p => (
                <Card key={p.id} className="bg-white border-gray-200 rounded-xl shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-gray-900 text-base"><BarChart3 className="w-4 h-4" /> Results</CardTitle>
                    <CardDescription className="text-gray-600">{p.question}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {p.options.map(o => {
                      const total = totalVotes(p) || 1;
                      const pct = Math.round((o.votes / total) * 100);
                      return (
                        <div key={o.id}>
                          <div className="flex justify-between text-xs text-gray-700"><span>{o.text}</span><span>{pct}%</span></div>
                          <div className="h-2 bg-gray-100 rounded">
                            <div className="h-2 bg-caluu-blue rounded" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
              {polls.length === 0 && (
                <div className="text-sm text-gray-600">No results to show yet.</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Voting;



