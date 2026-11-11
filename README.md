📅 Calendário Escolar

Sistema escolar completo com backend em Node.js + Express + Sequelize + MariaDB e frontend em React + Vite, com interfaces separadas por perfil: Coordenação, Professor e Aluno.

O sistema permite:

Gerenciar usuários por perfil (Coordenação, Professor, Aluno, Aluno restrito)

Cadastrar e aprovar solicitações de aulas (professores → coordenação)

Editar e publicar a grade de horários de cada turma

Solicitar e aprovar trocas de aula entre professores

Publicar eventos (provas, trabalhos, reuniões, prazos)

Consultar calendário, horário, reuniões e notificações

📋 Índice

Pré-requisitos

Estrutura do projeto

Como rodar o projeto

Banco de dados (MariaDB)

Teste rápido

Endpoints da API

Testes manuais

Perfis do sistema

Fluxos principais

Gerar versão de produção

Erros comuns

Observações importantes

O que NÃO incluir na entrega

Solução de problemas

Suporte

Licença

📋 Pré-requisitos

Requisito

Versão mínima

Observação

Node.js

18+

Verifique com node -v

npm

9+

Vem com o Node.js

MariaDB

10.5+

Pode ser instalado como serviço ou usar a distribuição local em database/

Windows / Linux / macOS

—

Comandos abaixo cobrem os três

📁 Estrutura do projeto

CalendarioEscolar/
│
├── app.js                    # Servidor Express (API) — porta 3000
├── conection.js              # Conexão com o MariaDB via Sequelize
├── package.json              # Comandos principais do projeto
├── README.md                 # Este arquivo
│
├── components/               # Models do Sequelize (backend)
│   ├── Users.js              #   Usuários (nome, email, senha, perfil)
│   ├── Requests.js           #   Solicitações de aula (professor → coordenação)
│   ├── Eventos.js            #   Eventos (provas, trabalhos, reuniões, prazos)
│   ├── Horarios.js           #   Grade de aulas (turma, dia, ordem, disciplina)
│   └── Trocas.js             #   Trocas de aula entre professores
│
├── database/                 # Distribuição local do MariaDB
│   ├── bin/                  #   Executáveis (mariadbd, mariadb, ...)
│   ├── data/                 #   ⚠️ Diretório de dados — NÃO apagar sem backup
│   └── ...                   #   Outros arquivos da distribuição
│
├── front/                    # Aplicação React + Vite
│   ├── public/               #   Arquivos públicos (favicon, etc.)
│   ├── src/
│   │   ├── assets/           #   Imagens e recursos
│   │   ├── services/
│   │   │   └── api.js        #   Todas as chamadas à API (named exports)
│   │   ├── components/
│   │   │   ├── Aluno.jsx     #   Painel do aluno
│   │   │   ├── Professor.jsx #   Painel do professor
│   │   │   ├── Coordenacao.jsx # Painel da coordenação
│   │   │   └── Login.jsx     #   Tela de login
│   │   ├── App.jsx           #   Seleção da tela conforme o perfil
│   │   └── main.jsx          #   Inicialização do React
│   ├── package.json          #   Dependências e scripts do front
│   └── vite.config.js        #   Configuração do Vite
│
└── node_modules/             # ⚠️ NÃO incluir na entrega


🚀 Como rodar o projeto

O projeto precisa de dois terminais abertos (um para o backend, outro para o frontend) — ou de um único comando usando concurrently (veja ao final desta seção).

🖥️ Terminal 1 — Backend (API)

# 1) Entrar na pasta raiz do projeto (onde está o app.js)
cd C:\Users\SEEMG\Desktop\CalendarioEscolar

# 2) Instalar dependências do backend (só na primeira vez)
npm install express cors sequelize mariadb

# 3) Garantir que o MariaDB está rodando (Windows / PowerShell como admin)
Get-Service -Name "MariaDB*"
Start-Service -Name "MariaDB"   # se estiver "Stopped"

