import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import api from "../../services/api";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";
import CalendarEventModal from "../../components/CalendarEventModal";
import Menu from "../../components/menu";
import { Calendar as LucideCalendar, Plus } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MESSAGES = {
  successDelete: "Evento excluído!",
  errorDelete: "Erro ao excluir evento",
  errorFetch: "Erro ao carregar eventos",
  successAdd: "Evento adicionado com sucesso!",
  successEdit: "Evento atualizado com sucesso!",
};

export default function FinanceCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteEventId, setDeleteEventId] = useState(null); // novo estado

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const res = await api.get(`/events?month=${month}&year=${year}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data);
      } catch (err) {
        console.error(err);
        toast.error(MESSAGES.errorFetch);
      }
    };
    fetchEvents();
  }, [date, token]);

  const tileContent = ({ date: dayTile, view }) => {
    if (view === "month") {
      const dayEvents = events.filter((e) =>
        dayjs(e.date).isSame(dayjs(dayTile), "day")
      );
      if (dayEvents.length === 0) return null;
      return (
        <div className="flex flex-col items-center mt-1">
          {dayEvents.map((e, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full mb-1 ${
                e.type === "entrada" ? "bg-green-500" : "bg-red-500"
              }`}
            />
          ))}
        </div>
      );
    }
  };

  const handleDayClick = (value) => {
    setSelectedDate(value);
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleAddEventClick = () => {
    setSelectedDate(new Date());
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setSelectedDate(new Date(event.date));
    setEditingEvent(event);
    setModalOpen(true);
  };

  const confirmDeleteEvent = (id) => {
    setDeleteEventId(id);
  };

  const handleDeleteEvent = async () => {
    if (!deleteEventId) return;
    try {
      await api.delete(`/events/${deleteEventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents((prev) => prev.filter((e) => e.id !== deleteEventId));
      toast.success(MESSAGES.successDelete);
      setDeleteEventId(null);
    } catch (err) {
      console.error(err);
      toast.error(MESSAGES.errorDelete);
      setDeleteEventId(null);
    }
  };

  const monthlyEvents = events.filter(
    (e) =>
      dayjs(e.date).month() === date.getMonth() &&
      dayjs(e.date).year() === date.getFullYear()
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Menu user={user} />
      <ToastContainer position="top-right" autoClose={3000} />

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <LucideCalendar size={28} className="text-blue-600" />
            Agenda Financeira
          </h2>
          <button
            onClick={handleAddEventClick}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Adicionar Evento
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="bg-white rounded-xl shadow p-4 w-full md:w-2/3">
            <Calendar
              onChange={setDate}
              value={date}
              tileContent={tileContent}
              onClickDay={handleDayClick}
              className="rounded-xl"
            />
          </div>

          <div className="bg-white rounded-xl shadow p-4 w-full md:w-1/3 max-h-[600px] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Eventos do Mês</h3>
            {monthlyEvents.length === 0 ? (
              <p className="text-gray-500">Nenhum evento neste mês.</p>
            ) : (
              <ul className="space-y-3">
                {monthlyEvents.map((e) => (
                  <li
                    key={e.id}
                    className="border-l-4 pl-3 py-1 rounded bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                    style={{
                      borderColor: e.type === "entrada" ? "#10B981" : "#EF4444",
                    }}
                  >
                    <div>
                      <p className="font-medium">{e.title}</p>
                      <p className="text-sm text-gray-500">
                        {dayjs(e.date).format("DD/MM/YYYY")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {e.amount && (
                        <span
                          className={`font-semibold ${
                            e.type === "entrada"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          R$ {e.amount.toFixed(2)}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          e.type === "entrada"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {e.type}
                      </span>
                      <button
                        onClick={() => handleEditEvent(e)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => confirmDeleteEvent(e.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {modalOpen && (
        <CalendarEventModal
          date={selectedDate}
          editingEvent={editingEvent}
          onClose={() => setModalOpen(false)}
          onEventCreated={(event) => {
            if (editingEvent) {
              setEvents((prev) =>
                prev.map((ev) => (ev.id === event.id ? event : ev))
              );
              toast.success(MESSAGES.successEdit);
            } else {
              setEvents((prev) => [...prev, event]);
              toast.success(MESSAGES.successAdd);
            }
          }}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {deleteEventId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
            <p className="mb-4 text-gray-700 font-medium">
              Deseja realmente excluir este evento?
            </p>
            <div className="flex justify-around">
              <button
                onClick={handleDeleteEvent}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Sim
              </button>
              <button
                onClick={() => setDeleteEventId(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
