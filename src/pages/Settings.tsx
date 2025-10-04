import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone,
  Save,
  Eye,
  EyeOff,
  Camera,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { changePassword, ChangePasswordData } from '@/services/authService';

const Settings: React.FC = () => {
  const { user, updateUser, darkMode, toggleDarkMode } = useAppStore();
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
    displayName: user?.display_name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    academic: true,
    announcements: true,
    marketing: false,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handlePrivacyChange = (field: string, value: string | boolean) => {
    setPrivacy(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data
      updateUser({
        ...user,
        ...formData,
      });
      
      toast.success('Settings saved successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      displayName: user?.display_name || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      location: user?.location || '',
    });
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion is not implemented yet');
    }
  };

  const handleExportData = () => {
    toast.success('Data export started. You will receive an email when ready.');
  };

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
            <p className="text-gray-600 dark:text-gray-300">
              Manage your account preferences and privacy settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                      Update your personal information and profile details
                </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-caluu-blue hover:bg-caluu-blue-light text-white border-caluu-blue"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user?.profile_picture} />
                    <AvatarFallback className="bg-caluu-blue text-white text-lg">
                      {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Camera className="w-4 h-4" />
                      Change Photo
                    </Button>
                    <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                      <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className="bg-white dark:bg-gray-700"
                      />
                    </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                      <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className="bg-white dark:bg-gray-700"
                      />
                    </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      disabled={!isEditing}
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>
                  </div>
                  
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-caluu-blue focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                {isEditing && (
                  <div className="flex gap-2 pt-4">
                  <Button 
                      onClick={handleSave}
                      disabled={isLoading}
                    className="bg-caluu-blue hover:bg-caluu-blue-light text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                  </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Choose how you want to be notified about updates and activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-xs text-gray-500">Receive push notifications in browser</p>
                    </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                  />
                  </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">SMS Notifications</Label>
                    <p className="text-xs text-gray-500">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Academic Updates</Label>
                    <p className="text-xs text-gray-500">GPA changes, course updates</p>
                    </div>
                  <Switch
                    checked={notifications.academic}
                    onCheckedChange={(checked) => handleNotificationChange('academic', checked)}
                  />
                  </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Announcements</Label>
                    <p className="text-xs text-gray-500">Important announcements and updates</p>
                  </div>
                  <Switch
                    checked={notifications.announcements}
                    onCheckedChange={(checked) => handleNotificationChange('announcements', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Marketing</Label>
                    <p className="text-xs text-gray-500">Promotional content and offers</p>
                    </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                  />
                  </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Shield className="w-5 h-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Control who can see your information and contact you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Profile Visibility</Label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-caluu-blue focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Show Email</Label>
                    <p className="text-xs text-gray-500">Display email on your profile</p>
                  </div>
                  <Switch
                    checked={privacy.showEmail}
                    onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Show Phone</Label>
                    <p className="text-xs text-gray-500">Display phone number on your profile</p>
                  </div>
                  <Switch
                    checked={privacy.showPhone}
                    onCheckedChange={(checked) => handlePrivacyChange('showPhone', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Allow Messages</Label>
                    <p className="text-xs text-gray-500">Let others send you messages</p>
                  </div>
                  <Switch
                    checked={privacy.allowMessages}
                    onCheckedChange={(checked) => handlePrivacyChange('allowMessages', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Appearance */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Dark Mode</Label>
                    <p className="text-xs text-gray-500">Switch between light and dark themes</p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Globe className="w-5 h-5" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleExportData}
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>

            {/* Security */}
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
                      } catch (err: any) {
                        const msg = err?.response?.data?.error || err?.response?.data?.detail || 'Failed to change password';
                        toast.error(msg);
                      }
                    }}
                  >
                    Change Password
                  </Button>
                </div>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => toast.info('Two-factor authentication coming soon')}
                >
                  <Smartphone className="w-4 h-4" />
                  Two-Factor Auth
                </Button>
              </CardContent>
            </Card>
                    </div>
                  </div>
      </div>
    </div>
  );
};

export default Settings;