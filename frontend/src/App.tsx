import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import AthleteRegister from "./pages/athlete/AthleteRegister";
import AthleteLogin from "./pages/athlete/AthleteLogin";
import AthleteDashboard from "./pages/athlete/AthleteDashboard";
import AthleteProfile from "./pages/athlete/AthleteProfile";
import VerticalJumpTest from "./pages/athlete/VerticalJumpTest";
import OfficialLogin from "./pages/official/OfficialLogin";
import OfficialDashboard from "./pages/official/OfficialDashboard";
import OfficialReports from "./pages/official/OfficialReports";
import OfficialProfile from "./pages/official/OfficialProfile";
import SubmissionReview from "./pages/official/SubmissionReview";
import AthleteHistory from "./pages/athlete/AthleteHistory";
import ExerciseAnalysis from "./pages/athlete/ExerciseAnalysis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/athlete/register" element={<AthleteRegister />} />
          <Route path="/athlete/login" element={<AthleteLogin />} />
          <Route path="/athlete/dashboard" element={<AthleteDashboard />} />
          <Route path="/athlete/profile" element={<AthleteProfile />} />
          <Route path="/athlete/history" element={<AthleteHistory />} />
          <Route path="/athlete/analysis" element={<ExerciseAnalysis />} />
          <Route path="/athlete/test/vertical-jump" element={<VerticalJumpTest />} />
          <Route path="/athlete/test/:testId" element={<VerticalJumpTest />} />
          <Route path="/official/login" element={<OfficialLogin />} />
          <Route path="/official/dashboard" element={<OfficialDashboard />} />
          <Route path="/official/reports" element={<OfficialReports />} />
          <Route path="/official/profile" element={<OfficialProfile />} />
          <Route path="/official/review/:submissionId" element={<SubmissionReview />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
