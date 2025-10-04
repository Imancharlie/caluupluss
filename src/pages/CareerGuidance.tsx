import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Briefcase, BookOpen, Link as LinkIcon } from 'lucide-react';

const sections = [
  {
    title: 'Real-life Skills',
    desc: 'Practical skills you will need after university.',
    items: ['Communication', 'Problem solving', 'Time management', 'Teamwork']
  },
  {
    title: 'Projects & Portfolio',
    desc: 'Show what you can do through real projects.',
    items: ['Capstone project', 'Open-source contributions', 'Freelance gigs']
  },
  {
    title: 'Career Pathways',
    desc: 'Explore roles aligned with your program.',
    items: ['Internships', 'Graduate programs', 'Certifications']
  }
];

const CareerGuidance: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Briefcase className="w-6 h-6 text-caluu-blue" /> Career Guidance</h1>
          <p className="text-gray-600">Prepare for life after university: insights, updates, and actionable steps.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {sections.map(s => (
            <Card key={s.title} className="bg-white border-gray-200 rounded-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-lg"><Lightbulb className="w-4 h-4" /> {s.title}</CardTitle>
                <CardDescription className="text-gray-600">{s.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="flex flex-wrap gap-2">
                  {s.items.map(i => (<Badge key={i} variant="outline" className="border-gray-300">{i}</Badge>))}
                </div>
                <Button className="mt-2 bg-caluu-blue hover:bg-caluu-blue-light text-white"><BookOpen className="w-4 h-4 mr-2" /> Learn more</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white border-gray-200 rounded-xl shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-lg"><LinkIcon className="w-4 h-4" /> Useful Resources</CardTitle>
            <CardDescription className="text-gray-600">Curated links to help you move faster.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-gray-800">
              <li>Internship boards and local opportunities</li>
              <li>Resume and LinkedIn templates</li>
              <li>Interview prep guides</li>
              <li>Certification roadmaps</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CareerGuidance;



