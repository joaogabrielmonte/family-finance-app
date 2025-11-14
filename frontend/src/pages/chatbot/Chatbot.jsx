import { useState, useRef, useEffect, useContext } from "react";
import Menu from "../../components/menu";
import api from "../../services/api";
import { SendHorizonal, Bot, User, MessageSquare } from "lucide-react";
import { FinanceContext } from "../../context/FinanceContext"; // contexto global do saldo/transações

export default function Chatbot() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

const finance = useContext(FinanceContext);
const refreshFinance = finance?.refreshFinance || (() => {});// função para atualizar dashboard

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Olá! Sou seu assistente financeiro. Como posso ajudar hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(null); // guarda a ação pendente
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Se estiver aguardando confirmação
      if (awaitingConfirmation) {
        if (input.toLowerCase() === "sim") {
          // Confirma a ação
          const res = await api.post(
            "/chat/ai",
            { message: awaitingConfirmation.message, userId: user.id },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setMessages((prev) => [...prev, { sender: "bot", text: res.data.reply }]);
          setAwaitingConfirmation(null);

          // Atualiza o dashboard
          refreshFinance();
        } else {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "Ok, ação cancelada." },
          ]);
          setAwaitingConfirmation(null);
        }
      } else {
        // Primeira mensagem enviada
        const res = await api.post(
          "/chat/ai",
          { message: input, userId: user.id, preview: true }, // envia preview para IA
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Se o backend indicar que é ação que precisa de confirmação
        if (res.data.confirmation) {
          setMessages((prev) => [...prev, { sender: "bot", text: res.data.confirmation }]);
          setAwaitingConfirmation({ message: input });
        } else {
          setMessages((prev) => [...prev, { sender: "bot", text: res.data.reply }]);
        }
      }
    } catch (error) {
      console.error("Erro no chat:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Erro ao se comunicar com o assistente." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Menu user={user} activeIcon={<MessageSquare className="w-5 h-5 text-blue-600" />} />

      <main className="flex-1 p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          Chat Inteligente
        </h2>

        <div
          ref={scrollRef}
          className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-4 overflow-y-auto space-y-4"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <Bot className="text-blue-600 w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[75%] p-3 rounded-xl text-sm shadow-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-100 text-slate-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === "user" && (
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center ml-2">
                  <User className="text-blue-600 w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <p className="text-slate-500 text-sm italic animate-pulse">Pensando...</p>
          )}
        </div>

        <form
          onSubmit={sendMessage}
          className="mt-4 flex items-center gap-2 border border-slate-300 rounded-xl p-2 bg-white shadow-sm"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 outline-none px-3 py-2 text-sm text-slate-800"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition"
          >
            <SendHorizonal className="w-5 h-5" />
          </button>
        </form>
      </main>
    </div>
  );
}
