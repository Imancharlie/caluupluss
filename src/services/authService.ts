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

// Update basic account fields for the logged-in user
export async function updateUser(data: {
  email?: string;
  display_name?: string;
  phone_number?: string;
}): Promise<{ email?: string; display_name?: string; phone_number?: string }>
{
  try {
    // Accept both PATCH and POST; prefer PATCH
    const response = await api.patch('/user/update/', data);
    return response.data || data;
  } catch (error) {
    // Fallback to POST if PATCH not allowed on backend
    try {
      const response = await api.post('/user/update/', data);
      return response.data || data;
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err;
    }
  }
}





