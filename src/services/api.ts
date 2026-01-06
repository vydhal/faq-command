
// Define API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

import { User, Course, Category, Article, FAQ } from '@/types';

export const api = {
  users: {
    get: async (id: string) => {
      const response = await fetch(`${API_URL}/users.php?id=${id}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    list: async () => {
      const response = await fetch(`${API_URL}/users.php`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    create: async (data: any) => {
      const response = await fetch(`${API_URL}/users.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    update: async (id: string, data: Partial<User> | any) => {
      const response = await fetch(`${API_URL}/users.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/users.php?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
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
    update: async (id: string, data: Partial<Category>): Promise<Category> => {
      const response = await fetch(`${API_URL}/categories.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update category');
      return response.json();
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
    update: async (id: string, data: Partial<Course>): Promise<Course> => {
      const response = await fetch(`${API_URL}/courses.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update course');
      return response.json();
    },
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/courses.php?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete course');
    },
    enroll: async (courseId: string, userId: string): Promise<void> => {
      const response = await fetch(`${API_URL}/enrollments.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, userId }),
      });
      if (!response.ok) throw new Error('Failed to enroll in course');
    },
    updateProgress: async (courseId: string, userId: string, progress: number): Promise<void> => {
      const response = await fetch(`${API_URL}/enrollments.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, userId, progress }),
      });
      if (!response.ok) throw new Error('Failed to update progress');
    },
  },
  articles: {
    list: async (filters?: { categoryId?: string, userId?: string }): Promise<Article[]> => {
      const params = new URLSearchParams();
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.userId) params.append('userId', filters.userId);

      const response = await fetch(`${API_URL}/articles.php?${params.toString()}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText} - ${text}`);
      }
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
    update: async (id: string, data: Partial<Article>): Promise<Article> => {
      const response = await fetch(`${API_URL}/articles.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update article');
      return response.json();
    },
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/articles.php?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete article');
    },
    markRead: async (articleId: string, userId: string): Promise<void> => {
      const response = await fetch(`${API_URL}/read_history.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, userId }),
      });
      if (!response.ok) throw new Error('Failed to mark article as read');
    },
  },
  faqs: {
    list: async (): Promise<FAQ[]> => {
      const response = await fetch(`${API_URL}/faqs.php`);
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      return response.json();
    },
    create: async (data: Partial<FAQ>): Promise<FAQ> => {
      const response = await fetch(`${API_URL}/faqs.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create FAQ');
      return response.json();
    },
    update: async (id: string, data: Partial<FAQ>): Promise<FAQ> => {
      const response = await fetch(`${API_URL}/faqs.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update FAQ');
      return response.json();
    },
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/faqs.php?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete FAQ');
    },
  },
  settings: {
    get: async () => {
      const response = await fetch(`${API_URL}/settings.php`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
    update: async (data: any) => {
      const response = await fetch(`${API_URL}/settings.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    uploadLogo: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_URL}/upload.php`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload logo');
      return response.json();
    },
  },
  announcements: {
    list: async (userId?: string): Promise<any[]> => {
      const url = userId
        ? `${API_URL}/announcements.php?userId=${userId}`
        : `${API_URL}/announcements.php`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch announcements');
      return response.json();
    },
    create: async (data: any): Promise<any> => {
      const response = await fetch(`${API_URL}/announcements.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create announcement');
      return response.json();
    },
    update: async (id: string, data: any): Promise<void> => {
      const response = await fetch(`${API_URL}/announcements.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update announcement');
    },
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/announcements.php?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete announcement');
    },
    markRead: async (userId: string, announcementId: string): Promise<void> => {
      const response = await fetch(`${API_URL}/announcements.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', userId, announcementId }),
      });
      if (!response.ok) throw new Error('Failed to mark announcement as read');
    },
  },
  notifications: {
    list: async (userId: string): Promise<any[]> => {
      const response = await fetch(`${API_URL}/notifications.php?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    markRead: async (userId: string, notificationId: string): Promise<void> => {
      const response = await fetch(`${API_URL}/notifications.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', userId, notificationId }),
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
    },
    markAllRead: async (userId: string): Promise<void> => {
      const response = await fetch(`${API_URL}/notifications.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read', userId }),
      });
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
    },
  },
  stats: {
    get: async () => {
      const response = await fetch(`${API_URL}/stats.php`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  },
};
