import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/finances/dashboard";
import Users from "./pages/admin/users";
import Config from "./pages/admin/config";
import Menu from "./pages/admin/Menus";
import Database from "./pages/admin/databaseExplorer";
import Banks from "./pages/banks";
import Transactions from "./pages/transactions/index";
import Goals from "./pages/goals/index";
import Reports from "./pages/reports/reports";
import Events from "./pages/Events/events";
import FamilyMembers from "./pages/family/family";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";
import Chatbot from "./pages/chatbot/Chatbot";
import ChatWidget from "./pages/chatbot/chatWidget";

// ---- WRAPPER PARA EXIBIR O CHATWIDGET ----
function AppWrapper() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Mostrar o widget apenas se não estivermos na página de chat
  const showChatWidget = location.pathname !== "/chat";

  return (
    <>
      {showChatWidget && user && token && <ChatWidget user={user} token={token} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/config"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Config />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menus"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Menu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/database"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Database />
            </ProtectedRoute>
          }
        />

        <Route
          path="/banks"
          element={
            <ProtectedRoute>
              <Banks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/family"
          element={
            <ProtectedRoute>
              <FamilyMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

// ---- APP PRINCIPAL ----
export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
