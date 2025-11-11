import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { NumericFormat } from "react-number-format";
import api from "../services/api";

export default function CalendarEventModal({ date, editingEvent, onClose, onEventCreated }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(""); // valor numérico
  const [type, setType] = useState("entrada");
  const [eventDate, setEventDate] = useState(date || new Date());
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title || "");
      setAmount(editingEvent.amount || "");
      setType(editingEvent.type || "entrada");
      setEventDate(editingEvent.date ? new Date(editingEvent.date) : new Date());
    }
  }, [editingEvent]);

  const handleSubmit = async () => {
    try {
      const newEvent = {
        title,
        amount: parseFloat(amount) || 0,
        type,
        date: eventDate,
      };

      let res;
      if (editingEvent) {
        // Atualiza evento existente
        res = await api.put(`/events/${editingEvent.id}`, newEvent, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Cria novo evento
        res = await api.post("/events", newEvent, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      onEventCreated(res.data); // atualiza estado do front
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar evento");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="text-xl font-semibold mb-4">
          {editingEvent ? "Editar Evento" : "Adicionar Evento"}
        </h2>

        <label className="block mb-2">
          Título:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>

        <label className="block mb-2">
          Valor:
          <NumericFormat
            value={amount}
            onValueChange={(values) => setAmount(values.floatValue || 0)}
            thousandSeparator="."
            decimalSeparator=","
            prefix="R$ "
            className="w-full border p-2 rounded mt-1"
            placeholder="R$ 0,00"
          />
        </label>

        <label className="block mb-2">
          Tipo:
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
        </label>

        <label className="block mb-4">
          Data:
          <input
            type="date"
            value={dayjs(eventDate).format("YYYY-MM-DD")}
            onChange={(e) => setEventDate(new Date(e.target.value))}
            className="w-full border p-2 rounded mt-1"
          />
        </label>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
