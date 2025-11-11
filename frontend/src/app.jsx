import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/finances/dashboard";
import Users from "./pages/admin/users";
import Config from "./pages/admin/config";
import Menu from "./pages/admin/Menus";
import Database from "./pages/admin/databaseExplorer";
import Loading from "./components/Loading";
import Banks from "./pages/banks";
import Transactions from "./pages/transactions/index";
import Goals from "./pages/goals/index";
import Reports from "./pages/reports/reports";
import Events from "./pages/Events/events";
import FamilyMembers from "./pages/family/family";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/config" element={<Config />} />
        <Route path="/admin/menus" element={<Menu />} />
        <Route path="/admin/database" element={<Database />} />
        <Route path="/banks" element={<Banks />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/events" element={<Events />} />
        <Route path="/family" element={<FamilyMembers />} />
      </Routes>
    </Router>
  );
}
