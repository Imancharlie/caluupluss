import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Save,
  Eye,
  EyeOff,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { changePassword, ChangePasswordData, updateUser } from '@/services/authService';

const Settings: React.FC = () => {
  const { user } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState<ChangePasswordData>({
    old_password: '',
    new_password: '',
    new_password_confirm: ''
  });
  const [showPw, setShowPw] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: (user && (user as { phone_number?: string; phone?: string }).phone_number) || (user && (user as { phone?: string }).phone) || '',
  });

  // stripped other settings per requirements

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Send account update for email, display_name, phone_number
      const payload = {
        email: formData.email?.trim() || undefined,
        // display_name will be computed by backend; send first/last too
        phone_number: formData.phone?.trim() || undefined,
        first_name: formData.firstName?.trim() || undefined,
        last_name: formData.lastName?.trim() || undefined,
      } as { email?: string; phone_number?: string; first_name?: string; last_name?: string };
      await updateUser(payload);
      // Update local store user minimally to reflect changes without a fresh fetch
      // Note: keeping first/last name as-is since endpoint doesn't modify them
      // The store has setUser; we avoid importing to reduce coupling, user sees changes in UI inputs already
      toast.success('Profile updated');
      setIsEditing(false);
    } catch (error) {
      const msg = (error as { response?: { data?: { error?: string; detail?: string } } })?.response?.data?.error || (error as { response?: { data?: { error?: string; detail?: string } } })?.response?.data?.detail || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const phoneVal: string = (user && (user as { phone_number?: string; phone?: string }).phone_number) || (user && (user as { phone?: string }).phone) || '';
    setFormData({
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      phone: phoneVal
    });
    setIsEditing(false);
  };

  // removed other actions per requirements

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-caluu-blue rounded-full shadow-lg">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          

          {/* Security (Change Password) */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Shield className="w-5 h-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type={showPw ? 'text' : 'password'}
                    value={passwordForm.old_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type={showPw ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type={showPw ? 'text' : 'password'}
                    value={passwordForm.new_password_confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirm: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={showPw} onCheckedChange={setShowPw} />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Show passwords</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="bg-caluu-blue hover:bg-caluu-blue-light text-white"
                    onClick={async () => {
                      try {
                        if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.new_password_confirm) {
                          toast.error('Please fill out all password fields');
                          return;
                        }
                        if (passwordForm.new_password !== passwordForm.new_password_confirm) {
                          toast.error('New passwords do not match');
                          return;
                        }
                        await changePassword(passwordForm);
                        toast.success('Password changed successfully');
                        setPasswordForm({ old_password: '', new_password: '', new_password_confirm: '' });
                      } catch (err: unknown) {
                        const e = err as { response?: { data?: { error?: string; detail?: string } } };
                        const msg = e?.response?.data?.error || e?.response?.data?.detail || 'Failed to change password';
                        toast.error(msg);
                      }
                    }}
                  >
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;