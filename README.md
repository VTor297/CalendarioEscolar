# Calendário Escolar

Sistema escolar com interfaces separadas por perfil: Coordenação, Professor e Aluno.

## Estrutura

```text
CalendarioEscolar/
├── front/                 # Aplicação React + Vite
│   ├── public/             # Arquivos públicos
│   └── src/
│       ├── assets/         # Imagens e recursos
│       ├── components/     # Telas por perfil e autenticação
│       ├── App.jsx         # Seleção da tela conforme o perfil
│       └── main.jsx        # Inicialização do React
├── database/               # Distribuição e arquivos locais do MariaDB
├── package.json            # Comandos principais do projeto
└── README.md
```

## Requisitos

- Node.js e npm
- Windows, caso utilize a distribuição local do MariaDB incluída em `database/`

## Executar o frontend

Na pasta raiz do projeto:

```bash
cd front
npm install
cd ..
npm run dev
```

Ou, se as dependências do frontend já estiverem instaladas, basta executar `npm run dev` na raiz.

## Gerar versão de produção

```bash
npm run build
```

Os arquivos compilados serão gerados em `front/dist/`.

## Observações importantes

- O frontend continua sendo React + Vite; a organização não substitui nem reescreve as funcionalidades existentes.
- Os componentes de Coordenação, Professor, Aluno e Login permanecem separados. O arquivo da Coordenação teve apenas o nome corrigido para `Coordenacao`.
- `database/` contém a distribuição local do MariaDB e o diretório de dados existente. Não apague nem compartilhe `database/data/` sem antes fazer backup: ele pode conter dados locais do banco.
- Não inclua `node_modules/`, `front/dist/` ou `.git/` em arquivos de entrega. Instale dependências com `npm install` dentro de `front/`.
- A autenticação de demonstração presente no frontend não deve ser usada como autenticação real em produção.
