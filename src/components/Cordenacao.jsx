import { createContext, useContext, useEffect, useState } from "react";
import "./Cordenacao.css";

/* ---------- constantes e dados de exemplo ---------- */
const DIA = 864e5;
const LIMITE_LOG = 30 * DIA; // registros guardados por 30 dias
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const DISCIPLINAS = ["Português", "Matemática", "Ciências", "História", "Geografia", "Inglês", "Artes", "Ed. Física", "Livre"];
const PERFIS = ["Coordenação", "Professor", "Aluno"];

const PERMISSOES = [
  ["Anos, turmas e usuários", "Sim", "Não", "Não", "Não"],
  ["Aprovar ou recusar solicitações", "Sim", "Não", "Não", "Não"],
  ["Cadastrar aulas", "Sim", "Pede aprovação", "Não", "Não"],
  ["Publicar provas, trabalhos e prazos", "Sim", "Não", "Não", "Não"],
  ["Reuniões", "Cria e edita", "Só ver", "Só ver", "Só ver"],
  ["Calendário e horários", "Sim", "Só ver (o seu)", "Só ver", "Não"],
];
const TELAS = [
  ["home", "Início", "Um resumo do que precisa da sua atenção."],
  ["apr", "Aprovações", "Tudo o que os professores cadastram passa por aqui antes de ser publicado."],
  ["hor", "Horários e aulas", "Edite a grade de cada turma. Alterações da coordenação são publicadas direto."],
  ["ev", "Eventos e reuniões", "Publique provas, trabalhos, prazos e reuniões."],
  ["anos", "Anos e turmas", "Planeje os próximos anos letivos e organize turmas e turnos."],
  ["usr", "Usuários e perfis", "Defina quem acessa o sistema e o que cada perfil pode fazer."],
  ["log", "Registro de atividades", "Quem fez o quê. Os registros são guardados por 30 dias."],
];

const gerarGrade = (i) =>
  Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_, c) => DISCIPLINAS[(r * 2 + c + i) % 8]));
const formatarData = (d) => d.split("-").reverse().join("/");
const relativo = (ts) => {
  const n = Math.floor((Date.now() - ts) / DIA);
  return n <= 0 ? "Hoje" : n === 1 ? "Ontem" : `Há ${n} dias`;
};
const hora = (ts) => new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const vivo = (x) => Date.now() - x.ts <= LIMITE_LOG;

const TURMAS0 = [
  { n: "6º A", s: "6º ano", t: "Manhã", a: 32 },
  { n: "7º B", s: "7º ano", t: "Manhã", a: 30 },
  { n: "1º EM A", s: "1ª série EM", t: "Tarde", a: 35 },
];
const SOLICITACOES0 = [
  { id: 1, p: "Carlos Mendes", t: "6º A", d: "Ciências", dia: 1, a: 1, st: "Pendente" },
  { id: 2, p: "Helena Prado", t: "7º B", d: "Inglês", dia: 3, a: 3, st: "Pendente" },
  { id: 3, p: "Carlos Mendes", t: "1º EM A", d: "Matemática", dia: 4, a: 0, st: "Pendente" },
  { id: 4, p: "Helena Prado", t: "6º A", d: "Artes", dia: 0, a: 4, st: "Aprovada" },
  { id: 5, p: "Carlos Mendes", t: "7º B", d: "História", dia: 2, a: 2, st: "Recusada", mot: "Horário já ocupado por Geografia" },
];
const EVENTOS0 = [
  { t: "Prova de Matemática", k: "Prova", d: "2026-10-27", m: "6º A" },
  { t: "Reunião de pais", k: "Reunião", d: "2026-11-04", m: "Todas" },
  { t: "Entrega do trabalho de Ciências", k: "Trabalho", d: "2026-11-09", m: "7º B" },
  { t: "Fim do 4º bimestre", k: "Prazo", d: "2026-12-11", m: "Todas" },
];
const USUARIOS0 = [
  { n: "Marta Lima", p: "Coordenação", on: true },
  { n: "Carlos Mendes", p: "Professor", on: true },
  { n: "Helena Prado", p: "Professor", on: true },
  { n: "Ana Souza", p: "Aluno", on: true },
  { n: "Rafael Teixeira", p: "Aluno restrito", on: true },
];
const agora = Date.now();
const LOG0 = [
  { id: 1, ts: agora - 3600e3, txt: "Aprovou a aula de Artes da turma 6º A" },
  { id: 2, ts: agora - DIA * 2, txt: "Publicou a reunião de pais" },
  { id: 3, ts: agora - DIA * 9, txt: "Criou a turma 1º EM A" },
  { id: 4, ts: agora - DIA * 27, txt: "Cadastrou o usuário Rafael Teixeira" },
  { id: 5, ts: agora - DIA * 41, txt: "Criou o ano letivo 2026" }, // mais de 30 dias: é descartado
];

