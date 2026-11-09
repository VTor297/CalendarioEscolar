
import { useEffect, useState } from "react";
import "./Professor.css";

/* ==============================
   DATAS E UTILITÁRIOS
============================== */

const DIA_MS = 864e5;
const HOJE = new Date();

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const em = (n) =>
  iso(new Date(HOJE.getFullYear(), HOJE.getMonth(), HOJE.getDate() + n));

const formatarData = (d) => d.split("-").reverse().join("/");

const restam = (d) =>
  Math.round(
    (new Date(`${d}T00:00`) - new Date(`${iso(HOJE)}T00:00`)) / DIA_MS
  );

const quando = (d) => {
  const n = restam(d);
  return n === 0
    ? "Hoje"
    : n === 1
    ? "Amanhã"
    : n > 1
    ? `Em ${n} dias`
    : `Há ${-n} dias`;
};

const relativo = (ts) => {
  const n = Math.floor((Date.now() - ts) / DIA_MS);
  return n <= 0 ? "Hoje" : n === 1 ? "Ontem" : `Há ${n} dias`;
};

const nomeDia = (i) =>
  ["Seg", "Ter", "Qua", "Qui", "Sex"][i];

const horaAula = (i) =>
  ["7h30", "8h20", "9h10", "10h20", "11h10"][i];

const nomeDiaCompleto = (i) =>
  ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"][i];

const dataCompleta = HOJE.toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const REUNIAO_PEDAGOGICA = em(2);
const REUNIAO_PAIS = em(8);
const CONSELHO_CLASSE = em(20);

/* ==============================
   HORÁRIO INICIAL
============================== */

const horarioInicial = () => ({
  "2-0": { turma: "6º A", disc: "Ciências" },
  "0-2": { turma: "7º B", disc: "Ciências" },
  "3-3": { turma: "1º EM A", disc: "Matemática" },
  "1-4": { turma: "6º A", disc: "Matemática" },
});

/* ==============================
   COMPONENTES GERAIS
============================== */

function Cabecalho({ titulo, descricao }) {
  return (
    <header className="page-header">
      <div>
        <h1>{titulo}</h1>
        {descricao && <p className="help">{descricao}</p>}
      </div>
    </header>
  );
}

function AulaHoje({ hora, c }) {
  return (
    <div className="aula-hoje">
      <div className="aula-horario">{hora}</div>

      <div className="aula-detalhes">
        <b>{c.disc}</b>
        <span>{c.turma}</span>

        {c.trocado && (
          <span className="tag trocado">Horário trocado</span>
        )}
      </div>
    </div>
  );
}

function Celula({ c, classe }) {
  return (
    <td className={classe || ""}>
      {c ? (
        <div className="celula-aula">
          <b>{c.disc}</b>
          <span className="meta">{c.turma}</span>

          {c.trocado && (
            <span className="tag trocado">Horário trocado</span>
          )}
        </div>
      ) : (
        <span className="vazio">—</span>
      )}
    </td>
  );
}

function Linha({ aula, horario, hoje }) {
  return (
    <tr>
      <th>
        <b>{horaAula(aula)}</b>
      </th>

      {[0, 1, 2, 3, 4].map((dia) => (
        <Celula
          key={dia}
          c={horario[`${aula}-${dia}`]}
          classe={hoje === dia ? "dia-atual" : ""}
        />
      ))}
    </tr>
  );
}

function CartaoReuniao({ titulo, data, descricao }) {
  return (
    <div className="reuniao-item">
      <div className="reuniao-data">
        <strong>{data.split("-")[2]}</strong>
        <span>
          {new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
            month: "short",
          })}
        </span>
      </div>

      <div className="reuniao-info">
        <b>{titulo}</b>
        <span>{descricao}</span>
        <small>{quando(data)}</small>
      </div>
    </div>
  );
}

/* ==============================
   INÍCIO - PAINEL CLEAN
============================== */

