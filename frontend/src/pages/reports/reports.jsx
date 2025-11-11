import { useState, useEffect } from "react";
import Menu from "../../components/menu";
import api from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import {
  PieChart as RePieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
  BarChart, Bar
} from "recharts";
import { PieChart as LucidePieChart } from "lucide-react"; // ícone da biblioteca
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function Reports() {
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [monthlyBalance, setMonthlyBalance] = useState([]);
  const [entriesVsExits, setEntriesVsExits] = useState([]);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res1 = await api.get("/reports/expenses-by-category", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpensesByCategory(res1.data);

        const res2 = await api.get("/reports/monthly-balance", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMonthlyBalance(res2.data);

        const res3 = await api.get("/reports/entries-vs-exits", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEntriesVsExits(res3.data);
      } catch (err) {
        toast.error("Erro ao carregar relatórios");
        console.error(err);
      }
    };

    fetchReports();
  }, [token]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Menu user={user} />
      <ToastContainer position="top-right" autoClose={3000} />

      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Título com ícone */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <LucidePieChart className="text-blue-600" size={28} /> Relatórios Financeiros
        </h2>

        {/* Gastos por Categoria */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-xl font-semibold mb-4">Gastos por Categoria</h3>
          {expensesByCategory.length === 0 ? (
            <p className="text-gray-500 text-center">Nenhum gasto registrado.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={expensesByCategory}
                  dataKey="value"
                  nameKey="category"
                  outerRadius={100}
                  label={(entry) => `${entry.category}: R$ ${entry.value.toFixed(2)}`}
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
              </RePieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Evolução Mensal do Saldo */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-xl font-semibold mb-4">Evolução Mensal do Saldo</h3>
          {monthlyBalance.length === 0 ? (
            <p className="text-gray-500 text-center">Sem movimentações.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyBalance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(val) => dayjs(`01/${val}`).format("MMM/YYYY")}
                />
                <YAxis />
                <ReTooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend verticalAlign="top" />
                <Line type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={2} name="Saldo" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Entradas x Saídas */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-xl font-semibold mb-4">Entradas x Saídas</h3>
          {entriesVsExits.length === 0 ? (
            <p className="text-gray-500 text-center">Sem movimentações.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={entriesVsExits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(val) => dayjs(`01/${val}`).format("MMM/YYYY")}
                />
                <YAxis />
                <ReTooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend verticalAlign="top" />
                <Bar dataKey="entries" fill="#10B981" name="Entradas" />
                <Bar dataKey="exits" fill="#EF4444" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </main>
    </div>
  );
}
