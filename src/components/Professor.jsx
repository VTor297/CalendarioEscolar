import { useEffect, useState } from "react";

// Mostra botões que simulam a resposta da coordenação. Remover em produção.
const DEMO = true;

/* ---------- datas e utilitários ---------- */
const DIA_MS = 864e5;
const HOJE = new Date();
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const em = (n) => iso(new Date(HOJE.getFullYear(), HOJE.getMonth(), HOJE.getDate() + n));
const formatarData = (d) => d.split("-").reverse().join("/");
const restam = (d) => Math.round((new Date(`${d}T00:00`) - new Date(`${iso(HOJE)}T00:00`)) / DIA_MS);
const quando = (d) => {
  const n = restam(d);
  return n === 0 ? "Hoje" : n === 1 ? "Amanhã" : n > 1 ? `Em ${n} dias` : `Há ${-n} dias`;
};
const relativo = (ts) => {
  const n = Math.floor((Date.now() - ts) / DIA_MS);
  return n <= 0 ? "Hoje" : n === 1 ? "Ontem" : `Há ${n} dias`;
};

/* ---------- dados de exemplo ---------- */
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const HORAS = ["7h30", "8h20", "9h10", "10h20", "11h10"];
const TURMAS = ["6º A", "7º B", "1º EM A"];
const DISCIPLINAS = ["Português", "Matemática", "Ciências", "História", "Geografia", "Inglês", "Artes", "Ed. Física"];
const REUNIOES = [
  { t: "Reunião pedagógica", d: em(2) },
  { t: "Reunião de pais", d: em(8) },
  { t: "Conselho de classe", d: em(20) },
];
const horarioInicial = () => {
  const g = Array.from({ length: 5 }, () => Array(5).fill(null)); // g[aula][dia]
  g[2][0] = { turma: "6º A", disc: "Ciências" };
  g[0][2] = { turma: "7º B", disc: "Ciências" };
  g[3][3] = { turma: "1º EM A", disc: "Matemática" };
  g[1][4] = { turma: "6º A", disc: "Matemática" };
  return g;
};
const SOLICITACOES0 = [
  { id: 1, turma: "6º A", disc: "Ciências", dia: 1, a: 1, st: "Pendente" },
  { id: 2, turma: "1º EM A", disc: "Matemática", dia: 4, a: 0, st: "Pendente" },
  { id: 3, turma: "7º B", disc: "Ciências", dia: 2, a: 0, st: "Aprovada" },
  { id: 4, turma: "7º B", disc: "História", dia: 2, a: 2, st: "Recusada", mot: "Horário já ocupado por Geografia" },
];
const NOTIFICACOES0 = [
  { id: 1, ts: Date.now() - 4 * 3600e3, txt: "Sua aula de Ciências na turma 7º B foi aprovada", lida: false },
  { id: 2, ts: Date.now() - DIA_MS * 2, txt: "Reunião pedagógica marcada", lida: true },
];

const TELAS = [
  ["home", "Início", "O que precisa da sua atenção hoje."],
  ["cad", "Cadastrar aulas", "Peça a inclusão de uma aula no horário. A coordenação aprova antes de publicar."],
  ["sol", "Minhas solicitações", "Acompanhe o que já foi aprovado ou recusado."],
  ["hor", "Meu horário", "Suas aulas já aprovadas na semana."],
  ["reu", "Reuniões", "Reuniões marcadas pela coordenação. Aqui você só consulta."],
  ["not", "Notificações", "Avisos enviados pela escola."],
];

/* ---------- telas ---------- */
function Inicio({ reqs, horario, go, naoLidas }) {
  const pendentes = reqs.filter((r) => r.st === "Pendente").length;
  const idx = HOJE.getDay() - 1;
  const aulas = idx >= 0 && idx < 5 ? horario.map((linha, i) => ({ hora: HORAS[i], c: linha[idx] })).filter((x) => x.c) : [];
  const proxima = REUNIOES.filter((r) => restam(r.d) >= 0).sort((a, b) => a.d.localeCompare(b.d))[0];

  return (
    <div className="grid">
      <div className="card">
        <div className="meta">Aguardando a coordenação</div>
        <div className="stat">{pendentes}</div>
        <p className="meta">{pendentes ? "Solicitações de aula esperando aprovação." : "Nenhuma solicitação pendente."}</p>
        <button className="btn" onClick={() => go("cad")}>Cadastrar nova aula</button>
      </div>
      <div className="card">
        <h2>Suas aulas de hoje</h2>
        {aulas.length ? (
          <ul className="lista">
            {aulas.map((a) => (
              <li key={a.hora}><time>{a.hora}</time><span>{a.c.disc} · {a.c.turma}</span></li>
            ))}
          </ul>
        ) : (
          <p className="meta">Você não tem aulas hoje.</p>
        )}
        <button className="btn sec" onClick={() => go("hor")}>Ver horário da semana</button>
      </div>
      <div className="card">
        <h2>Próxima reunião</h2>
        {proxima ? (
          <div className="item"><b>{proxima.t}</b><div className="meta">{formatarData(proxima.d)} · {quando(proxima.d)}</div></div>
        ) : (
          <p className="meta">Nenhuma reunião marcada.</p>
        )}
        <p className="meta">{naoLidas ? `${naoLidas} notificação(ões) nova(s).` : "Sem notificações novas."}</p>
        <button className="btn sec" onClick={() => go("reu")}>Ver reuniões</button>
      </div>
    </div>
  );
}

