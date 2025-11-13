import request from "supertest";
import app from "../api/server.js";

// Token e userId de teste
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYzMDU0NDg3LCJleHAiOjE3NjMwNTgwODd9.8uzODSBRPJ_rVYIc1kKxr-5Ld9fhjOK88t11RCoCR_o";

const userId = 1;

describe("💬 Testes da rota /chat/ai", () => {
  // ---- SALDO ----
  test("Deve responder com o saldo do usuário", async () => {
    const res = await request(app)
      .post("/chat/ai")
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Qual é meu saldo?", userId });

    expect(res.statusCode).toBe(200);
    expect(res.body.reply).toMatch(/R\$ \d/);
  });

  // ---- LISTAGENS ----
  test("Deve listar as últimas entradas", async () => {
    const res = await request(app)
      .post("/chat/ai")
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Me mostre as entradas recentes", userId });

    expect(res.statusCode).toBe(200);
    expect(res.body.reply).toMatch(/entradas|registradas/i);
  });

  test("Deve listar as últimas saídas", async () => {
    const res = await request(app)
      .post("/chat/ai")
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Quais foram minhas últimas despesas?", userId });

    expect(res.statusCode).toBe(200);
    expect(res.body.reply).toMatch(/despesas|registradas/i);
  });

  // ---- ADIÇÕES ----
  test("Deve adicionar uma nova despesa sem banco específico (usa o primeiro banco)", async () => {
    const res = await request(app)
      .post("/chat/ai")
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Adicionar uma despesa de 100 em mercado", userId });

    expect(res.statusCode).toBe(200);
    expect(res.body.reply).toContain("Despesa adicionada");
  });

  test("Deve adicionar uma nova despesa mencionando o Nubank", async () => {
    const res = await request(app)
      .post("/chat/ai")
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Adicionar uma despesa de 50 no Nubank em gasolina", userId });

    expect(res.statusCode).toBe(200);
    expect(res.body.reply.toLowerCase()).toContain("nubank");
  });

  test("Deve adicionar uma nova entrada mencionando o Itaú", async () => {
    const res = await request(app)
      .post("/chat/ai")
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Adicionar uma entrada de 200 no Itaú em salário", userId });

    expect(res.statusCode).toBe(200);
   expect(res.body.reply.toLowerCase()).toContain("itau");
  });

  // ---- SALDO ESPECÍFICO ----
  test("Deve retornar o saldo do Nubank quando especificado", async () => {
    const res = await request(app)
      .post("/chat/ai")
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Qual é meu saldo no Nubank?", userId });

    expect(res.statusCode).toBe(200);
    expect(res.body.reply).toMatch(/Nubank|R\$/);
  });

  // ---- ERROS ----
  test("Deve responder com mensagem de erro quando não entender", async () => {
    const res = await request(app)
      .post("/chat/ai")
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "banana com feijão", userId });

    expect(res.statusCode).toBe(200);
    expect(res.body.reply).toMatch(/não entendi/i);
  });
});