function Inicio({ horario, go, naoLidas, usuario }) {
  const diaAtual = (HOJE.getDay() + 6) % 7;

  const aulasHoje =
    diaAtual <= 4
      ? Object.entries(horario)
          .filter(([chave, aula]) => {
            const [, dia] = chave.split("-").map(Number);
            return dia === diaAtual && aula;
          })
          .sort(
            ([a], [b]) =>
              Number(a.split("-")[0]) - Number(b.split("-")[0])
          )
      : [];

  const reunioes = [
    {
      titulo: "Reunião pedagógica",
      data: REUNIAO_PEDAGOGICA,
      descricao: "Encontro pedagógico.",
    },
    {
      titulo: "Reunião de pais",
      data: REUNIAO_PAIS,
      descricao: "Encontro com os responsáveis.",
    },
    {
      titulo: "Conselho de classe",
      data: CONSELHO_CLASSE,
      descricao: "Reunião do conselho de classe.",
    },
  ]
    .filter((r) => restam(r.data) >= 0)
    .sort((a, b) => a.data.localeCompare(b.data));

  const primeiroNome = usuario?.nome?.trim()?.split(" ")[0] || "Professor";

  return (
    <div className="inicio">
      <section className="boas-vindas">
        <div>
          <span className="boas-vindas-label">PAINEL DO PROFESSOR</span>
          <h1>Olá, {primeiroNome}!</h1>
          <p>Veja o resumo da sua rotina escolar.</p>
        </div>

        <div className="data-atual">
          <span>{dataCompleta}</span>
        </div>
      </section>

      <section className="inicio-resumo">
        <div className="resumo-item">
          <div className="resumo-icone azul">▦</div>
          <div>
            <span>Aulas hoje</span>
            <strong>{aulasHoje.length}</strong>
          </div>
        </div>

        <div className="resumo-item">
          <div className="resumo-icone amarelo">◷</div>
          <div>
            <span>Compromissos próximos</span>
            <strong>{reunioes.length}</strong>
          </div>
        </div>

        <div className="resumo-item">
          <div className="resumo-icone verde">●</div>
          <div>
            <span>Notificações não lidas</span>
            <strong>{naoLidas}</strong>
          </div>
        </div>
      </section>

      <div className="inicio-conteudo">
        <section className="painel-bloco aulas-bloco">
          <div className="bloco-cabecalho">
            <div>
              <h2>Minha agenda de hoje</h2>
              <p>
                {diaAtual <= 4
                  ? nomeDiaCompleto(diaAtual)
                  : "Final de semana"}
              </p>
            </div>

            <button
              className="link-acao"
              onClick={() => go("horario")}
            >
              Ver horário completo
              <span>→</span>
            </button>
          </div>

          {aulasHoje.length > 0 ? (
            <div className="lista-aulas">
              {aulasHoje.map(([chave, aula]) => (
                <AulaHoje
                  key={chave}
                  hora={horaAula(Number(chave.split("-")[0]))}
                  c={aula}
                />
              ))}
            </div>
          ) : (
            <div className="agenda-vazia">
              <span className="agenda-vazia-icone">✓</span>
              <b>Nenhuma aula prevista</b>
              <p>Você não possui aulas programadas para hoje.</p>
            </div>
          )}
        </section>

        <section className="painel-bloco compromissos-bloco">
          <div className="bloco-cabecalho">
            <div>
              <h2>Próximos compromissos</h2>
              <p>Datas importantes da escola</p>
            </div>

            <button
              className="link-acao"
              onClick={() => go("reunioes")}
            >
              Ver todos
              <span>→</span>
            </button>
          </div>

          {reunioes.length > 0 ? (
            <div className="lista-reunioes">
              {reunioes.slice(0, 3).map((r) => (
                <CartaoReuniao
                  key={r.titulo}
                  titulo={r.titulo}
                  data={r.data}
                  descricao={r.descricao}
                />
              ))}
            </div>
          ) : (
            <div className="agenda-vazia compacta">
              <b>Nenhum compromisso próximo</b>
              <p>Não há reuniões futuras cadastradas.</p>
            </div>
          )}
        </section>
      </div>

      <section className="atalhos-section">
        <div className="bloco-cabecalho">
          <div>
            <h2>Acesso rápido</h2>
            <p>O que você deseja fazer?</p>
          </div>
        </div>

        <div className="atalhos">
          <button
            className="atalho"
            onClick={() => go("trocar")}
          >
            <span className="atalho-icone">⇄</span>
            <span>
              <b>Solicitar troca</b>
              <small>Troque um horário com outro professor</small>
            </span>
            <span className="atalho-seta">→</span>
          </button>

          <button
            className="atalho"
            onClick={() => go("solicitacoes")}
          >
            <span className="atalho-icone">☷</span>
            <span>
              <b>Minhas solicitações</b>
              <small>Acompanhe o andamento das trocas</small>
            </span>
            <span className="atalho-seta">→</span>
          </button>

          <button
            className="atalho"
            onClick={() => go("notificacoes")}
          >
            <span className="atalho-icone">♧</span>
            <span>
              <b>Notificações</b>
              <small>
                {naoLidas > 0
                  ? `${naoLidas} mensagem(ns) não lida(s)`
                  : "Você está em dia"}
              </small>
            </span>
            <span className="atalho-seta">→</span>
          </button>
        </div>
      </section>
    </div>
  );
}