# 4) Rodar o servidor
node app.js


Saída esperada:

Banco de dados conectado!
Tabela 'horarios' pronta.
Tabela 'trocas' pronta.
================================
API rodando em http://localhost:3000
================================


Deixe este terminal aberto. Se fechar, a API cai.

🌐 Terminal 2 — Frontend (Vite)

# 1) Entrar na pasta do front
cd C:\Users\SEEMG\Desktop\CalendarioEscolar\front

# 2) Instalar dependências (só na primeira vez)
npm install

# 3) Rodar o Vite
npm run dev


Saída esperada:

VITE v8.3.5  ready in 290 ms
➜  Local:   http://localhost:5173/


Abra no navegador: http://localhost:5173/

Deixe este terminal aberto. Se fechar, o front cai.

⚡ Atalho — rodar os dois com um comando

Na raiz do projeto:

npm install --save-dev concurrently


No package.json da raiz, adicione em "scripts":

"scripts": {
  "dev": "concurrently \"node app.js\" \"npm --prefix front run dev\"",
  "build": "npm --prefix front run build"
}


Agora basta:

npm run dev


Ele sobe backend e frontend no mesmo terminal, com prefixos coloridos.

🗄️ Banco de dados (MariaDB)

Opção A — MariaDB instalado como serviço (recomendado)

# Windows (PowerShell como admin)
Get-Service -Name "MariaDB*"
Start-Service -Name "MariaDB"

# Linux
sudo systemctl start mariadb
sudo systemctl enable mariadb   # inicia junto com o sistema

# macOS (Homebrew)
brew services start mariadb


Opção B — Distribuição local em database/

A pasta database/ contém uma distribuição portátil do MariaDB e o diretório de dados existente (database/data/).

⚠️ Não apague nem compartilhe database/data/ sem antes fazer backup — ele pode conter dados locais do banco.

Para usar essa distribuição, inicie o mariadbd (ou mysqld) apontando para o datadir:

database\bin\mariadbd.exe --datadir=database\data --port=3306


Deixe esse terminal aberto (é o servidor do banco). Depois, no Terminal 1, rode node app.js normalmente.

Conectar pelo terminal

mariadb -u root -p


Dentro do prompt:

SHOW DATABASES;
USE nome_do_banco;
SHOW TABLES;
SELECT * FROM eventos;
SELECT * FROM horarios;
SELECT * FROM trocas;
SELECT * FROM users;       -- se a tabela se chamar 'users'
SELECT * FROM requests;


Criar o banco (se ainda não existir)

CREATE DATABASE calendario_escolar
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'calendario'@'localhost' IDENTIFIED BY 'sua_senha_forte';
GRANT ALL PRIVILEGES ON calendario_escolar.* TO 'calendario'@'localhost';
FLUSH PRIVILEGES;


E ajuste o conection.js:

const sequelize = new Sequelize(
  "calendario_escolar",
  "calendario",
  "sua_senha_forte",
  {
    host: "localhost",
    dialect: "mariadb",
    logging: false
  }
);


As tabelas são criadas automaticamente pelo sync() na inicialização do app.js (Horarios.sync(), Trocas.sync(), etc.).

✅ Teste rápido

No navegador, acesse:

URL

O que deve retornar

http://localhost:3000/eventos

JSON (mesmo que [])

http://localhost:3000/horarios

JSON

http://localhost:3000/trocas

JSON

http://localhost:3000/listar

JSON

http://localhost:5173/

Tela do sistema

Se a API retornar erro de conexão, o node app.js não está rodando ou o MariaDB está parado.

🔌 Endpoints da API

Base: http://localhost:3000

👤 Usuários

Método

Rota

Descrição

Body de exemplo

POST

/cadastrar

Cadastrar usuário

{ "nome": "...", "email": "...", "senha": "...", "perfil": "Aluno" }

GET

/listar

Listar usuários

—

GET

