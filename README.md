# Family Finance App

Projeto **Family Finance App** para gerenciamento de finanças familiares.  
Permite adicionar membros, gerenciar transações (entradas e saídas) e acompanhar o saldo de cada membro.

---

## 🔑 Login Principal

- **Email:** joao@example.com  
- **Senha:** 123456

---

## 🚀 Como rodar o projeto localmente

### 1. Backend

1. Acesse a pasta do backend:
```bash
cd backend
Instale as dependências:

bash

npm install
Configure as variáveis de ambiente criando um arquivo .env na raiz do backend:

env

DATABASE_URL=postgresql://usuario:senha@host:porta/nome_da_base
PORT=3333
Se quiser testar sem criar uma nova base, você pode usar a base local SQLite ou a que já existe.

Rode o servidor:

bash

node src/server.js
O backend estará rodando em http://localhost:3333.

2. Frontend
Acesse a pasta do frontend:

bash

cd frontend
Instale as dependências:

bash

npm install
Rode o frontend:

bash
Copiar código
npm start
O frontend estará disponível em http://localhost:3000.

