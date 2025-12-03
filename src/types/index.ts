export type UserRole = 'admin' | 'collaborator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  progress?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  coursesCount: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  categoryId: string;
  duration: string;
  lessonsCount: number;
  progress?: number;
  status: 'draft' | 'published';
  createdAt: Date;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  categoryId: string;
  courseId?: string;
  readTime: string;
  isCompleted?: boolean;
  createdAt: Date;
}

export interface Test {
  id: string;
  title: string;
  courseId: string;
  questions: Question[];
  passingScore: number;
  duration: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ProgressMetric {
  userId: string;
  userName: string;
  userAvatar?: string;
  totalCourses: number;
  completedCourses: number;
  totalArticles: number;
  completedArticles: number;
  averageScore: number;
  lastActivity: Date;
}