/usuario/buscar/:id

Buscar usuário por ID

—

PUT

/users/editar/:id

Editar usuário

{ "nome": "..." }

DELETE

/usuario/delete/:id

Excluir usuário

—

📝 Solicitações (aulas)

Método

Rota

Descrição

Body de exemplo

POST

/requests

Professor cria solicitação

{ "nome": "Carlos", "tipo": "Aula", "subtipo": "Ciências", "data": "2026-11-10", "horario": "08:20", "obs": "..." }

GET

/admin/requests

Listar pendentes (admin)

—

PUT

/admin/requests/:id/aprovar

Aprovar solicitação (cria evento)

—

PUT

/admin/requests/:id/recusar

Recusar solicitação

—

📅 Eventos

Método

Rota

Descrição

GET

/eventos

Listar eventos (ordenado por data)

⚠️ POST /eventos ainda não existe no backend. O botão "Publicar evento" da coordenação grava apenas em memória no front. Para persistir, é preciso criar a rota.

🕐 Horários

Método

Rota

Descrição

Filtros

GET

/horarios

Grade completa

?turma=6º A&turno=Manhã

GET

/horarios/hoje

Aulas do dia atual

?turma=&turno=

GET

/horarios/:id

Buscar aula

—

POST

/admin/horarios

Cadastrar aula

—

PUT

/admin/horarios/:id

Editar aula

—

DELETE

/admin/horarios/:id

Remover aula

—

Body de exemplo para POST /admin/horarios:

{
  "turma": "6º A",
  "turno": "Manhã",
  "diaSemana": 1,
  "ordem": 1,
  "horario": "07:30",
  "disciplina": "Português",
  "professor": "Prof. Ana",
  "sala": "Sala 12"
}


diaSemana: 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex

ordem: 1=1ª aula, 2=2ª aula, ..., 5=5ª aula

🔄 Trocas de aula

Método

Rota

Descrição

Body de exemplo

POST

/trocas

Professor solicita troca

{ "professorSolicitante": "Carlos", "professorDestino": "Helena", "turma": "6º A", "disciplina": "Ciências", "diaOrigem": 1, "aulaOrigem": 0, "diaDestino": 3, "aulaDestino": 2, "motivo": "..." }

GET

/trocas?professor=Nome

Listar trocas de um professor

—

DELETE

/trocas/:id

Cancelar troca pendente

—

GET

/admin/trocas

Listar trocas pendentes (admin)

—

PUT

/admin/trocas/:id/aprovar

Aprovar troca

—

PUT

/admin/trocas/:id/recusar

Recusar troca

{ "motivoRecusa": "Horário ocupado" }

Status possíveis de uma troca: PENDENTE, APROVADA, RECUSADA, CANCELADA.

🧪 Testes manuais

Arquivo .http (VS Code REST Client)

Crie api.http na raiz do projeto e use com a extensão REST Client (humao.rest-client):

@baseUrl = http://localhost:3000
@admin = true

### ========== EVENTOS ==========
GET {{baseUrl}}/eventos

### ========== HORÁRIOS ==========
### Listar grade completa
GET {{baseUrl}}/horarios

### Grade filtrada
GET {{baseUrl}}/horarios?turma=6º A&turno=Manhã

### Aulas de hoje
GET {{baseUrl}}/horarios/hoje

### Cadastrar aula
POST {{baseUrl}}/admin/horarios
Content-Type: application/json
x-admin: {{admin}}

{
  "turma": "6º A",
  "turno": "Manhã",
  "diaSemana": 1,
  "ordem": 1,
  "horario": "07:30",
  "disciplina": "Português"
}

### ========== TROCAS ==========
### Listar trocas do professor
GET {{baseUrl}}/trocas?professor=Carlos Mendes

### Criar troca
POST {{baseUrl}}/trocas
Content-Type: application/json

