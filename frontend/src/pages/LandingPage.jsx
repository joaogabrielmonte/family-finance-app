import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  LayoutDashboard,
  Banknote,
  BarChart3,
  Target,
  CalendarDays,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { title: "Dashboard Financeiro", description: "IA analisa seus dados e gera insights automáticos.", icon: LayoutDashboard },
    { title: "Contas e Bancos", description: "Sincronize todas suas contas em um único painel.", icon: Banknote },
    { title: "Relatórios Detalhados", description: "Análises interativas e predições de gastos futuros.", icon: BarChart3 },
    { title: "Metas e Objetivos", description: "Sistema adaptativo que ajusta suas metas conforme seu comportamento.", icon: Target },
    { title: "Eventos e Pagamentos", description: "Calendário inteligente com lembretes e alertas.", icon: CalendarDays },
    { title: "Minha Família", description: "Controle compartilhado e permissões personalizadas por membro.", icon: Users },
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-blue-900 via-gray-950 to-black text-white">
      {/* 🔵 Fundo com textura e luz dinâmica */}
      <div
        className="absolute inset-0 opacity-15 bg-cover"
        style={{ backgroundImage: "url('/images/texture-blue.png')" }}
      />

      {/* 🔹 Luzes dinâmicas */}
      <motion.div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-600/30 blur-[120px] rounded-full"
        animate={{ x: [0, 25, -25, 0], y: [0, 20, -20, 0] }}
        transition={{ repeat: Infinity, duration: 15 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/20 blur-[100px] rounded-full"
        animate={{ x: [0, -15, 15, 0], y: [0, -10, 10, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
      />

      {/* 🔹 Header */}
      <header className="relative flex justify-between items-center p-6 z-10">
        <div className="flex items-center space-x-3">
          <motion.img
            src="/images/logo2.png"
            alt="Finance Family"
            className="w-16 h-16 rounded-xl shadow-xl ring-2 ring-blue-400/50"
            animate={{ y: [0, -5, 0, 5, 0], rotate: [0, 3, 0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          />
          <motion.h1
            className="text-2xl font-extrabold tracking-wide text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]"
            animate={{
              y: [0, -3, 0, 3, 0],
              textShadow: [
                '0 0 10px rgba(59,130,246,0.6)',
                '0 0 15px rgba(59,130,246,0.7)',
                '0 0 10px rgba(59,130,246,0.6)'
              ]
            }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          >
            Finance Family
          </motion.h1>
        </div>
        <span className="text-sm opacity-80 italic text-blue-300">by Kingslytic</span>
      </header>

      {/* 🌌 Hero Section */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 mt-20">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl font-extrabold mb-5 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent drop-shadow-xl"
        >
          Finanças do Futuro, Disponível Hoje
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="max-w-2xl text-lg text-blue-200/90 mb-10"
        >
          Uma plataforma completa para gerenciar gastos, metas, eventos e toda a vida financeira da sua família.
        </motion.p>

        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 200 }}>
          <Button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-blue-400/50 hover:scale-105 transition-all"
          >
            Começar Agora
          </Button>
        </motion.div>
      </section>

      {/* 💠 Features / Cards */}
      <section className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-10 py-20 max-w-6xl mx-auto">
        {features.map((item) => (
          <motion.div
            key={item.title}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 200 }}
            onClick={() => navigate("/login")}
          >
            <Card className="bg-gray-800/20 backdrop-blur-xl border-gray-700/20 hover:bg-gray-800/40 text-white cursor-pointer transition-all duration-300 shadow-lg hover:shadow-blue-500/40">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <item.icon size={44} className="text-blue-400 drop-shadow-lg" />
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm opacity-80">{item.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* ⚡ Footer */}
      <footer className="relative z-10 text-center text-sm py-6 border-t border-blue-400/20 mt-auto backdrop-blur-md bg-gray-900/30">
        <p className="opacity-80">
          © {new Date().getFullYear()} <span className="font-semibold">Finance Family</span> · Desenvolvido por <span className="font-semibold text-blue-300">Kingslytic</span>
        </p>
      </footer>
    </div>
  );
}
