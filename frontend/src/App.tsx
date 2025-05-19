import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Register from "./pages/auth/Register.tsx";
import Login from "./pages/auth/Login.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";
import Layout from "./layout.tsx";
import CommunitiesPage from "./pages/community/Communities.tsx";
import Community from "./pages/community/Community.tsx";
import CreateCommunity from "./pages/community/CreateCommunity.tsx";
import About from "./pages/About.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ToastProvider } from "./components/ui/toast-provider";
import UserProfile from "./pages/user/UserProfile.tsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="communities" element={<CommunitiesPage />} />
            <Route path="communities/:id" element={<Community />} />
            <Route path="communities/create" element={<CreateCommunity />} />

            <Route path="profile" element={<UserProfile />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
