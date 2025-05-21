import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ToastProvider } from "./components/ui/toast-provider";
import { AuthProvider } from "./context/AuthContext.tsx";
import Layout from "./layout.tsx";
import About from "./pages/About.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import Login from "./pages/auth/Login.tsx";
import Register from "./pages/auth/Register.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";
import Communities from "./pages/community/Communities.tsx";
import Community from "./pages/community/Community.tsx";
import CreateCommunity from "./pages/community/CreateCommunity.tsx";
import CreateItem from "./pages/community/item/CreateItem.tsx";
import Item from "./pages/community/item/Item.tsx";
import ConversationsPage from "./pages/conversations/Conversations.tsx";
import Home from "./pages/Home.tsx";
import Profile from "./pages/user/UserProfile.tsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="communities" element={<Communities />} />
            <Route path="communities/:id" element={<Community />} />
            <Route path="conversations" element={<ConversationsPage />} />
            <Route path="communities/:id/items/:itemId" element={<Item />} />
            <Route
              path="communities/:id/items/create"
              element={<CreateItem />}
            />
            <Route path="about" element={<About />} />
            <Route path="communities/create" element={<CreateCommunity />} />
            <Route path="profile" element={<Profile />} />
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
