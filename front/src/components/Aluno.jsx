import { useState } from "react";
import "./Aluno.css";

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

/* ---------- datas dos compromissos (turma 6º A) ---------- */
const TURMA = "6º A";
const PROVA_MATEMATICA = em(3);
const PROVA_PORTUGUES = em(6);
const REUNIAO_PAIS = em(8);
const TRABALHO_CIENCIAS = em(12);
const CONSELHO_CLASSE = em(20);
const FIM_BIMESTRE = em(34);

const EVENTOS = [
  {
    t: "Prova de Matemática", k: "Prova", d: PROVA_MATEMATICA,
    desc: "Avaliação do 4º bimestre sobre frações e números decimais. Traga lápis, borracha e régua."
  },
  {
    t: "Prova de Português", k: "Prova", d: PROVA_PORTUGUES,
    desc: "Interpretação de texto e gramática vistas no bimestre. A prova começa na 1ª aula."
  },
  {
    t: "Reunião de pais", k: "Reunião", d: REUNIAO_PAIS,
    desc: "Encontro com a coordenação para entregar as notas do bimestre e conversar sobre o desempenho da turma."
  },
  {
    t: "Entrega do trabalho de Ciências", k: "Trabalho", d: TRABALHO_CIENCIAS,
    desc: "Entrega do trabalho em grupo sobre ecossistemas. Leve o trabalho impresso para o professor."
  },
  {
    t: "Conselho de classe", k: "Reunião", d: CONSELHO_CLASSE,
    desc: "Os professores avaliam o rendimento da turma no bimestre."
  },
  {
    t: "Fim do 4º bimestre", k: "Prazo", d: FIM_BIMESTRE,
    desc: "Último dia do bimestre. Notas e faltas são fechadas neste dia."
  }
];

const temCompromisso = (d) => EVENTOS.some((evento) => evento.d === d);

/* ---------- pecinhas reutilizáveis ---------- */
function Tipo({ k }) {
  return <span className={`tag tipo ${classeTipo(k)}`}>{k}</span>;
}

function Aula({ hora, disc }) {
  return (
    <li>
      <time>{hora}</time>
      <span>{disc}</span>
    </li>
  );
}

// item com título, tipo, data e "quando" (usado no Início e na lista do calendário)
function ItemInicio({ t, k, d }) {
  return (
    <div className="item">
      <b>{t}</b> <Tipo k={k} />
      <div className="meta">{formatarData(d)} · {quando(d)}</div>
    </div>
  );
}

// item usado nos detalhes do dia do calendário
function ItemDia({ t, k }) {
  return (
    <div className="item">
      <b>{t}</b> <Tipo k={k} />
    </div>
  );
}

// cartão da tela "Reuniões"
function CartaoReuniao({ t, d }) {
  return (
    <div className="card">
      <div className="req">
        <div>
          <b>{t}</b>
          <div className="meta">{formatarData(d)}</div>
        </div>
        <span className="tag">{quando(d)}</span>
      </div>
    </div>
  );
}

/* ---------- aulas de hoje (cada dia da semana escrito direto) ---------- */
function AulasDeHoje({ dia }) {
  return (
    <ul className="lista">
      {dia === 1 && (
        <>
          <Aula hora="7h30" disc="Português" />
          <Aula hora="8h20" disc="Matemática" />
          <Aula hora="9h10" disc="Ciências" />
          <Aula hora="10h20" disc="Ed. Física" />
          <Aula hora="11h10" disc="Inglês" />
        </>
      )}
      {dia === 2 && (
        <>
          <Aula hora="7h30" disc="Matemática" />
          <Aula hora="8h20" disc="Português" />
          <Aula hora="9h10" disc="Geografia" />
          <Aula hora="10h20" disc="Artes" />
          <Aula hora="11h10" disc="Ed. Física" />
        </>
      )}
      {dia === 3 && (
        <>
          <Aula hora="7h30" disc="Ciências" />
          <Aula hora="8h20" disc="Inglês" />
          <Aula hora="9h10" disc="Matemática" />
          <Aula hora="10h20" disc="Português" />
          <Aula hora="11h10" disc="História" />
        </>
      )}
      {dia === 4 && (
        <>
          <Aula hora="7h30" disc="História" />
          <Aula hora="8h20" disc="Ciências" />
          <Aula hora="9h10" disc="Inglês" />
          <Aula hora="10h20" disc="Matemática" />
          <Aula hora="11h10" disc="Geografia" />
        </>
      )}
      {dia === 5 && (
        <>
          <Aula hora="7h30" disc="Geografia" />
          <Aula hora="8h20" disc="Artes" />
          <Aula hora="9h10" disc="Português" />
          <Aula hora="10h20" disc="História" />
          <Aula hora="11h10" disc="Ciências" />
        </>
      )}
    </ul>
  );
}

