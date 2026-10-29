import { useState } from "react";

/* ---------- datas e utilitários ---------- */
const DIA_MS = 864e5;
const HOJE = new Date();
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const em = (n) => iso(new Date(HOJE.getFullYear(), HOJE.getMonth(), HOJE.getDate() + n)); // data daqui a n dias
const formatarData = (d) => d.split("-").reverse().join("/");
const restam = (d) => Math.round((new Date(`${d}T00:00`) - new Date(`${iso(HOJE)}T00:00`)) / DIA_MS);
const quando = (d) => {
  const n = restam(d);
  return n === 0 ? "Hoje" : n === 1 ? "Amanhã" : n > 1 ? `Em ${n} dias` : `Há ${-n} dias`;
};
const classeTipo = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const relativo = (ts) => {
  const n = Math.floor((Date.now() - ts) / DIA_MS);
  return n <= 0 ? "Hoje" : n === 1 ? "Ontem" : `Há ${n} dias`;
};

/* ---------- dados de exemplo (turma 6º A) ---------- */
const TURMA = "6º A";
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const HORAS = ["7h30", "8h20", "9h10", "10h20", "11h10"];
const GRADE = [
  ["Português", "Matemática", "Ciências", "História", "Geografia"],
  ["Matemática", "Português", "Inglês", "Ciências", "Artes"],
  ["Ciências", "Geografia", "Matemática", "Inglês", "Português"],
  ["Ed. Física", "Artes", "Português", "Matemática", "História"],
  ["Inglês", "Ed. Física", "História", "Geografia", "Ciências"],
];
const EVENTOS = [
  { t: "Prova de Matemática", k: "Prova", d: em(3) },
  { t: "Prova de Português", k: "Prova", d: em(6) },
  { t: "Reunião de pais", k: "Reunião", d: em(8) },
  { t: "Entrega do trabalho de Ciências", k: "Trabalho", d: em(12) },
  { t: "Conselho de classe", k: "Reunião", d: em(20) },
  { t: "Fim do 4º bimestre", k: "Prazo", d: em(34) },
];
const NOTIFICACOES0 = [
  { id: 1, ts: Date.now() - 2 * 3600e3, txt: "Nova prova publicada: Matemática", lida: false },
  { id: 2, ts: Date.now() - DIA_MS, txt: "O horário da turma 6º A foi atualizado", lida: false },
  { id: 3, ts: Date.now() - 3 * DIA_MS, txt: "Reunião de pais marcada", lida: true },
  { id: 4, ts: Date.now() - 6 * DIA_MS, txt: "Trabalho de Ciências publicado", lida: true },
];

const TELAS_ALUNO = [
  ["home", "Início", "O que vem por aí hoje e nos próximos dias."],
  ["cal", "Calendário", "Provas, trabalhos, prazos e reuniões do mês."],
  ["hor", "Meu horário", `Aulas da semana da turma ${TURMA}.`],
  ["prov", "Provas e prazos", "Tudo o que você precisa entregar ou estudar."],
  ["reu", "Reuniões", "Reuniões marcadas pela coordenação. Aqui você só consulta."],
  ["not", "Notificações", "Avisos enviados pela escola."],
];

function Tipo({ k }) {
  return <span className={`tag tipo ${classeTipo(k)}`}>{k}</span>;
}

/* ---------- telas ---------- */
function Inicio({ eventos, naoLidas, go }) {
  const idx = HOJE.getDay() - 1; // 0 = segunda; -1 ou 5 = fim de semana
  const aulas = idx >= 0 && idx < 5 ? GRADE.map((linha, i) => ({ hora: HORAS[i], disc: linha[idx] })) : [];
  const proximos = eventos.filter((x) => restam(x.d) >= 0).sort((a, b) => a.d.localeCompare(b.d)).slice(0, 3);

  return (
    <div className="grid">
      <div className="card">
        <h2>Aulas de hoje</h2>
        {aulas.length ? (
          <ul className="lista">
            {aulas.map((a) => (
              <li key={a.hora}><time>{a.hora}</time><span>{a.disc}</span></li>
            ))}
          </ul>
        ) : (
          <p className="meta">Sem aulas hoje. Bom descanso!</p>
        )}
        <button className="btn sec" onClick={() => go("hor")}>Ver horário da semana</button>
      </div>
      <div className="card">
        <h2>Próximos compromissos</h2>
        {proximos.length ? (
          proximos.map((x, i) => (
            <div key={i} className="item">
              <b>{x.t}</b> <Tipo k={x.k} />
              <div className="meta">{formatarData(x.d)} · {quando(x.d)}</div>
            </div>
          ))
        ) : (
          <p className="meta">Nada marcado por enquanto.</p>
        )}
        <button className="btn sec" onClick={() => go("prov")}>Ver provas e prazos</button>
      </div>
      <div className="card">
        <div className="meta">Notificações novas</div>
        <div className="stat">{naoLidas}</div>
        <p className="meta">{naoLidas ? "A escola enviou avisos que você ainda não leu." : "Você está em dia."}</p>
        <button className="btn" onClick={() => go("not")}>Abrir notificações</button>
      </div>
    </div>
  );
}

