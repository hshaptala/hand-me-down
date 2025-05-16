import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Register from "./pages/Register.tsx";
import Login from "./pages/Login.tsx";
import Profile from "./pages/Profile.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Layout from "./Layout.tsx"
import CommunitiesPage from "./pages/Communities.tsx";
import { AuthProvider } from "./context/auth-context";
import { ProtectedRoute, PublicRoute } from "./components/protected-route";
import { ToastProvider } from "./components/ui/toast-provider";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider />
        <Routes>
          <Route path="/" element={<Layout />}>            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route index element={<Home />} />
              <Route path="communities" element={<CommunitiesPage />} />
              <Route path="profile" element={<Profile />} />
            </Route>
              {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
