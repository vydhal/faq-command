import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { api } from "@/services/api";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCourses from "@/pages/admin/AdminCourses";
import AdminArticles from "@/pages/admin/AdminArticles";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminFAQs from "@/pages/admin/AdminFAQs";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminAnnouncements from "@/pages/admin/AdminAnnouncements";

// Collaborator Pages
import CollaboratorDashboard from "@/pages/collaborator/CollaboratorDashboard";
import CollaboratorCourses from "@/pages/collaborator/CollaboratorCourses";
import CollaboratorArticles from "@/pages/collaborator/CollaboratorArticles";
import CollaboratorFAQs from "@/pages/collaborator/CollaboratorFAQs";
import CollaboratorAnnouncements from "@/pages/collaborator/CollaboratorAnnouncements";
import Profile from "@/pages/Profile";

const queryClient = new QueryClient();

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, isLoading, isAdmin } = useAuth();

  useEffect(() => {
    const applySettings = async () => {
      try {
        const settings = await api.settings.get();
        
        if (settings.app_name) {
          document.title = settings.app_name;
        }
        
        if (settings.favicon_url) {
          const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (link) {
            link.href = settings.favicon_url;
          } else {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = settings.favicon_url;
            document.head.appendChild(newLink);
          }
        }

        if (settings.primary_color) {
          document.documentElement.style.setProperty('--primary', settings.primary_color);
          // You might need to convert hex to hsl if your tailwind config expects hsl variables
          // For now assuming simple color replacement or that the user provides valid CSS color
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    applySettings();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={user ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <Login />}
      />

      {/* Redirect root */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Admin routes */}
      <Route
        element={
          <ProtectedRoute adminOnly>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/articles" element={<AdminArticles />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/faqs" element={<AdminFAQs />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
      </Route>

      {/* Collaborator routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<CollaboratorDashboard />} />
        <Route path="/courses" element={<CollaboratorCourses />} />
        <Route path="/articles" element={<CollaboratorArticles />} />
        <Route path="/faqs" element={<CollaboratorFAQs />} />
        <Route path="/collaborator/announcements" element={<CollaboratorAnnouncements />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
