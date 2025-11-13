import { useState, useRef, useEffect } from "react";
import { Bot, SendHorizonal, X } from "lucide-react";
import api from "../../services/api";

export default function ChatWidget({ user, token }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Olá! Sou seu assistente financeiro. Como posso ajudar hoje?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  // Auto scroll
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
      const res = await api.post(
        "/chat/ai",
        { message: input, userId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const botReply = res.data.reply || "Desculpe, não consegui entender.";
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Erro ao se comunicar com o assistente." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botão flutuante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {/* Janela de chat */}
      {open && (
        <div className="w-80 h-[400px] bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <span className="font-bold flex items-center gap-2">
              <Bot className="w-5 h-5" /> Assistente Financeiro
            </span>
            <button onClick={() => setOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensagens */}
          <div
            ref={scrollRef}
            className="flex-1 p-3 overflow-y-auto space-y-2 bg-slate-50"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-2 rounded-xl text-sm max-w-[70%] ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-slate-800 shadow"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <p className="text-sm text-slate-500 italic animate-pulse">Pensando...</p>}
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="flex gap-2 p-2 border-t border-slate-200"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 outline-none px-2 py-1 border rounded-lg text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
            >
              <SendHorizonal className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
