import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from "./pages/Index"; // Import the Index component
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./components/AppLayout";
import AdminLayout from "./components/AdminLayout";
import TeacherDashboard from "./pages/TeacherHome";
import TeacherIEPRequests from "./pages/TeacherIEPRequests";
import ParentDashboard from "./pages/ParentDashboard";
import ParentProgress from "./pages/ParentProgress";
import ParentReports from "./pages/ParentReports";
import ParentAlerts from "./pages/ParentAlerts";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPeopleManagement from "./pages/AdminPeopleManagement";
import AdminReports from "./pages/AdminReports";
import AdminLogs from "./pages/AdminLogs";
import AdminProfile from "./pages/AdminProfile";
import ArchivedRecords from "./pages/ArchivedRecords";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter 
          future={{ 
            v7_startTransition: true, 
            v7_relativeSplatPath: true 
          }}
        >
          <Routes> 
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Redirect /app.html to / so React Router can match the home route */}
            <Route path="/app.html" element={<Navigate to="/" replace />} />

            {/* --- TEACHER PORTAL (STANDALONE) --- */}
            <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} requiredPlatform="web" />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/iep-requests" element={<TeacherIEPRequests />} />
              <Route path="/teacher/archived" element={<ArchivedRecords />} />
            </Route>

            {/* --- PARENT PORTAL --- */}
            <Route 
              element={
                <ProtectedRoute allowedRoles={['parent', 'admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Parent Specific Nodes */}
              <Route element={<ProtectedRoute allowedRoles={['parent', 'admin']} requiredPlatform="app" />}>
                <Route path="/parent" element={<ParentDashboard />} />
                <Route path="/parent/progress" element={<ParentProgress />} />
                <Route path="/parent/reports" element={<ParentReports />} />
                <Route path="/parent/alerts" element={<ParentAlerts />} />
              </Route>
            </Route>

            {/* --- ADMIN DEDICATED MAINFRAME --- */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="people" element={<AdminPeopleManagement />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="archived" element={<ArchivedRecords />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
