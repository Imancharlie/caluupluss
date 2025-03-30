import axios from 'axios';
import { blogService } from '../services/blogService';

const API_BASE_URL = 'https://caluu.pythonanywhere.com/api';

describe('Blog API Tests', () => {
  let testPostSlug: string;
  let authToken: string;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await axios.post(`${API_BASE_URL}/login/`, {
      username: 'testuser',
      password: 'testpass'
    });
    authToken = loginResponse.data.token;
  });

  describe('Blog Posts', () => {
    it('should create a new blog post', async () => {
      const postData = {
        title: 'Test Blog Post',
        content: 'This is a test blog post content.',
        excerpt: 'Test excerpt',
        status: 'published'
      };

      const response = await axios.post(`${API_BASE_URL}/blog/posts/`, postData, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('slug');
      testPostSlug = response.data.slug;
    });

    it('should get all blog posts', async () => {
      const response = await axios.get(`${API_BASE_URL}/blog/posts/`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should get a specific blog post', async () => {
      const response = await axios.get(`${API_BASE_URL}/blog/posts/${testPostSlug}/`);
      expect(response.status).toBe(200);
      expect(response.data.slug).toBe(testPostSlug);
    });

    it('should update a blog post', async () => {
      const updateData = {
        title: 'Updated Test Blog Post',
        content: 'Updated content'
      };

      const response = await axios.put(
        `${API_BASE_URL}/blog/posts/${testPostSlug}/`,
        updateData,
        {
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.title).toBe(updateData.title);
    });
  });

  describe('Comments', () => {
    it('should add a comment to a blog post', async () => {
      const commentData = {
        content: 'This is a test comment'
      };

      const response = await axios.post(
        `${API_BASE_URL}/blog/posts/${testPostSlug}/comments/`,
        commentData,
        {
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.content).toBe(commentData.content);
    });

    it('should get comments for a blog post', async () => {
      const response = await axios.get(`${API_BASE_URL}/blog/posts/${testPostSlug}/comments/`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('Likes', () => {
    it('should like a blog post', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/blog/posts/${testPostSlug}/like/`,
        {},
        {
          headers: {
            'Authorization': `Token ${authToken}`
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('likes');
    });

    it('should unlike a blog post', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/blog/posts/${testPostSlug}/unlike/`,
        {},
        {
          headers: {
            'Authorization': `Token ${authToken}`
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('likes');
    });
  });

  afterAll(async () => {
    // Clean up: Delete the test post
    if (testPostSlug) {
      await axios.delete(`${API_BASE_URL}/blog/posts/${testPostSlug}/`, {
        headers: {
          'Authorization': `Token ${authToken}`
        }
      });
    }
  });
}); 