/* ==============================
   SOLICITAR TROCA
============================== */

function TrocarAula({ horario, enviar }) {
  const [f, setF] = useState({
    professor: "",
    diaOrigem: "0",
    aOrigem: "0",
    diaDestino: "0",
    aDestino: "0",
    motivo: "",
  });

  const alterar = (campo, valor) => {
    setF((atual) => ({ ...atual, [campo]: valor }));
  };

  const origem = horario[`${f.aOrigem}-${f.diaOrigem}`];

  function submit(e) {
    e.preventDefault();

    if (!f.professor.trim()) {
      alert("Informe o nome do outro professor.");
      return;
    }

    if (!origem) {
      alert("Não existe aula cadastrada nesse horário de origem.");
      return;
    }

    if (
      f.diaOrigem === f.diaDestino &&
      f.aOrigem === f.aDestino
    ) {
      alert("Escolha um horário diferente.");
      return;
    }

    enviar({
      tipo: "Troca",
      professor: f.professor.trim(),
      turma: origem.turma,
      disc: origem.disc,
      diaOrigem: Number(f.diaOrigem),
      aOrigem: Number(f.aOrigem),
      diaDestino: Number(f.diaDestino),
      aDestino: Number(f.aDestino),
      motivo: f.motivo.trim(),
    });
  }

  return (
    <>
      <Cabecalho
        titulo="Solicitar troca de aula"
        descricao="Preencha os dados para solicitar uma alteração de horário."
      />

      <form className="card formulario" onSubmit={submit}>
        <div className="form-secao">
          <h2>Professor envolvido</h2>
          <label htmlFor="professor">Professor com quem deseja trocar</label>
          <input
            id="professor"
            value={f.professor}
            onChange={(e) => alterar("professor", e.target.value)}
            placeholder="Digite o nome do professor"
            required
          />
        </div>

        <div className="form-secao">
          <h2>Minha aula atual</h2>

          <div className="form-grid">
            <label>
              Dia da aula
              <select
                value={f.diaOrigem}
                onChange={(e) => alterar("diaOrigem", e.target.value)}
              >
                {[0, 1, 2, 3, 4].map((dia) => (
                  <option key={dia} value={dia}>
                    {nomeDiaCompleto(dia)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Horário da aula
              <select
                value={f.aOrigem}
                onChange={(e) => alterar("aOrigem", e.target.value)}
              >
                {[0, 1, 2, 3, 4].map((aula) => (
                  <option key={aula} value={aula}>
                    {horaAula(aula)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {origem && (
            <div className="aula-selecionada">
              <span>Aula selecionada</span>
              <b>{origem.disc}</b>
              <small>{origem.turma}</small>
            </div>
          )}
        </div>

        <div className="form-secao">
          <h2>Horário desejado</h2>

          <div className="form-grid">
            <label>
              Dia
              <select
                value={f.diaDestino}
                onChange={(e) => alterar("diaDestino", e.target.value)}
              >
                {[0, 1, 2, 3, 4].map((dia) => (
                  <option key={dia} value={dia}>
                    {nomeDiaCompleto(dia)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Horário
              <select
                value={f.aDestino}
                onChange={(e) => alterar("aDestino", e.target.value)}
              >
                {[0, 1, 2, 3, 4].map((aula) => (
                  <option key={aula} value={aula}>
                    {horaAula(aula)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="form-secao">
          <label htmlFor="motivo">Observação (opcional)</label>
          <textarea
            id="motivo"
            value={f.motivo}
            onChange={(e) => alterar("motivo", e.target.value)}
            placeholder="Descreva o motivo da solicitação."
          />
        </div>

        <div className="form-acoes">
          <button className="btn" type="submit">
            Enviar solicitação
          </button>
        </div>
      </form>
    </>
  );
}

/* ==============================
   SOLICITAÇÕES
============================== */

function Solicitacoes({ reqs, cancelar }) {
  const [filtro, setFiltro] = useState("Todas");

  const lista = Object.values(reqs).filter(
    (req) => filtro === "Todas" || req.st === filtro
  );

  return (
    <>
      <Cabecalho
        titulo="Minhas solicitações"
        descricao="Acompanhe o andamento das suas trocas de aula."
      />

      <div className="card">
        <div className="filtros">
          {["Todas", "Pendente", "Aprovada", "Recusada"].map((f) => (
            <button
              key={f}
              className={`filtro-btn ${filtro === f ? "on" : ""}`}
              onClick={() => setFiltro(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {lista.length === 0 && (
          <div className="agenda-vazia">
            <b>Nenhuma solicitação encontrada</b>
            <p>Suas solicitações aparecerão aqui.</p>
          </div>
        )}

        {lista.map((req) => (
          <div className="req" key={req.id}>
            <div className="req-info">
              <b>Troca de aula</b>
              <p>Professor: {req.professor}</p>
              <p>
                Aula: {req.disc} · {req.turma}
              </p>
              <p>
                Origem: {nomeDia(req.diaOrigem)} às{" "}
                {horaAula(req.aOrigem)}
              </p>
              <p>
                Destino: {nomeDia(req.diaDestino)} às{" "}
                {horaAula(req.aDestino)}
              </p>
              {req.motivo && <p>Observação: {req.motivo}</p>}

              <span
                className={`tag ${
                  req.st === "Aprovada"
                    ? "ok"
                    : req.st === "Recusada"
                    ? "bad"
                    : ""
                }`}
              >
                {req.st}
              </span>
            </div>

            {req.st === "Pendente" && (
              <button
                className="btn sec mini"
                onClick={() => cancelar(req.id)}
              >
                Cancelar
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/* ==============================
   MEU HORÁRIO
============================== */

function Horario({ horario }) {
  const diaAtual = (HOJE.getDay() + 6) % 7;

  return (
    <>
      <Cabecalho
        titulo="Meu horário"
        descricao="Confira sua grade semanal de aulas."
      />

      <div className="card tabela-horario">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Aula</th>
                {[0, 1, 2, 3, 4].map((dia) => (
                  <th
                    key={dia}
                    className={diaAtual === dia ? "dia-atual" : ""}
                  >
                    {nomeDia(dia)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {[0, 1, 2, 3, 4].map((aula) => (
                <Linha
                  key={aula}
                  aula={aula}
                  horario={horario}
                  hoje={diaAtual}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ==============================
   REUNIÕES
============================== */

function Reunioes() {
  const reunioes = [
    {
      titulo: "Reunião pedagógica",
      data: REUNIAO_PEDAGOGICA,
      descricao: "Encontro pedagógico.",
    },
    {
      titulo: "Reunião de pais",
      data: REUNIAO_PAIS,
      descricao: "Encontro com os responsáveis.",
    },
    {
      titulo: "Conselho de classe",
      data: CONSELHO_CLASSE,
      descricao: "Reunião do conselho de classe.",
    },
  ].sort((a, b) => a.data.localeCompare(b.data));

  return (
    <>
      <Cabecalho
        titulo="Reuniões"
        descricao="Acompanhe os próximos compromissos escolares."
      />

      <div className="card">
        <div className="lista-reunioes">
          {reunioes.map((r) => (
            <CartaoReuniao
              key={r.titulo}
              titulo={r.titulo}
              data={r.data}
              descricao={r.descricao}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/* ==============================
   NOTIFICAÇÕES
============================== */

function Notificacoes({ notifs, setNotifs }) {
  function marcarComoLida(id) {
    setNotifs((atual) => ({
      ...atual,
      [id]: {
        ...atual[id],
        lida: true,
      },
    }));
  }

  const lista = Object.values(notifs).sort(
    (a, b) => b.data - a.data
  );

  return (
    <>
      <Cabecalho
        titulo="Notificações"
        descricao="Acompanhe as atualizações do sistema."
      />

      <div className="card">
        {lista.length === 0 && (
          <div className="agenda-vazia">
            <b>Você não possui notificações</b>
            <p>Quando houver atualizações, elas aparecerão aqui.</p>
          </div>
        )}

        {lista.map((n) => (
          <div className={`notificacao-item ${n.lida ? "" : "nao-lida"}`} key={n.id}>
            <div className="notificacao-conteudo">
              <b>{n.titulo}</b>
              <p>{n.mensagem}</p>
              <small>{relativo(n.data)}</small>
            </div>

            {!n.lida && (
              <button
                className="btn sec mini"
                onClick={() => marcarComoLida(n.id)}
              >
                Marcar como lida
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/* ==============================
   APLICAÇÃO DO PROFESSOR
============================== */

export default function ProfessorApp({
  usuario,
  onSair,
  trocasAprovadas = [],
}) {
  const [view, setView] = useState("home");
  const [reqs, setReqs] = useState({});
  const [horario, setHorario] = useState(horarioInicial);
  const [notifs, setNotifs] = useState({});
  const [toast, setToast] = useState("");

  const naoLidas = Object.values(notifs).filter(
    (n) => !n.lida
  ).length;

  useEffect(() => {
    if (!trocasAprovadas.length) return;

    setHorario((atual) => {
      const novo = { ...atual };

      trocasAprovadas.forEach((troca) => {
        const origem = `${troca.aOrigem}-${troca.diaOrigem}`;
        const destino = `${troca.aDestino}-${troca.diaDestino}`;

        const aulaOrigem = novo[origem];

        if (!aulaOrigem) return;

        const aulaDestino = novo[destino];

        novo[origem] = aulaDestino
          ? { ...aulaDestino, trocado: true }
          : undefined;

        novo[destino] = {
          ...aulaOrigem,
          trocado: true,
        };
      });

      return novo;
    });
  }, [trocasAprovadas]);

  function enviar(dados) {
    const id = Date.now();

    const novaSolicitacao = {
      ...dados,
      id,
      st: "Pendente",
      criadaEm: Date.now(),
    };

    setReqs((atual) => ({
      ...atual,
      [id]: novaSolicitacao,
    }));

    setToast("Solicitação enviada com sucesso!");
    setView("solicitacoes");

    setTimeout(() => {
      setToast("");
    }, 3500);
  }

  function cancelar(id) {
    setReqs((atual) => {
      const novo = { ...atual };
      delete novo[id];
      return novo;
    });
  }

  const menu = [
    { id: "home", label: "Início" },
    { id: "trocar", label: "Trocar aulas" },
    { id: "solicitacoes", label: "Minhas solicitações" },
    { id: "horario", label: "Meu horário" },
    { id: "reunioes", label: "Reuniões" },
    { id: "notificacoes", label: "Notificações" },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-marca">CE</div>
          <div>
            <h2>Calendário Escolar</h2>
            <span>Área do professor</span>
          </div>
        </div>

        <div className="menu-titulo">MENU PRINCIPAL</div>

        <nav>
          {menu.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "on" : ""}
              onClick={() => setView(item.id)}
            >
              <span>{item.label}</span>

              {item.id === "notificacoes" && naoLidas > 0 && (
                <span className="menu-badge">{naoLidas}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="usuario">
          <div className="usuario-avatar">
            {(usuario?.nome || "P").charAt(0).toUpperCase()}
          </div>

          <div className="usuario-dados">
            <b>{usuario?.nome || "Professor"}</b>
            <span>Professor</span>
          </div>

          <button
            className="sair"
            onClick={onSair}
            title="Sair da conta"
          >
            ↪
          </button>
        </div>
      </aside>

      <main>
        {view === "home" && (
          <Inicio
            horario={horario}
            go={setView}
            naoLidas={naoLidas}
            usuario={usuario}
          />
        )}

        {view === "trocar" && (
          <TrocarAula
            horario={horario}
            enviar={enviar}
          />
        )}

        {view === "solicitacoes" && (
          <Solicitacoes
            reqs={reqs}
            cancelar={cancelar}
          />
        )}

        {view === "horario" && (
          <Horario horario={horario} />
        )}

        {view === "reunioes" && <Reunioes />}

        {view === "notificacoes" && (
          <Notificacoes
            notifs={notifs}
            setNotifs={setNotifs}
          />
        )}

        {toast && (
          <div className="toast on">
            <span>{toast}</span>
            <button onClick={() => setToast("")}>×</button>
          </div>
        )}
      </main>
    </div>
  );
}
