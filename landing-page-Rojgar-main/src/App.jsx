
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import GetStarted from "./pages/GetStarted";
import StudentRegistration from "./pages/StudentRegistration";
import CollegeRegistration from "./pages/CollegeRegistration";
import CompanyRegistration from "./pages/CompanyRegistration";
import StudentPortal from "./pages/StudentPortal";
import CollegePortal from "./pages/CollegePortal";
import CompanyPortal from "./pages/CompanyPortal";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/student-registration" element={<StudentRegistration />} />
          <Route path="/college-registration" element={<CollegeRegistration />} />
          <Route path="/company-registration" element={<CompanyRegistration />} />
          <Route path="/student-portal" element={<StudentPortal />} />
          <Route path="/college-portal" element={<CollegePortal />} />
          <Route path="/company-portal" element={<CompanyPortal />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