function Calendario({ eventos }) {
  const [mes, setMes] = useState(new Date(HOJE.getFullYear(), HOJE.getMonth(), 1));
  const [sel, setSel] = useState(iso(HOJE));
  const ano = mes.getFullYear();
  const m = mes.getMonth();
  const total = new Date(ano, m + 1, 0).getDate();
  const celulas = [...Array(mes.getDay()).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const doDia = (d) => eventos.filter((x) => x.d === iso(new Date(ano, m, d)));
  const doSelecionado = eventos.filter((x) => x.d === sel);
  const nomeMes = mes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <>
      <div className="card">
        <div className="cal-topo">
          <button className="btn sec" onClick={() => setMes(new Date(ano, m - 1, 1))} aria-label="Mês anterior">‹</button>
          <h2 className="cal-mes">{nomeMes}</h2>
          <button className="btn sec" onClick={() => setMes(new Date(ano, m + 1, 1))} aria-label="Próximo mês">›</button>
        </div>
        <div className="cal">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => <div key={d} className="cal-cab">{d}</div>)}
          {celulas.map((d, i) => {
            if (!d) return <div key={i} />;
            const data = iso(new Date(ano, m, d));
            const evs = doDia(d);
            return (
              <button
                key={i}
                className={`cal-dia ${data === iso(HOJE) ? "hoje" : ""} ${data === sel ? "sel" : ""}`}
                onClick={() => setSel(data)}
                aria-label={`${d}, ${evs.length} compromisso(s)`}
              >
                <span>{d}</span>
                <span className="pontos">
                  {evs.map((x, j) => <i key={j} className={`ponto ${classeTipo(x.k)}`} />)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="card">
        <h2>{formatarData(sel)}</h2>
        {doSelecionado.length ? (
          doSelecionado.map((x, i) => (
            <div key={i} className="item"><b>{x.t}</b> <Tipo k={x.k} /></div>
          ))
        ) : (
          <p className="meta">Nada marcado neste dia.</p>
        )}
      </div>
    </>
  );
}

function Horario() {
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
          {GRADE.map((linha, ri) => (
            <tr key={ri}>
              <th>{ri + 1}ª aula<div className="meta">{HORAS[ri]}</div></th>
              {linha.map((c, ci) => <td key={ci} className={ci === hoje ? "hoje-col" : ""}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProvasEPrazos({ eventos }) {
  const [filtro, setFiltro] = useState("Todos");
  const lista = eventos
    .filter((x) => x.k !== "Reunião" && restam(x.d) >= 0 && (filtro === "Todos" || x.k === filtro))
    .sort((a, b) => a.d.localeCompare(b.d));

  return (
    <>
      <div className="tabs">
        {["Todos", "Prova", "Trabalho", "Prazo"].map((f) => (
          <button key={f} className={filtro === f ? "on" : ""} onClick={() => setFiltro(f)}>
            {f === "Todos" ? "Todos" : f + "s"}
          </button>
        ))}
      </div>
      {lista.length === 0 && <div className="card empty">Nada à vista nesta categoria.</div>}
      {lista.map((x, i) => (
        <div className="card" key={i}>
          <div className="req">
            <div>
              <b>{x.t}</b> <Tipo k={x.k} />
              <div className="meta">{formatarData(x.d)}</div>
            </div>
            <span className={`tag ${restam(x.d) <= 3 ? "bad" : ""}`}>{quando(x.d)}</span>
          </div>
        </div>
      ))}
    </>
  );
}

function Reunioes({ eventos }) {
  const lista = eventos.filter((x) => x.k === "Reunião" && restam(x.d) >= 0).sort((a, b) => a.d.localeCompare(b.d));
  return (
    <>
      {lista.length === 0 && <div className="card empty">Nenhuma reunião marcada.</div>}
      {lista.map((x, i) => (
        <div className="card" key={i}>
          <div className="req">
            <div>
              <b>{x.t}</b>
              <div className="meta">{formatarData(x.d)}</div>
            </div>
            <span className="tag">{quando(x.d)}</span>
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

/* ---------- aplicação do aluno ---------- */
export default function AlunoApp({ usuario, onSair }) {
  const restrito = usuario.perfil === "Aluno restrito";
  const telas = restrito ? TELAS_ALUNO.filter((t) => t[0] === "reu") : TELAS_ALUNO;
  const [view, setView] = useState(telas[0][0]);
  const [notifs, setNotifs] = useState(NOTIFICACOES0);
  const naoLidas = notifs.filter((n) => !n.lida).length;
  const [, titulo, ajuda] = telas.find((t) => t[0] === view);

  const conteudo = {
    home: <Inicio eventos={EVENTOS} naoLidas={naoLidas} go={setView} />,
    cal: <Calendario eventos={EVENTOS} />,
    hor: <Horario />,
    prov: <ProvasEPrazos eventos={EVENTOS} />,
    reu: <Reunioes eventos={EVENTOS} />,
    not: <Notificacoes notifs={notifs} setNotifs={setNotifs} />,
  }[view];

  return (
    <div className="app">
      <aside>
        <div className="brand">Calendário Escolar</div>
        <div className="sub">Painel do aluno</div>
        <nav>
          {telas.map(([id, nome]) => (
            <button key={id} className={id === view ? "on" : ""} onClick={() => setView(id)}>
              <span>{nome}</span>
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
          {!restrito && <span className="tag">Turma {TURMA} · Manhã</span>}
        </header>
        {conteudo}
      </main>
    </div>
  );
}