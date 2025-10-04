import api from '@/lib/api';

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export async function changePassword(data: ChangePasswordData): Promise<void> {
  try {
    await api.post('/auth/change-password/', data);
  } catch (error) {
    console.error('Failed to change password:', error);
    throw error;
  }
}

export async function updateProfile(data: {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
}): Promise<void> {
  try {
    await api.put('/api/user/profile/', data);
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
}





