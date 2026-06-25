import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import Navbar from "./components/Navbar.js";
import Footer from "./components/Footer.js";
import LandingPage from "./pages/LandingPage.js";
import AuthPage from "./pages/AuthPage.js";
import Dashboard from "./pages/Dashboard.js";
import ResumeBuilder from "./pages/ResumeBuilder.js";
import QuestionGenerator from "./pages/QuestionGenerator.js";
import MockInterviewPage from "./pages/MockInterview.js";
import AnalyticsPage from "./pages/Analytics.js";
import AdminPanel from "./pages/AdminPanel.js";

// Protected Route Guard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium animate-pulse">Checking authentication...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#02020a] text-slate-100 flex flex-col justify-between selection:bg-purple-500/30 selection:text-white relative overflow-hidden">
          {/* Background Ambient Glows */}
          <div className="fixed -top-25 left-[-100px] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
          <div className="fixed -bottom-25 right-[-100px] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-pink-600/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
          
          <Navbar />
          
          <main className="flex-grow z-10 relative">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resume" 
                element={
                  <ProtectedRoute>
                    <ResumeBuilder />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/questions" 
                element={
                  <ProtectedRoute>
                    <QuestionGenerator />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/interview" 
                element={
                  <ProtectedRoute>
                    <MockInterviewPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />

              {/* Catch All / Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
