import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import ResetPassword from './pages/ResetPassword';
import SplashScreen from './components/common/SplashScreen';

import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './integrations/supabase/client';
import { useAppStore } from './store/useAppStore';

import { AdminRoute } from './components/common/AdminRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPlans from './pages/admin/AdminPlans';
import BulkNotifications from './pages/admin/BulkNotifications';
import { Baby } from 'lucide-react';

import { useState, useEffect } from 'react';

function AppContent() {
  const { user, loading } = useAuth();
  const { children, hasLoadedData, simulatedUserId, simulatedUserEmail, setSimulatedUser } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Control Splash Screen active state
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1200); // Reduzido de 3s para 1.2s para melhor UX

    // Listen for password recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password');
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Removed isStoreLoading check to prevent stuck screens.
  // Dashboard already handles data loading with skeletons.

  // 1. Splash Screen
  if (showSplash) {
    return <SplashScreen />;
  }

  // 2. Loading Screen (Apenas se a autenticação estiver carregando)
  if (loading) {
    return null;
  }

  // 3. Auth Protection Gate
  if (!user) {
    return (
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // 4. Onboarding Gate: Se não houver nenhum filho registrado, força o registro do primeiro filho
  const hasNoProfiles = hasLoadedData && children.length === 0;
  const isAllowedPath = location.pathname === '/profiles' || location.pathname.includes('dev-test-runner');
  
  if (hasNoProfiles && !isAllowedPath) {
    return <Navigate to="/profiles" replace />;
  }

  const hideNavbar = location.pathname.startsWith('/community/chat/') ||
                     location.pathname.startsWith('/ai-support') ||
                     location.pathname === '/dev-test-runner';

  // 5. Verificação de rotas administrativas (bypassa o mobile-container e entra em tela cheia de PC)
  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) {
    return (
      <AdminRoute>
        {/* Passa o count atual de usuários carregados para que o AdminLayout e o DataBridgeProbe comparem em tempo real */}
        <AdminLayout>
          <Routes>
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/plans" element={<AdminPlans />} />
            <Route path="/admin/notifications" element={<BulkNotifications />} />
            <Route path="/admin/*" element={<Navigate to="/admin/users" replace />} />
          </Routes>

        </AdminLayout>
      </AdminRoute>
    );
  }

  // 6. Secured Routes (Aplicativo Móvel)
  return (
    <div className={cn("mobile-container shadow-2xl", hideNavbar && "!pb-0 h-[100dvh] max-h-[100dvh] min-h-0 overflow-hidden overscroll-none")}>
      {simulatedUserId && (
        <div className="bg-amber-500 text-white text-xs px-4 py-2 font-bold flex justify-between items-center z-50 flex-shrink-0 shadow-sm">
          <span className="truncate pr-2">Simulando: {simulatedUserEmail}</span>
          <button
            onClick={() => {
              setSimulatedUser(null, null);
              navigate('/admin/users');
            }}
            className="bg-white text-amber-600 px-2 py-1 rounded font-bold hover:bg-amber-50 active:scale-95 transition-all flex-shrink-0"
          >
            Voltar à Administração
          </button>
        </div>
      )}
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