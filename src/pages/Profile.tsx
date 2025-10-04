import React from 'react';
import { useAppStore } from '@/store';
import { useStudent } from '@/contexts/StudentContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, User, Mail, Phone } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, fetchUserBasicDetails } = useAppStore();
  const { studentProfile } = useStudent();

  const displayName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(' ') || user?.display_name || user?.username || 'User';
  React.useEffect(() => {
    if (!user?.first_name || !user?.email || !user?.phone_number) {
      fetchUserBasicDetails().catch(() => {});
    }
  }, [user, fetchUserBasicDetails]);
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('') || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-4xl">
        <Card className="bg-white border-gray-200 rounded-xl shadow-lg">
          <CardHeader className="flex flex-row items-center gap-4">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="Avatar" className="w-14 h-14 rounded-full object-cover border" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-caluu-blue text-white flex items-center justify-center text-lg font-semibold">
                {initials}
              </div>
            )}
            <div>
              <CardTitle className="text-gray-900 text-xl">{displayName}</CardTitle>
              <CardDescription className="text-gray-600">Your account details</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user?.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{user?.phone_number || '—'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">University</p>
                  <p className="text-sm font-medium text-gray-900">{studentProfile?.university?.name || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Program</p>
                  <p className="text-sm font-medium text-gray-900">{studentProfile?.program?.name || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Year & Semester</p>
                  <p className="text-sm font-medium text-gray-900">{studentProfile ? `Year ${studentProfile.year}, Sem ${studentProfile.semester}` : '—'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" className="border-caluu-blue text-caluu-blue" onClick={() => (window.location.href = '/workplace')}>Edit Academic Profile</Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;




