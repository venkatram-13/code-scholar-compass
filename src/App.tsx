
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Codeforces from "./pages/Codeforces";
import LeetCode from "./pages/LeetCode";
import CodeChef from "./pages/CodeChef";
import InterviewBit from "./pages/InterviewBit";
import GeeksforGeeks from "./pages/GeeksforGeeks";
import HackerRank from "./pages/HackerRank";
import Analytics from "./pages/Analytics";
import InactiveStudents from "./pages/InactiveStudents";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/codeforces" element={
              <ProtectedRoute>
                <Codeforces />
              </ProtectedRoute>
            } />
            <Route path="/leetcode" element={
              <ProtectedRoute>
                <LeetCode />
              </ProtectedRoute>
            } />
            <Route path="/codechef" element={
              <ProtectedRoute>
                <CodeChef />
              </ProtectedRoute>
            } />
            <Route path="/interviewbit" element={
              <ProtectedRoute>
                <InterviewBit />
              </ProtectedRoute>
            } />
            <Route path="/geeksforgeeks" element={
              <ProtectedRoute>
                <GeeksforGeeks />
              </ProtectedRoute>
            } />
            <Route path="/hackerrank" element={
              <ProtectedRoute>
                <HackerRank />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/inactive" element={
              <ProtectedRoute>
                <InactiveStudents />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
