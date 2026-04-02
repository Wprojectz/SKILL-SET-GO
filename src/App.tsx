import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthGuard } from "@/components/AuthGuard";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import SkillGap from "./pages/SkillGap";
import LearningPath from "./pages/LearningPath";
import Profile from "./pages/Profile";
import SettingsPage from "./pages/SettingsPage";
import ResetPassword from "./pages/ResetPassword";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/auth"
                element={
                  <AuthGuard requireAuth={false}>
                    <Auth />
                  </AuthGuard>
                }
              />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                }
              />
              <Route path="/analyze" element={<Analyze />} />
              <Route
                path="/dashboard/skills"
                element={
                  <AuthGuard>
                    <SkillGap />
                  </AuthGuard>
                }
              />
              <Route
                path="/dashboard/learning"
                element={
                  <AuthGuard>
                    <LearningPath />
                  </AuthGuard>
                }
              />
              <Route
                path="/dashboard/profile"
                element={
                  <AuthGuard>
                    <Profile />
                  </AuthGuard>
                }
              />
              <Route
                path="/dashboard/history"
                element={
                  <AuthGuard>
                    <History />
                  </AuthGuard>
                }
              />
              <Route
                path="/dashboard/settings"
                element={
                  <AuthGuard>
                    <SettingsPage />
                  </AuthGuard>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
