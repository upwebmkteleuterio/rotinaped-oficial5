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

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/community/chat/') || location.pathname.startsWith('/ai-support') || location.pathname === '/dev-test-runner';

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
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}
