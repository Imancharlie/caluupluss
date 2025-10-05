import axios from 'axios';
import { toast } from 'sonner';
import { mockApiResponses } from './mockDataService';

const api = axios.create({
  baseURL: '/api', // Use proxy from vite.config.ts
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface Slide {
  id: string | number;
  title: string;
  description: string;
  image?: string;
  image_url?: string;
  image_url_display?: string;
  display_image?: string;
  background_gradient: string;
  link_url?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SlideResponse {
  results: Slide[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

export async function fetchSlides(): Promise<Slide[]> {
  try {
    const { data } = await api.get('/slides/');
    
    // Debug logging to see what backend returns
    console.log('Backend slides response:', data);
    
    // Handle both array response and paginated response
    const slides = Array.isArray(data) ? data : (data.results || data);
    
    // Process slides to ensure proper image URL handling
    const processedSlides = slides.map((slide: any) => {
      // Use absolute URLs first, then fallback to relative URLs
      let imageUrl = slide.image || slide.image_url || slide.display_image || slide.image_url_display;
      
      // Convert relative URLs to absolute URLs (only if we got a relative URL)
      if (imageUrl && imageUrl.startsWith('/media/')) {
        // Since we're using a proxy, we need to construct the full backend URL
        imageUrl = `http://localhost:8000${imageUrl}`;
      }
      
      console.log(`Slide "${slide.title}":`, {
        image: slide.image,
        image_url: slide.image_url,
        display_image: slide.display_image,
        image_url_display: slide.image_url_display,
        final_image_url: imageUrl,
        hasImage: !!(imageUrl && imageUrl.trim() !== '')
      });
      
      return {
        ...slide,
        // Use absolute URLs first, then fallback to relative URLs
        image_url: imageUrl,
      };
    });
    
    return processedSlides;
  } catch (error) {
    console.warn('Failed to fetch slides, using mock data:', error);
    // Return mock data if backend is not ready
    return mockApiResponses.slides.results;
  }
}

export async function createSlide(slideData: Partial<Slide>): Promise<Slide> {
  try {
    const { data } = await api.post('/slides/', slideData);
    toastSuccess({ title: 'Slide created successfully' });
  return data;
  } catch (error) {
    console.error('Failed to create slide:', error);
    toast.error('Failed to create slide');
    throw error;
  }
}

export async function updateSlide(id: string | number, slideData: Partial<Slide>): Promise<Slide> {
  try {
    const { data } = await api.put(`/slides/${id}/`, slideData);
    toastSuccess({ title: 'Slide updated successfully' });
  return data;
  } catch (error) {
    console.error('Failed to update slide:', error);
    toast.error('Failed to update slide');
    throw error;
  }
}

export async function deleteSlide(id: string | number): Promise<void> {
  try {
    await api.delete(`/slides/${id}/`);
    toastSuccess({ title: 'Slide deleted successfully' });
  } catch (error) {
    console.error('Failed to delete slide:', error);
    toast.error('Failed to delete slide');
    throw error;
  }
}

// Fallback slides for when backend is not available
export function getFallbackSlides(): Slide[] {
  return [
    {
      id: 1,
      title: 'Advertise with us',
      description: 'Keep track of classes and deadlines with your timetable.',
      link_url: '/timetable',
      image_url: '/blog/career-planning.jpg',
      background_gradient: 'from-blue-500 via-indigo-500 to-purple-500',
      order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Boost your GPA',
      description: 'Use the calculator to simulate outcomes and stay on target.',
      link_url: '/calculator',
      image_url: '/blog/online-learning.jpg',
      background_gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: 'Learn smarter',
      description: 'Read curated articles tailored to your academic journey.',
      link_url: '/articles',
      image_url: '/blog/scholarships.jpg',
      background_gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
      order: 3,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 4,
      title: 'Your AI study buddy',
      description: 'Chat with Mr Caluu for quick answers and guidance.',
      link_url: '/chatbot',
      image_url: '/blog/maintain-gpa.jpg',
      background_gradient: 'from-amber-500 via-orange-500 to-red-500',
      order: 4,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}