function Cadastrar({ reqs, horario, enviar }) {
  const vazio = { turma: TURMAS[0], disc: "Ciências", dia: "0", a: "0" };
  const [f, setF] = useState(vazio);
  const [erro, setErro] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const dia = +f.dia;
  const a = +f.a;
  const ocupado = horario[a][dia];

  const submit = (e) => {
    e.preventDefault();
    if (ocupado) return setErro(`Você já tem aula neste horário (${ocupado.disc}, ${ocupado.turma}).`);
    if (reqs.some((r) => r.st === "Pendente" && r.dia === dia && r.a === a))
      return setErro("Você já tem uma solicitação pendente para este horário.");
    enviar({ turma: f.turma, disc: f.disc, dia, a });
    setErro("");
    setF(vazio);
  };

  return (
    <>
      <ol className="passos">
        <li>Você envia a aula</li>
        <li>A coordenação aprova ou recusa</li>
        <li>Aprovada, ela entra no horário</li>
      </ol>
      <form className="card" onSubmit={submit}>
        <h2>Nova aula</h2>
        <div className="row">
          <label>Turma
            <select value={f.turma} onChange={set("turma")}>{TURMAS.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          <label>Disciplina
            <select value={f.disc} onChange={set("disc")}>{DISCIPLINAS.map((d) => <option key={d}>{d}</option>)}</select>
          </label>
          <label>Dia
            <select value={f.dia} onChange={set("dia")}>{DIAS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select>
          </label>
          <label>Aula
            <select value={f.a} onChange={set("a")}>{HORAS.map((h, i) => <option key={h} value={i}>{i + 1}ª ({h})</option>)}</select>
          </label>
          <button className="btn" type="submit">Enviar para aprovação</button>
        </div>
        <p className={ocupado ? "warn" : "meta"} style={{ marginBottom: 0 }}>
          {ocupado ? `Atenção: você já tem ${ocupado.disc} (${ocupado.turma}) neste horário.` : "Este horário está livre na sua grade."}
        </p>
        <p className="err" role="alert">{erro}</p>
      </form>
    </>
  );
}

function Solicitacoes({ reqs, cancelar, resolver }) {
  const [filtro, setFiltro] = useState("Todas");
  const [confirmando, setConfirmando] = useState(null);
  const lista = reqs.filter((r) => filtro === "Todas" || r.st === filtro).sort((x, y) => y.id - x.id);

  return (
    <>
      <div className="tabs">
        {["Todas", "Pendente", "Aprovada", "Recusada"].map((f) => (
          <button key={f} className={filtro === f ? "on" : ""} onClick={() => setFiltro(f)}>{f === "Todas" ? f : f + "s"}</button>
        ))}
      </div>
      {lista.length === 0 && <div className="card empty">Nenhuma solicitação aqui.</div>}
      {lista.map((r) => (
        <div className="card" key={r.id}>
          <div className="req">
            <div>
              <b>{r.disc} · {r.turma}</b>
              <div className="meta">{DIAS[r.dia]}, {r.a + 1}ª aula ({HORAS[r.a]})</div>
              {r.mot && <div className="meta">Motivo da recusa: {r.mot}</div>}
            </div>
            <div className="row">
              <span className={`tag ${r.st === "Aprovada" ? "ok" : r.st === "Recusada" ? "bad" : ""}`}>{r.st}</span>
              {r.st === "Pendente" && <button className="btn del" onClick={() => setConfirmando(r)}>Cancelar pedido</button>}
              {DEMO && r.st === "Pendente" && (
                <>
                  <button className="btn sec mini" onClick={() => resolver(r.id, true)}>Demo: aprovar</button>
                  <button className="btn sec mini" onClick={() => resolver(r.id, false)}>Demo: recusar</button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
      {confirmando && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="card">
            <p>Cancelar o pedido de {confirmando.disc} na turma {confirmando.turma}?</p>
            <div className="row fim">
              <button className="btn sec" onClick={() => setConfirmando(null)}>Voltar</button>
              <button className="btn" onClick={() => { cancelar(confirmando.id); setConfirmando(null); }}>Cancelar pedido</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Horario({ horario }) {
  const hoje = HOJE.getDay() - 1;
  return (
    <div className="card scroll">
      <table className="grade">
        <thead>
          <tr>
            <th></th>
            {DIAS.map((d, i) => <th key={d} className={i === hoje ? "hoje-col" : ""}>{d}{i === hoje ? " (hoje)" : ""}</th>)}
          </tr>
        </thead>
        <tbody>
          {horario.map((linha, ri) => (
            <tr key={ri}>
              <th>{ri + 1}ª aula<div className="meta">{HORAS[ri]}</div></th>
              {linha.map((c, ci) => (
                <td key={ci} className={ci === hoje ? "hoje-col" : ""}>
                  {c ? <><b>{c.disc}</b><div className="meta">{c.turma}</div></> : <span className="livre">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Reunioes() {
  const lista = REUNIOES.filter((r) => restam(r.d) >= 0).sort((a, b) => a.d.localeCompare(b.d));
  return (
    <>
      {lista.length === 0 && <div className="card empty">Nenhuma reunião marcada.</div>}
      {lista.map((r, i) => (
        <div className="card" key={i}>
          <div className="req">
            <div><b>{r.t}</b><div className="meta">{formatarData(r.d)}</div></div>
            <span className="tag">{quando(r.d)}</span>
          </div>
        </div>
      ))}
    </>
  );
}

function Notificacoes({ notifs, setNotifs }) {
  const naoLidas = notifs.filter((n) => !n.lida).length;
  const ler = (id) => setNotifs((l) => l.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  return (
    <>
      <div className="row bar">
        <button className="btn sec" disabled={!naoLidas} onClick={() => setNotifs((l) => l.map((n) => ({ ...n, lida: true })))}>
          Marcar todas como lidas
        </button>
      </div>
      <div className="card">
        {notifs.length === 0 && <div className="empty">Nenhuma notificação.</div>}
        <ul className="log">
          {notifs.map((n) => (
            <li key={n.id} className={n.lida ? "" : "nova"}>
              <time>{relativo(n.ts)}</time>
              <span>{n.txt}</span>
              {!n.lida && <button className="btn sec mini" onClick={() => ler(n.id)}>Marcar como lida</button>}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/* ---------- aplicação do professor ---------- */
export default function ProfessorApp({ usuario, onSair }) {
  const [view, setView] = useState("home");
  const [reqs, setReqs] = useState(SOLICITACOES0);
  const [horario, setHorario] = useState(horarioInicial);
  const [notifs, setNotifs] = useState(NOTIFICACOES0);
  const [toast, setToast] = useState("");
  const naoLidas = notifs.filter((n) => !n.lida).length;
  const pendentes = reqs.filter((r) => r.st === "Pendente").length;
  const [, titulo, ajuda] = TELAS.find((t) => t[0] === view);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const enviar = (dados) => {
    setReqs((r) => [...r, { id: Date.now(), ...dados, st: "Pendente" }]);
    setToast("Solicitação enviada para a coordenação.");
    setView("sol");
  };
  const cancelar = (id) => {
    setReqs((r) => r.filter((x) => x.id !== id));
    setToast("Pedido cancelado.");
  };
  // Em produção, a resposta vem da coordenação (servidor). Aqui só simulamos.
  const resolver = (id, aprovado) => {
    const r = reqs.find((x) => x.id === id);
    setReqs((l) => l.map((x) => (x.id === id ? { ...x, st: aprovado ? "Aprovada" : "Recusada", mot: aprovado ? undefined : "Conflito com outra aula da turma" } : x)));
    if (aprovado) setHorario((h) => h.map((linha, i) => (i === r.a ? linha.map((c, j) => (j === r.dia ? { turma: r.turma, disc: r.disc } : c)) : linha)));
    setNotifs((n) => [{ id: Math.random(), ts: Date.now(), txt: `Sua aula de ${r.disc} na turma ${r.turma} foi ${aprovado ? "aprovada" : "recusada"}`, lida: false }, ...n]);
  };

  const conteudo = {
    home: <Inicio reqs={reqs} horario={horario} go={setView} naoLidas={naoLidas} />,
    cad: <Cadastrar reqs={reqs} horario={horario} enviar={enviar} />,
    sol: <Solicitacoes reqs={reqs} cancelar={cancelar} resolver={resolver} />,
    hor: <Horario horario={horario} />,
    reu: <Reunioes />,
    not: <Notificacoes notifs={notifs} setNotifs={setNotifs} />,
  }[view];

  return (
    <div className="app">
      <aside>
        <div className="brand">Calendário Escolar</div>
        <div className="sub">Painel do professor</div>
        <nav>
          {TELAS.map(([id, nome]) => (
            <button key={id} className={id === view ? "on" : ""} onClick={() => setView(id)}>
              <span>{nome}</span>
              {id === "sol" && pendentes > 0 && <span className="badge">{pendentes}</span>}
              {id === "not" && naoLidas > 0 && <span className="badge">{naoLidas}</span>}
            </button>
          ))}
        </nav>
        <div className="usuario">
          <span>{usuario.nome}</span>
          <button onClick={onSair}>Sair</button>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <h1>{view === "home" ? `Olá, ${usuario.nome.split(" ")[0]}` : titulo}</h1>
            <p className="help">{ajuda}</p>
          </div>
        </header>
        {conteudo}
      </main>

      <div className={`toast ${toast ? "on" : ""}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}