{
  "professorSolicitante": "Carlos Mendes",
  "professorDestino": "Helena Prado",
  "turma": "6º A",
  "disciplina": "Ciências",
  "diaOrigem": 1,
  "aulaOrigem": 0,
  "diaDestino": 3,
  "aulaDestino": 2,
  "motivo": "Consulta médica"
}

### Listar trocas pendentes (admin)
GET {{baseUrl}}/admin/trocas
x-admin: {{admin}}

### Aprovar troca
PUT {{baseUrl}}/admin/trocas/1/aprovar
x-admin: {{admin}}

### Recusar troca
PUT {{baseUrl}}/admin/trocas/1/recusar
Content-Type: application/json
x-admin: {{admin}}

{ "motivoRecusa": "Horário já ocupado" }

### ========== SOLICITAÇÕES ==========
GET {{baseUrl}}/admin/requests
x-admin: {{admin}}

### ========== USUÁRIOS ==========
GET {{baseUrl}}/listar


Comandos curl (alternativa ao .http)

# Listar grade
curl http://localhost:3000/horarios

# Aulas de hoje
curl http://localhost:3000/horarios/hoje

# Cadastrar aula
curl -X POST http://localhost:3000/admin/horarios \
  -H "Content-Type: application/json" \
  -H "x-admin: true" \
  -d '{"diaSemana":1,"ordem":1,"horario":"07:30","disciplina":"Português"}'

# Criar troca
curl -X POST http://localhost:3000/trocas \
  -H "Content-Type: application/json" \
  -d '{"professorSolicitante":"Carlos","professorDestino":"Helena","turma":"6º A","disciplina":"Ciências","diaOrigem":1,"aulaOrigem":0,"diaDestino":3,"aulaDestino":2,"motivo":"Consulta"}'

# Aprovar troca
curl -X PUT http://localhost:3000/admin/trocas/1/aprovar \
  -H "x-admin: true"


👥 Perfis do sistema

Perfil

O que pode fazer

Coordenação

Aprovar solicitações e trocas, editar horários, publicar eventos, gerenciar usuários e turmas

Professor

Ver horário, solicitar troca de aula, acompanhar solicitações, ver reuniões

Aluno

Ver calendário, horário, reuniões e notificações

Aluno restrito

Apenas reuniões

🔀 Fluxos principais

1) Professor solicita troca de aula

Professor (front) 
  → POST /trocas 
  → Trocas (tabela, status=PENDENTE) 
  → Coordenação vê em GET /admin/trocas 
  → PUT /admin/trocas/:id/aprovar ou /recusar
  → Professor vê o status em GET /trocas?professor=Nome


2) Professor solicita cadastro de aula

Professor (front) 
  → POST /requests 
  → Requests (tabela, status=PENDENTE) 
  → Coordenação vê em GET /admin/requests 
  → PUT /admin/requests/:id/aprovar 
  → cria Evento automaticamente (transação)
  → Coordenação edita a grade em POST /admin/horarios


3) Aluno consulta

Aluno (front) 
  → GET /eventos (calendário) 
  → GET /horarios (grade da turma) 
  → filtra reuniões no client


🏗️ Gerar versão de produção

# Da raiz do projeto
npm run build


Ou, diretamente da pasta front/:

cd front
npm run build


Os arquivos compilados serão gerados em front/dist/.

Para servir o build com o próprio Express (opcional), adicione no app.js:

const path = require("path");
app.use(express.static(path.join(__dirname, "front", "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "front", "dist", "index.html"));
});


⚠️ Coloque esse bloco depois de todas as rotas da API e antes do app.listen.

⚠️ Erros comuns

Erro

Causa

Solução

EADDRINUSE :::3000

Já tem node app.js rodando

Fechar o outro terminal ou taskkill /F /IM node.exe (Windows)

EADDRINUSE :::5173

Já tem Vite rodando

Fechar o outro terminal ou reiniciar

ECONNREFUSED 127.0.0.1:3306

MariaDB parado

Start-Service -Name "MariaDB" (admin)

Cannot find module 'express'

Faltou npm install no backend

npm install express cors sequelize mariadb

Cannot find module './components/Trocas'

Model não criado

Criar components/Trocas.js

[PARSE_ERROR] Expected ] but found EOF

