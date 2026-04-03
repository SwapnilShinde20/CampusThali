import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentBrowse from "./pages/student/StudentBrowse";
import ChefDetail from "./pages/student/ChefDetail";
import CartPage from "./pages/student/CartPage";
import StudentOrders from "./pages/student/StudentOrders";
import AddressPage from "./pages/student/AddressPage";
import ChefDashboard from "./pages/chef/ChefDashboard";
import ChefMenu from "./pages/chef/ChefMenu";
import ChefOrders from "./pages/chef/ChefOrders";
import AdminOverview from "./pages/admin/AdminOverview";
import ChefManagement from "./pages/admin/ChefManagement";
import UserManagement from "./pages/admin/UserManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import ChefProfileSetup from "./pages/chef/ChefProfileSetup";
import ProfilePage from "./pages/student/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role: string }) => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const ChefOnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, chefProfile } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== "chef") return <Navigate to="/" replace />;
  
  const isComplete = currentUser.isProfileComplete || chefProfile?.isProfileComplete;
  if (!isComplete) return <Navigate to="/chef/profile-setup" replace />;

  const isApproved = chefProfile?.isApproved;
  if (!isApproved) return <Navigate to="/chef/profile-setup" replace />;
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/student-dashboard" element={<ProtectedRoute role="student"><StudentBrowse /></ProtectedRoute>} />
    <Route path="/student-dashboard/chef/:chefId" element={<ProtectedRoute role="student"><ChefDetail /></ProtectedRoute>} />
    <Route path="/student-dashboard/cart" element={<ProtectedRoute role="student"><CartPage /></ProtectedRoute>} />
    <Route path="/student-dashboard/orders" element={<ProtectedRoute role="student"><StudentOrders /></ProtectedRoute>} />
    <Route path="/student-dashboard/addresses" element={<ProtectedRoute role="student"><AddressPage /></ProtectedRoute>} />
    <Route path="/student-dashboard/profile" element={<ProtectedRoute role="student"><ProfilePage /></ProtectedRoute>} />
    
    <Route path="/chef/profile-setup" element={<ProtectedRoute role="chef"><ChefProfileSetup /></ProtectedRoute>} />
    <Route path="/chef-dashboard" element={<ChefOnboardingGuard><ChefDashboard /></ChefOnboardingGuard>} />
    <Route path="/chef-dashboard/menu" element={<ChefOnboardingGuard><ChefMenu /></ChefOnboardingGuard>} />
    <Route path="/chef-dashboard/orders" element={<ChefOnboardingGuard><ChefOrders /></ChefOnboardingGuard>} />
    <Route path="/admin-dashboard" element={<ProtectedRoute role="admin"><AdminOverview /></ProtectedRoute>} />
    <Route path="/admin-dashboard/chefs" element={<ProtectedRoute role="admin"><ChefManagement /></ProtectedRoute>} />
    <Route path="/admin-dashboard/users" element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
    <Route path="/admin-dashboard/orders" element={<ProtectedRoute role="admin"><OrderManagement /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
