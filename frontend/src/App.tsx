import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { ToastProvider } from "./components/ui/toast-provider";
import { AuthProvider } from "./context/AuthContext.tsx";
import Layout from "./Layout.tsx";
import About from "./pages/About.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import Login from "./pages/auth/Login.tsx";
import Register from "./pages/auth/Register.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";
import Communities from "./pages/community/Communities.tsx";
import Community from "./pages/community/Community.tsx";
import CreateCommunity from "./pages/community/CreateCommunity.tsx";
import CreateItem from "./pages/community/item/CreateItem.tsx";
import EditItem from "./pages/community/item/EditItem.tsx";
import Item from "./pages/community/item/Item.tsx";
import ManageCommunity from "./pages/community/ManageCommunity.tsx";
import Conversation from "./pages/conversations/Conversation.tsx";
import ConversationsPage from "./pages/conversations/Conversations.tsx";
import Home from "./pages/Home.tsx";
import MemberProfile from "./pages/user/MemberProfile.tsx";
import Profile from "./pages/user/UserProfile.tsx";
import UserItemsPage from "./pages/user/UserItems.tsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public routes */}
            <Route index element={<Home />} />
            <Route path="communities" element={<Communities />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />

            {/* Protected routes */}            <Route
              path="communities/:id"
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              }
            />
            <Route
              path="communities/:id/manage"
              element={
                <ProtectedRoute>
                  <ManageCommunity />
                </ProtectedRoute>
              }
            />
            <Route
              path="conversations"
              element={
                <ProtectedRoute>
                  <ConversationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="conversations/:id"
              element={
                <ProtectedRoute>
                  <Conversation />
                </ProtectedRoute>
              }
            />
            <Route
              path="communities/:id/items/:itemId"
              element={
                <ProtectedRoute>
                  <Item />
                </ProtectedRoute>
              }
            />            <Route
              path="communities/:id/items/create"
              element={
                <ProtectedRoute>
                  <CreateItem />
                </ProtectedRoute>
              }
            />
            <Route
              path="communities/:id/items/:itemId/edit"
              element={
                <ProtectedRoute>
                  <EditItem />
                </ProtectedRoute>
              }
            />
            <Route
              path="communities/create"
              element={
                <ProtectedRoute>
                  <CreateCommunity />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="communities/:communityId/member/:userId"
              element={
                <ProtectedRoute>
                  <MemberProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-items"
              element={
                <ProtectedRoute>
                  <UserItemsPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
        <ToastProvider />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