Arquivo .jsx truncado

Colar o arquivo completo de novo

does not provide an export named 'listarEventos'

api.js desatualizado

Substituir pelo api.js completo

Duplicate export of 'criarTroca'

Função colada 2× no api.js

Deixar só uma ocorrência

Access blocked by CORS policy

CORS não configurado

Confirmar app.use(cors(...)) no app.js

Tela branca no navegador

Erro de import

F12 → Console → ver linha do erro

SequelizeConnectionError

Credenciais erradas no conection.js

Conferir usuário/senha/banco

Table 'X' doesn't exist

sync() não rodou

Verificar se await Horarios.sync() e await Trocas.sync() estão no app.js

📝 Observações importantes

O frontend continua sendo React + Vite; a organização não substitui nem reescreve as funcionalidades existentes.

Os componentes de Coordenação, Professor, Aluno e Login permanecem separados. O arquivo da Coordenação teve apenas o nome corrigido para Coordenacao.jsx.

Anos letivos e registro de atividades (log) ainda são locais (mock no front). Para persistir, é necessário criar models + rotas no backend.

Notificações também são locais no front — o backend ainda não tem rota específica.

POST /eventos não existe no backend atual — o botão "Publicar evento" da coordenação grava apenas em memória.

O requireAdmin está liberado em modo dev. Para produção, descomente a validação por header x-admin: true no app.js.

A autenticação de demonstração presente no frontend não deve ser usada como autenticação real em produção.

O api.js usa named exports (ex.: export async function listarEventos). Não há export default — se adicionar, pode causar conflito com os imports.

📦 O que NÃO incluir em arquivos de entrega

Item

Motivo

node_modules/

Reinstalável com npm install

front/dist/

Gerado pelo npm run build

.git/

Histórico de versionamento

database/data/

Pode conter dados locais sensíveis — fazer backup antes

Para instalar dependências em uma máquina nova:

# Backend (raiz)
npm install express cors sequelize mariadb

# Frontend
cd front
npm install


🆘 Solução de problemas

O front abre, mas as listas vêm vazias

Abra o Console (F12) e veja se há erro de rede.

Verifique se a API responde: http://localhost:3000/eventos.

Verifique o CORS (o app.js precisa ter app.use(cors(...))).

Confirme que o backend foi reiniciado depois de qualquer alteração no app.js.

O backend não conecta ao banco

O serviço do MariaDB está rodando? (Get-Service -Name "MariaDB*")

As credenciais no conection.js estão corretas?

O banco existe? (SHOW DATABASES; no MariaDB)

A porta 3306 está livre? (netstat -ano | findstr :3306 no Windows)

O Vite quebra com PARSE_ERROR

Abra o arquivo citado na linha do erro.

Vá até o final do arquivo e verifique se termina com } ou ); coerente.

Se estiver truncado, cole o arquivo completo de novo.

Reinicie o Vite (Ctrl+C → npm run dev).

O node app.js cai imediatamente

Leia a mensagem de erro completa no terminal.

Verifique se todos os require apontam para arquivos existentes (components/Users.js, components/Trocas.js, etc.).

Verifique se o conection.js exporta { conectarBanco, sequelize }.

Como testar se o MariaDB está acessível

mariadb -u root -p -e "SHOW DATABASES;"


Se retornar a lista de bancos, o serviço está OK.

📞 Suporte

Ao relatar um erro, inclua:

A mensagem exata do terminal (backend ou frontend)

O erro do console do navegador (F12 → Console)

O arquivo e a linha que o erro aponta

O que você estava tentando fazer quando o erro ocorreu

📄 Licença

Projeto acadêmico — uso livre para fins educacionais.