import express from "express";
import prisma from "../prismaClient.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// 🔹 Memória temporária para ações pendentes
const pendingActions = new Map();

// 🧠 Função de detecção de intenção mais inteligente
function detectarIntencao(texto) {
  texto = texto.toLowerCase();

  const palavrasEntrada = ["adicionar", "depositar", "recebi", "ganhei", "entrada", "receita"];
  const palavrasSaida = ["pagar", "comprar", "conta", "despesa", "gastei", "saída"];

  if (palavrasEntrada.some(p => texto.includes(p))) return "entrada";
  if (palavrasSaida.some(p => texto.includes(p))) return "saida";

  if (texto.includes("saldo")) return "saldo";
  if (texto.includes("entradas") || texto.includes("receitas")) return "entradas";
  if (texto.includes("saídas") || texto.includes("despesas")) return "saidas";

  return "desconhecido";
}

// 🏦 Detecta banco mencionado ou retorna o primeiro do usuário
async function detectarBancoNaMensagem(message, userId) {
  const bancos = await prisma.bank.findMany({ where: { userId } });
  for (const banco of bancos) {
    if (message.toLowerCase().includes(banco.name.toLowerCase())) {
      return banco;
    }
  }
  return bancos[0] || null;
}

// 💰 Extrai valor e descrição da mensagem
function extrairDados(message) {
  const matchValor = message.match(/(\d+(?:[.,]\d+)?)/);
  const valor = matchValor ? parseFloat(matchValor[1].replace(",", ".")) : null;

  let descricao = message.replace(/(\d+(?:[.,]\d+)?)/, "").trim();
  descricao = descricao.replace(
    /(quero|adicionar|pagar|uma|um|reais|dinheiro|entrada|saída|despesa|receita)/gi,
    ""
  ).trim();
  if (!descricao) descricao = "Sem descrição";

  return { valor, descricao };
}

// 🔒 Rota protegida
router.post("/ai", authenticateToken, async (req, res) => {
  const { message, userId } = req.body;

  // 1️⃣ Primeira interação: orientar usuário
  if (!message || message.trim() === "") {
    return res.json({
      reply: `Olá! Sou seu assistente financeiro 💬
Você pode me pedir coisas como:
- "Adicionar 500 reais no Itaú"
- "Pagar conta de luz 200 reais"
- "Qual é meu saldo?"
- "Me mostre as últimas entradas ou saídas"

Antes de registrar valores, sempre pedirei confirmação.`,
    });
  }

  // 2️⃣ Verifica se há ação pendente
  if (pendingActions.has(userId)) {
    const action = pendingActions.get(userId);
    if (message.toLowerCase() === "sim") {
      await prisma.finance.create({
        data: {
          description: action.descricao,
          amount: action.valor,
          type: action.tipo,
          bankId: action.banco ? action.banco.id : null,
          userId,
        },
      });
      pendingActions.delete(userId);
      return res.json({
        reply: `✅ ${action.tipo === "entrada" ? "Entrada" : "Despesa"} adicionada com sucesso: ${action.descricao} - R$ ${action.valor.toFixed(2).replace(".", ",")}${action.banco ? ` (Banco: ${action.banco.name})` : ""}`
      });
    } else if (message.toLowerCase() === "não" || message.toLowerCase() === "nao") {
      pendingActions.delete(userId);
      return res.json({ reply: "Ok, ação cancelada. Por favor, envie novamente o valor e a descrição." });
    } else {
      return res.json({ reply: "Por favor, responda apenas com 'sim' ou 'não' para confirmar a ação." });
    }
  }

  // 3️⃣ Detecta intenção
  const intencao = detectarIntencao(message);
  console.log("🧩 Intenção detectada:", intencao);

  try {
    // 💰 Saldo
    if (intencao === "saldo") {
      const entradas = await prisma.finance.findMany({ where: { userId, type: "entrada" } });
      const saidas = await prisma.finance.findMany({ where: { userId, type: "saida" } });

      const saldo =
        entradas.reduce((sum, e) => sum + e.amount, 0) -
        saidas.reduce((sum, e) => sum + e.amount, 0);

      return res.json({
        reply: `💰 Seu saldo atual é de R$ ${saldo.toFixed(2).replace(".", ",")}.`,
      });
    }

    // 📈 Últimas entradas
    if (intencao === "entradas") {
      const entradas = await prisma.finance.findMany({
        where: { userId, type: "entrada" },
        orderBy: { date: "desc" },
        take: 5,
      });

      if (!entradas.length) return res.json({ reply: "Você ainda não tem entradas registradas." });

      const lista = entradas
        .map(e => `- ${e.description}: R$ ${e.amount.toFixed(2).replace(".", ",")}`)
        .join("\n");

      return res.json({ reply: `📈 Suas últimas entradas:\n${lista}` });
    }

    // 📉 Últimas saídas
    if (intencao === "saida") {
      const saidas = await prisma.finance.findMany({
        where: { userId, type: "saida" },
        orderBy: { date: "desc" },
        take: 5,
      });

      if (!saidas.length) return res.json({ reply: "Você ainda não tem despesas registradas." });

      const lista = saidas
        .map(e => `- ${e.description}: R$ ${e.amount.toFixed(2).replace(".", ",")}`)
        .join("\n");

      return res.json({ reply: `📉 Suas últimas despesas:\n${lista}` });
    }

    // ➕ Adicionar entrada ou despesa
    if ((intencao === "entrada" || intencao === "saida")) {
      const { valor, descricao } = extrairDados(message);

      if (!valor) {
        return res.json({
          reply: "Não consegui identificar o valor. Tente escrever algo como: 'Quero adicionar 500 reais'.",
        });
      }

      const banco = await detectarBancoNaMensagem(message, userId);

      // Armazena ação pendente para confirmação
      pendingActions.set(userId, { tipo: intencao, valor, descricao, banco });

      return res.json({
        reply: `Você quer ${intencao === "entrada" ? "adicionar uma entrada" : "registrar uma despesa"} de R$ ${valor.toFixed(2).replace(".", ",")} no Banco ${banco?.name || "padrão"} com a descrição "${descricao}", correto? (sim/não)`,
      });
    }

    // 🤷 Desconhecido
    return res.json({
      reply:
        "Desculpe, não entendi. Você pode tentar: saldo, entradas, saídas ou adicionar uma entrada/despesa.",
    });
  } catch (err) {
    console.error("❌ Erro na rota /chat/ai:", err);
    res.status(500).json({ reply: "Erro interno ao processar a mensagem." });
  }
});

export default router;
