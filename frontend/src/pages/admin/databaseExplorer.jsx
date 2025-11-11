import { useState, useEffect } from "react";
import Menu from "../../components/menu";
import api from "../../services/api";

export default function DatabaseExplorer() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  // Pega a lista de tabelas do backend
  const fetchTables = async () => {
    try {
      const res = await api.get("/database/tables");
      setTables(res.data || []); // garante array
    } catch (err) {
      console.error("Erro ao carregar tabelas:", err);
      setTables([]);
    }
  };

const fetchTableData = async (tableName) => {
  if (!tableName) return;
  try {
    const res = await api.get(`/database/${tableName}`);
    const data = res.data || [];

    if (Array.isArray(data) && data.length > 0) {
      // Pega colunas do primeiro registro
      setColumns(Object.keys(data[0]));
      setRows(data);
    } else {
      setColumns([]);
      setRows([]);
    }
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    setColumns([]);
    setRows([]);
  }
};

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    fetchTableData(selectedTable);
  }, [selectedTable]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Menu user={user} />

      <main className="flex-1 p-6">
        <h2 className="text-3xl font-bold mb-6">💾 Database Explorer</h2>

        {/* Seleção de Tabela */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Selecione a tabela</label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Selecione --</option>
            {tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </div>

        {/* Tabela de registros */}
        {selectedTable ? (
          <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-md">
            {rows.length === 0 ? (
              <p className="text-gray-500">Nenhum registro encontrado.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="border px-4 py-2 text-left text-sm font-medium text-gray-700"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {columns.map((col) => (
                        <td key={col} className="border px-4 py-2 text-sm">
                          {row[col]?.toString() || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Selecione uma tabela para visualizar os registros.</p>
        )}
      </main>
    </div>
  );
}
