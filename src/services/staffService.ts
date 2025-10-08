import api from '@/lib/api';

export type StaffRoles = {
  is_admin: boolean;
  is_ambassador: boolean;
  ambassador_university_ids: string[];
};

export async function fetchMyRoles(): Promise<StaffRoles> {
  const { data } = await api.get('/staff/me/roles/');
  return data;
}

export type SimpleUniversity = { id: string; name: string; country?: string };

export async function fetchUniversities(): Promise<SimpleUniversity[]> {
  const { data } = await api.get('/universities/');
  return Array.isArray(data) ? data : [];
}

export async function assignAmbassador(userId: string, universityId: string) {
  const { data } = await api.post('/staff/ambassadors/assign/', {
    user_id: userId,
    university_id: universityId,
  });
  return data as { message: string; created?: boolean };
}

export async function revokeAmbassador(userId: string, universityId: string) {
  const { data } = await api.post('/staff/ambassadors/revoke/', {
    user_id: userId,
    university_id: universityId,
  });
  return data as { message: string };
}

export interface StaffStudent {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  phone_number?: string;
  university_name?: string;
  program_name?: string;
  year?: number;
  semester?: number;
}

export interface StaffStudentSearchResponse {
  results: StaffStudent[];
  count?: number;
}

export async function searchStudents(query: string): Promise<StaffStudentSearchResponse> {
  const { data } = await api.get('/admin/search/', { params: { q: query } });
  // Normalize possible shapes
  if (Array.isArray(data)) return { results: data as StaffStudent[], count: data.length };
  if (data?.students && Array.isArray(data.students)) return { results: data.students as StaffStudent[], count: data.students.length };
  if (data?.results && Array.isArray(data.results)) return { results: data.results as StaffStudent[], count: data.count };
  // Fallback
  return { results: [], count: 0 };
}

export async function listStudents(params?: { search?: string; page?: number; page_size?: number }): Promise<StaffStudentSearchResponse> {
  const { data } = await api.get('/admin/list/students/', { params });
  const rawList = Array.isArray(data) ? (data as any[]) : (data?.results || []);
  const normalized: StaffStudent[] = rawList.map((it: any) => {
    const first = it.first_name || it.firstName || '';
    const last = it.last_name || it.lastName || '';
    const display = it.display_name || it.displayName || it.full_name || `${first} ${last}`.trim();
    const email = it.email || it.user_email || it.username || '';
    return {
      id: String(it.id || it.user || it.pk || display || email),
      email,
      first_name: first,
      last_name: last,
      display_name: display,
      phone_number: it.phone_number || it.phone || '',
      university_name: it.university_name || it.university || '',
      program_name: it.program_name || it.program || '',
      year: it.year,
      semester: it.semester,
    } as StaffStudent;
  });
  const count = Array.isArray(data) ? normalized.length : (data?.count || normalized.length);
  return { results: normalized, count };
}


