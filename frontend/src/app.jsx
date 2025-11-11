import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <Router>
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

        {/* Rota catch-all para 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