/* ---------- contexto compartilhado ---------- */
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

function Campo({ label, children }) {
  return (
    <label>
      {label}
      {children}
    </label>
  );
}

function AvisoAnoEncerrado() {
  const { ro } = useApp();
  return ro ? <div className="notice">Este ano letivo está encerrado: só é possível consultar.</div> : null;
}

/* ---------- telas ---------- */
function Inicio() {
  const { reqs, eventos, log, go } = useApp();
  const pendentes = reqs.filter((r) => r.st === "Pendente").length;
  const hoje = new Date().toISOString().slice(0, 10);
  const proximos = eventos.filter((x) => x.d >= hoje).sort((a, b) => a.d.localeCompare(b.d)).slice(0, 3);
  const recentes = log.filter(vivo).slice(0, 3);

  return (
    <div className="grid">
      <div className="card">
        <div className="meta">Aguardando sua aprovação</div>
        <div className="stat">{pendentes}</div>
        <p className="meta">{pendentes ? "Professores esperam resposta para publicar as aulas." : "Tudo em dia."}</p>
        <button className="btn" onClick={() => go("apr")}>{pendentes ? "Revisar agora" : "Ver histórico"}</button>
      </div>
      <div className="card">
        <h2>Próximos eventos</h2>
        {proximos.length ? (
          proximos.map((x, i) => (
            <div key={i} className="item">
              <b>{x.t}</b>
              <div className="meta">{formatarData(x.d)} · {x.m}</div>
            </div>
          ))
        ) : (
          <div className="meta">Nenhum evento à frente.</div>
        )}
        <button className="btn sec" onClick={() => go("ev")}>Publicar evento</button>
      </div>
      <div className="card">
        <h2>Atividade recente</h2>
        <ul className="log">
          {recentes.map((x) => (
            <li key={x.id}><time>{relativo(x.ts)}</time><span>{x.txt}</span></li>
          ))}
        </ul>
        <button className="btn sec" onClick={() => go("log")}>Ver registro completo</button>
      </div>
    </div>
  );
}