/* ---------- telas ---------- */
function Inicio({ naoLidas, go }) {
  const dia = HOJE.getDay(); // 0 = domingo ... 6 = sábado
  const fimDeSemana = dia === 0 || dia === 6;

  return (
    <div className="grid">
      <div className="card">
        <h2>Aulas de hoje</h2>
        {fimDeSemana ? <p className="meta">Sem aulas hoje. Bom descanso!</p> : <AulasDeHoje dia={dia} />}
        <button className="btn sec" onClick={() => go("hor")}>Ver horário da semana</button>
      </div>

      <div className="card">
        <h2>Próximos compromissos</h2>
        <ItemInicio t="Prova de Matemática" k="Prova" d={PROVA_MATEMATICA} />
        <ItemInicio t="Prova de Português" k="Prova" d={PROVA_PORTUGUES} />
        <ItemInicio t="Reunião de pais" k="Reunião" d={REUNIAO_PAIS} />
        <button className="btn sec" onClick={() => go("cal")}>Ver calendário</button>
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

// nome do evento dentro de cada dia do calendário (no celular vira uma bolinha colorida)
function Eventos({ data }) {
  return (
    <span className="chips">
      {data === PROVA_MATEMATICA && <span className="chip prova">Prova de Matemática</span>}
      {data === PROVA_PORTUGUES && <span className="chip prova">Prova de Português</span>}
      {data === REUNIAO_PAIS && <span className="chip reuniao">Reunião de pais</span>}
      {data === TRABALHO_CIENCIAS && <span className="chip trabalho">Trabalho de Ciências</span>}
      {data === CONSELHO_CLASSE && <span className="chip reuniao">Conselho de classe</span>}
      {data === FIM_BIMESTRE && <span className="chip prazo">Fim do 4º bimestre</span>}
    </span>
  );
}

// item da lista do calendário: a descrição aparece ao passar o mouse
// ou ao navegar até o evento pelo teclado.
function ItemLista({ t, k, d, desc }) {
  return (
    <div className="item evento-lista" tabIndex={0} aria-label={`${t}. ${formatarData(d)}. ${desc}`}>
      <b>{t}</b> <Tipo k={k} />
      <div className="meta">{formatarData(d)} · {quando(d)}</div>
      <p className="desc">{desc}</p>
    </div>
  );
}

function Calendario() {
  const [mes, setMes] = useState(new Date(HOJE.getFullYear(), HOJE.getMonth(), 1));
  const [sel, setSel] = useState(iso(HOJE));
  const ano = mes.getFullYear();
  const m = mes.getMonth();
  const total = new Date(ano, m + 1, 0).getDate();
  const celulas = [...Array(mes.getDay()).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const nomeMes = mes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  // Exibe somente os eventos pertencentes ao mês e ano atualmente selecionados.
  const eventosDoMes = EVENTOS
    .filter((evento) => {
      const dataEvento = new Date(`${evento.d}T00:00:00`);
      return dataEvento.getFullYear() === ano && dataEvento.getMonth() === m;
    })
    .sort((a, b) => a.d.localeCompare(b.d));

  return (
    <div className="cal-layout">
      <div className="card">
        <div className="cal-topo">
          <button className="btn sec" onClick={() => setMes(new Date(ano, m - 1, 1))} aria-label="Mês anterior">‹</button>
          <h2 className="cal-mes">{nomeMes}</h2>
          <button className="btn sec" onClick={() => setMes(new Date(ano, m + 1, 1))} aria-label="Próximo mês">›</button>
        </div>

        <div className="cal">
          <div className="cal-cab">Dom</div>
          <div className="cal-cab">Seg</div>
          <div className="cal-cab">Ter</div>
          <div className="cal-cab">Qua</div>
          <div className="cal-cab">Qui</div>
          <div className="cal-cab">Sex</div>
          <div className="cal-cab">Sáb</div>

          {celulas.map((d, i) => {
            if (!d) return <div key={i} />;
            const data = iso(new Date(ano, m, d));
            return (
              <button
                key={i}
                className={`cal-dia ${data === iso(HOJE) ? "hoje" : ""} ${data === sel ? "sel" : ""}`}
                onClick={() => setSel(data)}
                aria-label={`${d}${temCompromisso(data) ? ", com compromisso" : ", sem compromisso"}`}
              >
                <span>{d}</span>
                <Eventos data={data} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="card cal-lista">
        <h2>Eventos de {nomeMes}</h2>
        {eventosDoMes.length > 0 ? (
          eventosDoMes.map((evento) => (
            <ItemLista
              key={`${evento.d}-${evento.t}`}
              t={evento.t}
              k={evento.k}
              d={evento.d}
              desc={evento.desc}
            />
          ))
        ) : (
          <p className="meta">Não há eventos cadastrados para este mês.</p>
        )}
      </div>
    </div>
  );
}

function Horario() {
  const hoje = HOJE.getDay() - 1; // 0 = segunda; -1 ou 5 = fim de semana
  const col = (i) => (i === hoje ? "hoje-col" : "");
  const marca = (i) => (i === hoje ? " (hoje)" : "");

  return (
    <div className="card scroll">
      <table className="grade">
        <thead>
          <tr>
            <th></th>
            <th className={col(0)}>Seg{marca(0)}</th>
            <th className={col(1)}>Ter{marca(1)}</th>
            <th className={col(2)}>Qua{marca(2)}</th>
            <th className={col(3)}>Qui{marca(3)}</th>
            <th className={col(4)}>Sex{marca(4)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>1ª aula<div className="meta">7h30</div></th>
            <td className={col(0)}>Português</td>
            <td className={col(1)}>Matemática</td>
            <td className={col(2)}>Ciências</td>
            <td className={col(3)}>História</td>
            <td className={col(4)}>Geografia</td>
          </tr>
          <tr>
            <th>2ª aula<div className="meta">8h20</div></th>
            <td className={col(0)}>Matemática</td>
            <td className={col(1)}>Português</td>
            <td className={col(2)}>Inglês</td>
            <td className={col(3)}>Ciências</td>
            <td className={col(4)}>Artes</td>
          </tr>
          <tr>
            <th>3ª aula<div className="meta">9h10</div></th>
            <td className={col(0)}>Ciências</td>
            <td className={col(1)}>Geografia</td>
            <td className={col(2)}>Matemática</td>
            <td className={col(3)}>Inglês</td>
            <td className={col(4)}>Português</td>
          </tr>
          <tr>
            <th>4ª aula<div className="meta">10h20</div></th>
            <td className={col(0)}>Ed. Física</td>
            <td className={col(1)}>Artes</td>
            <td className={col(2)}>Português</td>
            <td className={col(3)}>Matemática</td>
            <td className={col(4)}>História</td>
          </tr>
          <tr>
            <th>5ª aula<div className="meta">11h10</div></th>
            <td className={col(0)}>Inglês</td>
            <td className={col(1)}>Ed. Física</td>
            <td className={col(2)}>História</td>
            <td className={col(3)}>Geografia</td>
            <td className={col(4)}>Ciências</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Reunioes() {
  return (
    <>
      <CartaoReuniao t="Reunião de pais" d={REUNIAO_PAIS} />
      <CartaoReuniao t="Conselho de classe" d={CONSELHO_CLASSE} />
    </>
  );
}

function Notificacao({ id, tempo, txt, lidas, ler }) {
  const lida = lidas[id];
  return (
    <li className={lida ? "" : "nova"}>
      <time>{tempo}</time>
      <span>{txt}</span>
      {!lida && <button className="btn sec mini" onClick={() => ler(id)}>Marcar como lida</button>}
    </li>
  );
}

function Notificacoes({ lidas, setLidas, naoLidas }) {
  const ler = (id) => setLidas((l) => ({ ...l, [id]: true }));

  return (
    <>
      <div className="row bar">
        <button
          className="btn sec"
          disabled={!naoLidas}
          onClick={() => setLidas({ n1: true, n2: true, n3: true, n4: true })}
        >
          Marcar todas como lidas
        </button>
      </div>
      <div className="card">
        <ul className="log">
          <Notificacao id="n1" tempo="Hoje" txt="Nova prova publicada: Matemática" lidas={lidas} ler={ler} />
          <Notificacao id="n2" tempo="Ontem" txt="O horário da turma 6º A foi atualizado" lidas={lidas} ler={ler} />
          <Notificacao id="n3" tempo="Há 3 dias" txt="Reunião de pais marcada" lidas={lidas} ler={ler} />
          <Notificacao id="n4" tempo="Há 6 dias" txt="Trabalho de Ciências publicado" lidas={lidas} ler={ler} />
        </ul>
      </div>
    </>
  );
}

/* ---------- cabeçalho de cada tela ---------- */
function Cabecalho({ titulo, ajuda, restrito }) {
  return (
    <header>
      <div>
        <h1>{titulo}</h1>
        <p className="help">{ajuda}</p>
      </div>
      {!restrito && <span className="tag">Turma {TURMA} · Manhã</span>}
    </header>
  );
}

/* ---------- aplicação do aluno ---------- */
export default function AlunoApp({ usuario, onSair }) {
  const restrito = usuario.perfil === "Aluno restrito";
  const [view, setView] = useState(restrito ? "reu" : "home");
  const [lidas, setLidas] = useState({ n1: false, n2: false, n3: true, n4: true });
  const naoLidas = Object.values(lidas).filter((l) => !l).length;

  return (
    <div className="app">
      <aside>
        <div className="brand">Calendário Escolar</div>
        <div className="sub">Painel do aluno</div>
        <nav>
          {!restrito && (
            <>
              <button className={view === "home" ? "on" : ""} onClick={() => setView("home")}>
                <span>Início</span>
              </button>
              <button className={view === "cal" ? "on" : ""} onClick={() => setView("cal")}>
                <span>Calendário</span>
              </button>
              <button className={view === "hor" ? "on" : ""} onClick={() => setView("hor")}>
                <span>Meu horário</span>
              </button>
            </>
          )}
          <button className={view === "reu" ? "on" : ""} onClick={() => setView("reu")}>
            <span>Reuniões</span>
          </button>
          {!restrito && (
            <button className={view === "not" ? "on" : ""} onClick={() => setView("not")}>
              <span>Notificações</span>
              {naoLidas > 0 && <span className="badge">{naoLidas}</span>}
            </button>
          )}
        </nav>
        <div className="usuario">
          <span>{usuario.nome}</span>
          <button onClick={onSair}>Sair</button>
        </div>
      </aside>

      <main>
        {view === "home" && (
          <>
            <Cabecalho
              titulo={`Olá, ${usuario.nome.split(" ")[0]}`}
              ajuda="O que vem por aí hoje e nos próximos dias."
              restrito={restrito}
            />
            <Inicio naoLidas={naoLidas} go={setView} />
          </>
        )}

        {view === "cal" && (
          <>
            <Cabecalho titulo="Calendário" ajuda="Provas, trabalhos, prazos e reuniões do mês." restrito={restrito} />
            <Calendario />
          </>
        )}

        {view === "hor" && (
          <>
            <Cabecalho titulo="Meu horário" ajuda={`Aulas da semana da turma ${TURMA}.`} restrito={restrito} />
            <Horario />
          </>
        )}

        {view === "reu" && (
          <>
            <Cabecalho
              titulo="Reuniões"
              ajuda="Reuniões marcadas pela coordenação. Aqui você só consulta."
              restrito={restrito}
            />
            <Reunioes />
          </>
        )}

        {view === "not" && (
          <>
            <Cabecalho titulo="Notificações" ajuda="Avisos enviados pela escola." restrito={restrito} />
            <Notificacoes lidas={lidas} setLidas={setLidas} naoLidas={naoLidas} />
          </>
        )}
      </main>
    </div>
  );
}