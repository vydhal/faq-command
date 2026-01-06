import { Category, Course, Article, FAQ, User } from '@/types';

// In production (Hostinger), this should probably be just '/api' or the full URL
// For local development with php -S, it's http://localhost:8000/api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  users: {
    update: async (id: string, data: Partial<User>): Promise<void> => {
      const response = await fetch(`${API_URL}/users.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update user');
    },
  },
  categories: {
    list: async (): Promise<Category[]> => {
      const response = await fetch(`${API_URL}/categories.php`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
    create: async (data: Partial<Category>): Promise<Category> => {
      const response = await fetch(`${API_URL}/categories.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create category');
      return response.json();
    },
    update: async (id: string, data: Partial<Category>): Promise<void> => {
      const response = await fetch(`${API_URL}/categories.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update category');
    },
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/categories.php?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete category');
    },
  },
  courses: {
    list: async (categoryId?: string, userId?: string): Promise<Course[]> => {
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId);
      if (userId) params.append('userId', userId);

      const response = await fetch(`${API_URL}/courses.php?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    create: async (data: Partial<Course>): Promise<Course> => {
      const response = await fetch(`${API_URL}/courses.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create course');
      return response.json();
    },
    update: async (id: string, data: Partial<Course>): Promise<void> => {
      const response = await fetch(`${API_URL}/courses.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update course');
    },
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/courses.php?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete course');
    },
  },
  articles: {
    list: async (filters?: { categoryId?: string; courseId?: string; userId?: string }): Promise<Article[]> => {
      const params = new URLSearchParams();
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.courseId) params.append('courseId', filters.courseId);
      if (filters?.userId) params.append('userId', filters.userId);

      const response = await fetch(`${API_URL}/articles.php?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    },
    create: async (data: Partial<Article>): Promise<Article> => {
      const response = await fetch(`${API_URL}/articles.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create article');
      return response.json();
    },
    update: async (id: string, data: Partial<Article>): Promise<void> => {
      const response = await fetch(`${API_URL}/articles.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update article');
    },
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/articles.php?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete article');
    },
  },
  faqs: {
    list: async (category?: string): Promise<FAQ[]> => {
      const url = category
        ? `${API_URL}/faqs.php?category=${category}`
        : `${API_URL}/faqs.php`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch faqs');
      return response.json();
    },
    create: async (data: Partial<FAQ>): Promise<FAQ> => {
      const response = await fetch(`${API_URL}/faqs.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create faq');
      return response.json();
    },
    update: async (id: string, data: Partial<FAQ>): Promise<void> => {
      const response = await fetch(`${API_URL}/faqs.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update faq');
    },
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/faqs.php?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete faq');
    },
  },
  settings: {
    get: async (): Promise<any> => {
      const response = await fetch(`${API_URL}/settings.php`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
    update: async (data: any): Promise<void> => {
      const response = await fetch(`${API_URL}/settings.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update settings');
    },
  },
  progress: {
    get: async (userId: string, lessonId?: number): Promise<any> => {
      const url = lessonId
        ? `${API_URL}/progress.php?userId=${userId}&lessonId=${lessonId}`
        : `${API_URL}/progress.php?userId=${userId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch progress');
      return response.json();
    },
    toggle: async (userId: string, lessonId: number, completed: boolean): Promise<void> => {
      const response = await fetch(`${API_URL}/progress.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, lessonId, completed }),
      });
      if (!response.ok) throw new Error('Failed to update progress');
    },
  },
  stats: {
    get: async (): Promise<any> => {
      const response = await fetch(`${API_URL}/stats.php`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  },
};