function Aprovacoes() {
  const { reqs, setReqs, H, setH, ro, act, say } = useApp();
  const [filtro, setFiltro] = useState("Pendente");
  const [motivos, setMotivos] = useState({});
  const pendentes = reqs.filter((r) => r.st === "Pendente").length;
  const lista = reqs.filter((r) => (filtro === "Pendente" ? r.st === "Pendente" : r.st !== "Pendente"));

  const aprovar = (r) => {
    setH((h) => ({
      ...h,
      [r.t]: h[r.t].map((linha, i) => (i === r.a ? linha.map((c, j) => (j === r.dia ? r.d : c)) : linha)),
    }));
    setReqs((rs) => rs.map((x) => (x.id === r.id ? { ...x, st: "Aprovada" } : x)));
    act(`Aprovou a aula de ${r.d} da turma ${r.t}`);
    say(`Aula publicada. ${r.p} foi avisado(a) por e-mail.`);
  };
  const recusar = (r) => {
    const mot = (motivos[r.id] || "").trim() || "Sem motivo informado";
    setReqs((rs) => rs.map((x) => (x.id === r.id ? { ...x, st: "Recusada", mot } : x)));
    act(`Recusou a aula de ${r.d} da turma ${r.t}`);
    say(`Solicitação recusada. ${r.p} foi avisado(a).`);
  };

  return (
    <>
      <AvisoAnoEncerrado />
      <div className="tabs">
        <button className={filtro === "Pendente" ? "on" : ""} onClick={() => setFiltro("Pendente")}>Pendentes ({pendentes})</button>
        <button className={filtro === "Pendente" ? "" : "on"} onClick={() => setFiltro("Histórico")}>Histórico</button>
      </div>
      {lista.length === 0 && (
        <div className="card empty">{filtro === "Pendente" ? "Nenhuma solicitação pendente. Bom trabalho!" : "Ainda não há histórico."}</div>
      )}
      {lista.map((r) => {
        const atual = H[r.t]?.[r.a]?.[r.dia];
        const conflito = atual && atual !== "Livre" && atual !== r.d;
        return (
          <div className="card" key={r.id}>
            <div className="req">
              <div>
                <b>{r.d} · {r.t}</b>
                <div className="meta">Pedido por {r.p} · {DIAS[r.dia]}, {r.a + 1}ª aula</div>
                {r.st === "Pendente" && conflito && <div className="warn">Vai substituir {atual} neste horário</div>}
                {r.mot && <div className="meta">Motivo: {r.mot}</div>}
              </div>
              {r.st === "Pendente" ? (
                <div className="row">
                  <Campo label="Motivo da recusa (opcional)">
                    <input size="22" value={motivos[r.id] || ""} onChange={(e) => setMotivos({ ...motivos, [r.id]: e.target.value })} />
                  </Campo>
                  <button className="btn sec" disabled={ro} onClick={() => recusar(r)}>Recusar</button>
                  <button className="btn" disabled={ro} onClick={() => aprovar(r)}>Aprovar</button>
                </div>
              ) : (
                <span className={`tag ${r.st === "Aprovada" ? "ok" : "bad"}`}>{r.st}</span>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

function Horarios() {
  const { turmas, selT, setSelT, H, setH, ro, act, say } = useApp();
  const grade = H[selT] || gerarGrade(0);

  const mudarCelula = (linha, coluna, valor) =>
    setH((h) => ({
      ...h,
      [selT]: h[selT].map((l, i) => (i === linha ? l.map((c, j) => (j === coluna ? valor : c)) : l)),
    }));

  return (
    <>
      <AvisoAnoEncerrado />
      <div className="card">
        <div className="row bar">
          <Campo label="Turma">
            <select value={selT} onChange={(e) => setSelT(e.target.value)}>
              {turmas.map((t) => <option key={t.n}>{t.n}</option>)}
            </select>
          </Campo>
          <button className="btn sec" onClick={() => { act(`Publicou o horário da turma ${selT}`); say(`Horário da ${selT} publicado. Notificações enviadas.`); }}>
            Publicar alterações
          </button>
        </div>
        <div className="scroll">
          <table>
            <thead>
              <tr><th></th>{DIAS.map((d) => <th key={d}>{d}</th>)}</tr>
            </thead>
            <tbody>
              {grade.map((linha, ri) => (
                <tr key={ri}>
                  <th>{ri + 1}ª aula</th>
                  {linha.map((c, ci) => (
                    <td key={ci}>
                      <select disabled={ro} value={c} onChange={(e) => mudarCelula(ri, ci, e.target.value)}>
                        {DISCIPLINAS.map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Eventos() {
  const { eventos, setEventos, turmas, ro, act, say, ask } = useApp();
  const vazio = { titulo: "", tipo: "Prova", data: "", turma: "Todas" };
  const [f, setF] = useState(vazio);
  const [erro, setErro] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const publicar = () => {
    if (!f.titulo.trim() || !f.data) return setErro("Preencha o título e a data.");
    setEventos((x) => [...x, { t: f.titulo.trim(), k: f.tipo, d: f.data, m: f.turma }]);
    act(`Publicou: ${f.titulo.trim()}`);
    setF(vazio);
    setErro("");
    say("Publicado. Notificação e e-mail enviados.");
  };
  const remover = (ev) =>
    ask(`Remover “${ev.t}”?`, () => {
      setEventos((x) => x.filter((y) => y !== ev));
      act(`Removeu: ${ev.t}`);
      say("Evento removido.");
    });

  return (
    <>
      <AvisoAnoEncerrado />
      <div className="card scroll">
        <table>
          <thead>
            <tr><th>Data</th><th>Evento</th><th>Tipo</th><th>Turma</th><th>Quem vê</th><th></th></tr>
          </thead>
          <tbody>
            {[...eventos].sort((a, b) => a.d.localeCompare(b.d)).map((x, i) => (
              <tr key={i}>
                <td>{formatarData(x.d)}</td>
                <td>{x.t}</td>
                <td><span className="tag">{x.k}</span></td>
                <td>{x.m}</td>
                <td>{x.k === "Reunião" ? "Professores e alunos restritos" : "Alunos da turma"}</td>
                <td><button className="btn del" disabled={ro} onClick={() => remover(x)}>Remover</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2>Novo evento</h2>
        <div className="row">
          <Campo label="Título"><input size="24" disabled={ro} value={f.titulo} onChange={set("titulo")} /></Campo>
          <Campo label="Tipo">
            <select disabled={ro} value={f.tipo} onChange={set("tipo")}>
              <option>Prova</option><option>Trabalho</option><option>Reunião</option><option>Prazo</option>
            </select>
          </Campo>
          <Campo label="Data"><input type="date" disabled={ro} value={f.data} onChange={set("data")} /></Campo>
          <Campo label="Turma">
            <select disabled={ro} value={f.turma} onChange={set("turma")}>
              <option>Todas</option>
              {turmas.map((t) => <option key={t.n}>{t.n}</option>)}
            </select>
          </Campo>
          <button className="btn" disabled={ro} onClick={publicar}>Publicar</button>
        </div>
        {erro && <p className="err">{erro}</p>}
      </div>
    </>
  );
}

function AnosETurmas() {
  const { anos, setAnos, turmas, setTurmas, setH, selT, setSelT, setCur, ro, act, say, ask } = useApp();
  const [ano, setAno] = useState("");
  const [erroAno, setErroAno] = useState("");
  const [t, setT] = useState({ n: "", s: "", turno: "Manhã" });
  const [erroTurma, setErroTurma] = useState("");

  const ultimo = Math.max(...anos.map((a) => +a.n));
  const sugestoes = [1, 2, 3, 4].map((i) => String(ultimo + i));

  const criarAno = () => {
    const n = ano.trim();
    if (!/^\d{4}$/.test(n)) return setErroAno("Digite um ano com 4 dígitos ou escolha uma sugestão.");
    if (anos.some((a) => a.n === n)) return setErroAno("Esse ano letivo já existe.");
    setAnos((a) => [...a, { n, st: +n > ultimo ? "Planejado" : "Encerrado" }].sort((x, y) => y.n - x.n));
    act(`Criou o ano letivo ${n}`);
    setAno("");
    setErroAno("");
    say(`Ano letivo ${n} criado.`);
  };
  const ativar = (n) =>
    ask(`Definir ${n} como ano ativo? O ano ativo atual passa a ficar encerrado.`, () => {
      setAnos((a) => a.map((x) => ({ ...x, st: x.n === n ? "Ativo" : x.st === "Ativo" ? "Encerrado" : x.st })));
      setCur(n);
      act(`Definiu ${n} como ano ativo`);
      say(`Ano ${n} agora é o ano ativo.`);
    });
  const criarTurma = () => {
    const n = t.n.trim(), s = t.s.trim();
    if (!n || !s) return setErroTurma("Preencha o nome da turma e a série.");
    if (turmas.some((x) => x.n === n)) return setErroTurma("Já existe uma turma com esse nome.");
    setTurmas((x) => [...x, { n, s, t: t.turno, a: 0 }]);
    setH((h) => ({ ...h, [n]: gerarGrade(turmas.length) }));
    act(`Criou a turma ${n}`);
    setT({ n: "", s: "", turno: "Manhã" });
    setErroTurma("");
    say(`Turma ${n} adicionada.`);
  };
  const removerTurma = (turma) =>
    ask(`Remover a turma ${turma.n}? O horário dela também será apagado.`, () => {
      setTurmas((x) => x.filter((y) => y.n !== turma.n));
      setH((h) => { const { [turma.n]: _, ...resto } = h; return resto; });
      if (selT === turma.n) setSelT(turmas.find((y) => y.n !== turma.n)?.n || "");
      act(`Removeu a turma ${turma.n}`);
      say("Turma removida.");
    });

  return (
    <>
      <div className="card scroll">
        <h2>Anos letivos</h2>
        <table>
          <thead><tr><th>Ano</th><th>Situação</th><th></th></tr></thead>
          <tbody>
            {anos.map((a) => (
              <tr key={a.n}>
                <td><b>{a.n}</b></td>
                <td><span className={`tag ${a.st === "Ativo" ? "ok" : ""}`}>{a.st}</span></td>
                <td>{a.st !== "Ativo" && <button className="btn sec" onClick={() => ativar(a.n)}>Definir como ativo</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Planejar novo ano letivo</h2>
        <div className="meta">Sugestões para frente:</div>
        <div className="chips">
          {sugestoes.map((n) => <button key={n} onClick={() => setAno(n)}>{n}</button>)}
        </div>
        <div className="row">
          <Campo label="Ano"><input size="6" placeholder={`Ex.: ${sugestoes[0]}`} value={ano} onChange={(e) => setAno(e.target.value)} /></Campo>
          <button className="btn" onClick={criarAno}>Criar ano letivo</button>
        </div>
        {erroAno && <p className="err">{erroAno}</p>}
      </div>

      <AvisoAnoEncerrado />
      <div className="card scroll">
        <h2>Turmas, séries e turnos</h2>
        <table>
          <thead><tr><th>Turma</th><th>Série</th><th>Turno</th><th>Alunos</th><th></th></tr></thead>
          <tbody>
            {turmas.map((x) => (
              <tr key={x.n}>
                <td>{x.n}</td><td>{x.s}</td><td>{x.t}</td><td>{x.a}</td>
                <td><button className="btn del" disabled={ro} onClick={() => removerTurma(x)}>Remover</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="row topo">
          <Campo label="Turma"><input size="8" placeholder="8º A" disabled={ro} value={t.n} onChange={(e) => setT({ ...t, n: e.target.value })} /></Campo>
          <Campo label="Série"><input size="12" placeholder="8º ano" disabled={ro} value={t.s} onChange={(e) => setT({ ...t, s: e.target.value })} /></Campo>
          <Campo label="Turno">
            <select disabled={ro} value={t.turno} onChange={(e) => setT({ ...t, turno: e.target.value })}>
              <option>Manhã</option><option>Tarde</option><option>Noite</option>
            </select>
          </Campo>
          <button className="btn" disabled={ro} onClick={criarTurma}>Adicionar turma</button>
        </div>
        {erroTurma && <p className="err">{erroTurma}</p>}
      </div>
    </>
  );
}

function Usuarios() {
  const { users, setUsers, act, say } = useApp();
  const [f, setF] = useState({ nome: "", perfil: "Aluno" });
  const [erro, setErro] = useState("");

  const criar = () => {
    if (!f.nome.trim()) return setErro("Informe o nome.");
    setUsers((u) => [...u, { n: f.nome.trim(), p: f.perfil, on: true }]);
    act(`Cadastrou o usuário ${f.nome.trim()}`);
    setF({ nome: "", perfil: "Aluno" });
    setErro("");
    say("Usuário criado.");
  };
  const mudarPerfil = (i, p) => {
    setUsers((u) => u.map((x, j) => (j === i ? { ...x, p } : x)));
    act(`Mudou o perfil de ${users[i].n} para ${p}`);
    say(`Perfil de ${users[i].n} alterado.`);
  };
  const alternarAcesso = (i) => {
    const u = users[i];
    setUsers((l) => l.map((x, j) => (j === i ? { ...x, on: !x.on } : x)));
    act(`${u.on ? "Bloqueou" : "Liberou"} o acesso de ${u.n}`);
  };

  return (
    <>
      <div className="card scroll">
        <table>
          <thead><tr><th>Nome</th><th>Perfil</th><th>Acesso</th></tr></thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i}>
                <td>{u.n}</td>
                <td>
                  <select value={u.p} onChange={(e) => mudarPerfil(i, e.target.value)}>
                    {PERFIS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </td>
                <td><button className="btn sec" onClick={() => alternarAcesso(i)}>{u.on ? "Ativo" : "Bloqueado"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="row topo">
          <Campo label="Nome"><input size="22" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></Campo>
          <Campo label="Perfil">
            <select value={f.perfil} onChange={(e) => setF({ ...f, perfil: e.target.value })}>
              {PERFIS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Campo>
          <button className="btn" onClick={criar}>Criar usuário</button>
        </div>
        {erro && <p className="err">{erro}</p>}
      </div>

      <div className="card scroll">
        <h2>O que cada perfil pode fazer</h2>
        <table>
          <thead><tr><th></th>{PERFIS.map((p) => <th key={p}>{p}</th>)}</tr></thead>
          <tbody>
            {PERMISSOES.map(([acao, ...valores]) => (
              <tr key={acao}>
                <td>{acao}</td>
                {valores.map((v, i) => (
                  <td key={i} className={v === "Sim" ? "yes" : v === "Não" ? "no" : "mid"}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Registro() {
  const { log } = useApp();
  const [dias, setDias] = useState(30);
  const lista = log.filter((x) => vivo(x) && Date.now() - x.ts <= dias * DIA);

  return (
    <>
      <div className="notice">Os registros ficam guardados por 30 dias. Depois disso, são apagados automaticamente.</div>
      <div className="tabs">
        {[[1, "Hoje"], [7, "7 dias"], [30, "30 dias"]].map(([d, rotulo]) => (
          <button key={d} className={dias === d ? "on" : ""} onClick={() => setDias(d)}>{rotulo}</button>
        ))}
      </div>
      <div className="card">
        {lista.length ? (
          <ul className="log">
            {lista.map((x) => (
              <li key={x.id}>
                <time>{relativo(x.ts)}<br />{hora(x.ts)}</time>
                <span><b>Marta Lima</b> · {x.txt}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">Nenhuma atividade neste período.</div>
        )}
      </div>
    </>
  );
}

/* ---------- aplicação ---------- */
const COMPONENTES = { home: Inicio, apr: Aprovacoes, hor: Horarios, ev: Eventos, anos: AnosETurmas, usr: Usuarios, log: Registro };

export default function CoordenacaoApp() {
  const [view, setView] = useState("home");
  const [cur, setCur] = useState("2026");
  const [selT, setSelT] = useState("6º A");
  const [anos, setAnos] = useState([{ n: "2026", st: "Ativo" }, { n: "2025", st: "Encerrado" }]);
  const [turmas, setTurmas] = useState(TURMAS0);
  const [H, setH] = useState(() => Object.fromEntries(TURMAS0.map((t, i) => [t.n, gerarGrade(i)])));
  const [reqs, setReqs] = useState(SOLICITACOES0);
  const [eventos, setEventos] = useState(EVENTOS0);
  const [users, setUsers] = useState(USUARIOS0);
  const [log, setLog] = useState(LOG0);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => setLog((l) => l.filter(vivo)), []); // descarta registros com mais de 30 dias
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const act = (txt) => setLog((l) => [{ id: Math.random(), ts: Date.now(), txt }, ...l].filter(vivo));
  const ask = (msg, fn) => setModal({ msg, fn });
  const ro = anos.find((a) => a.n === cur)?.st === "Encerrado";
  const pendentes = reqs.filter((r) => r.st === "Pendente").length;

  const ctx = { cur, setCur, selT, setSelT, anos, setAnos, turmas, setTurmas, H, setH, reqs, setReqs, eventos, setEventos, users, setUsers, log, ro, act, say: setToast, ask, go: setView };
  const [, titulo, ajuda] = TELAS.find((t) => t[0] === view);
  const Tela = COMPONENTES[view];

  return (
    <AppContext.Provider value={ctx}>
      <div className="app">
        <aside>
          <div className="brand">Calendário Escolar</div>
          <div className="sub">Painel da coordenação</div>
          <nav>
            {TELAS.map(([id, nome]) => (
              <button key={id} className={id === view ? "on" : ""} onClick={() => setView(id)}>
                <span>{nome}</span>
                {id === "apr" && pendentes > 0 && <span className="badge">{pendentes}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <main>
          <header>
            <div>
              <h1>{titulo}</h1>
              <p className="help">{ajuda}</p>
            </div>
            <label className="row ano">
              <span className="meta">Ano letivo</span>
              <select value={cur} onChange={(e) => setCur(e.target.value)}>
                {anos.map((a) => <option key={a.n}>{a.n}</option>)}
              </select>
            </label>
          </header>
          <Tela />
        </main>

        {modal && (
          <div className="modal" role="dialog" aria-modal="true">
            <div className="card">
              <p>{modal.msg}</p>
              <div className="row fim">
                <button className="btn sec" onClick={() => setModal(null)}>Cancelar</button>
                <button className="btn" onClick={() => { modal.fn(); setModal(null); }}>Confirmar</button>
              </div>
            </div>
          </div>
        )}
        <div className={`toast ${toast ? "on" : ""}`} role="status" aria-live="polite">{toast}</div>
      </div>
    </AppContext.Provider>
  );
}


