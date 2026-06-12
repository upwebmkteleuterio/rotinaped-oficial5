import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { cn } from './lib/utils';
import ScrollToTop from './components/common/ScrollToTop';
import Dashboard from './pages/Dashboard';
import Growth from './pages/Growth';
import Vaccines from './pages/Vaccines';
import Milestones from './pages/Milestones';
import Exams from './pages/Exams';
import Library from './pages/Library';
import Reminders from './pages/Reminders';
import Profiles from './pages/Profiles';
import Menu from './pages/Menu';
import MilkManagement from './pages/MilkManagement';
import Support from './pages/Support';
import AllExams from './pages/AllExams';
import AllVaccines from './pages/AllVaccines';
import VaccineNotebook from './pages/VaccineNotebook';
import Community from './pages/Community';
import ChatRoom from './pages/ChatRoom';
import AISupport from './pages/AISupport';
import TestRunner from './pages/TestRunner';
import Navbar from './components/layout/Navbar';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useAppStore } from './store/useAppStore';
import { Baby } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const { children, hasLoadedData } = useAppStore();
  const location = useLocation();

  const isStoreLoading = user && !hasLoadedData;

  // 1. Loading Screen (Ultra fast, matching design brand)
  if (loading || isStoreLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-[#1b6392] rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
            <Baby className="w-8 h-8 text-white" />
          </div>
          <div className="text-slate-500 text-sm font-medium animate-pulse">
            Carregando RotinaPed...
          </div>
        </div>
      </div>
    );
  }

  // 2. Auth Protection Gate
  if (!user) {
    return <Login />;
  }

  // 2b. Onboarding Gate: If no profiles are registered, force the user to create their first profile on the /profiles screen
  const hasNoProfiles = children.length === 0;
  const isAllowedPath = location.pathname === '/profiles' || location.pathname === '/dev-test-runner';
  
  if (hasNoProfiles && !isAllowedPath) {
    return <Navigate to="/profiles" replace />;
  }

  const hideNavbar = location.pathname.startsWith('/community/chat/') || 
                     location.pathname.startsWith('/ai-support') || 
                     location.pathname === '/dev-test-runner';

  // 3. Secured Routes
  return (
    <div className={cn("mobile-container shadow-2xl", hideNavbar && "!pb-0 h-[100dvh] max-h-[100dvh] min-h-0 overflow-hidden overscroll-none")}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/vaccines" element={<Vaccines />} />
        <Route path="/milestones" element={<Milestones />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/chat/:channelId" element={<ChatRoom />} />
        <Route path="/ai-support" element={<AISupport />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/library" element={<Library />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/milk" element={<MilkManagement />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/support" element={<Support />} />
        <Route path="/all-exams" element={<AllExams />} />
        <Route path="/all-vaccines" element={<AllVaccines />} />
        <Route path="/vaccine-notebook" element={<VaccineNotebook />} />
        <Route path="/dev-test-runner" element={<TestRunner />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideNavbar && <Navbar />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
