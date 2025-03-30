import axios from 'axios';
import type { BlogPost } from '@/types/blog';

const API_URL = import.meta.env.VITE_API_URL || 'https://caluu.pythonanywhere.com/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Comment {
  id: string;
  content: string;
  author: string;
  authorName: string;
  createdAt: string;
}

export const blogService = {
  // Get a single blog post with its comments and likes
  getPost: async (slug: string): Promise<BlogPost> => {
    const response = await axiosInstance.get(`/blog/posts/${slug}/`);
    return response.data;
  },

  // Get all blog posts
  getAllPosts: async (): Promise<BlogPost[]> => {
    const response = await axiosInstance.get('/blog/posts/');
    return response.data;
  },

  // Add a comment to a blog post
  addComment: async (postId: string, content: string): Promise<Comment> => {
    const response = await axiosInstance.post(`/blog/posts/${postId}/comments/`, {
      content
    });
    return response.data;
  },

  // Like a blog post
  likePost: async (postId: string): Promise<{ likes: number; is_liked: boolean }> => {
    const response = await axiosInstance.post(`/blog/posts/${postId}/like/`);
    return response.data;
  },

  // Unlike a blog post
  unlikePost: async (postId: string): Promise<{ likes: number; is_liked: boolean }> => {
    const response = await axiosInstance.post(`/blog/posts/${postId}/unlike/`);
    return response.data;
  },

  // Get comments for a blog post
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await axiosInstance.get(`/blog/posts/${postId}/comments/`);
    return response.data;
  },
}; 