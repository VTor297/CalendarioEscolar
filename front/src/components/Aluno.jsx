import { useState, useEffect, useMemo } from "react";
import { listarEventos } from "../services/api";
import "./Aluno.css";

// =====================================
// UTILITÁRIOS
// =====================================

const hoje = new Date();

const iso = (data) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
};

const formatarData = (data) => {
    if (!data) return "";

    const valor = String(data).slice(0, 10);
    const partes = valor.split("-");

    if (partes.length !== 3) return valor;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const restam = (data) => {
    const destino = new Date(`${String(data).slice(0, 10)}T00:00:00`);
    const atual = new Date(`${iso(hoje)}T00:00:00`);

    return Math.round((destino - atual) / 86400000);
};

const quando = (data) => {
    const dias = restam(data);

    if (dias === 0) return "Hoje";
    if (dias === 1) return "Amanhã";
    if (dias > 1) return `Em ${dias} dias`;

    return `Há ${Math.abs(dias)} dias`;
};

const normalizar = (texto) =>
    String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

const tipoEvento = (evento) =>
    evento.subtipo || evento.tipo || "Evento";

const nomeEvento = (evento) =>
    evento.nome || evento.titulo || "Evento escolar";

const descricaoEvento = (evento) =>
    evento.obs || evento.descricao || "Sem descrição cadastrada.";

const dataEvento = (evento) =>
    String(evento.data || "").slice(0, 10);

const classeTipo = (tipo) =>
    normalizar(tipo).replace(/\s+/g, "-");

// =====================================
// COMPONENTES REUTILIZÁVEIS
// =====================================

function Tipo({ tipo }) {
    return (
        <span className={`tag tipo ${classeTipo(tipo)}`}>
            {tipo}
        </span>
    );
}

function Cabecalho({ titulo, ajuda, restrito }) {
    return (
        <header>
            <div>
                <h1>{titulo}</h1>
                <p className="help">{ajuda}</p>
            </div>

            {!restrito && (
                <span className="tag">Turma 6º A · Manhã</span>
            )}
        </header>
    );
}

function Carregando() {
    return (
        <div className="card">
            <p className="meta">Carregando informações...</p>
        </div>
    );
}

function ErroAPI({ mensagem, tentarNovamente }) {
    return (
        <div className="card">
            <h2>Não foi possível carregar os dados</h2>
            <p className="meta">{mensagem}</p>

            <button className="btn" onClick={tentarNovamente}>
                Tentar novamente
            </button>
        </div>
    );
}

function ItemInicio({ evento }) {
    return (
        <div className="item">
            <b>{nomeEvento(evento)}</b>
            <Tipo tipo={tipoEvento(evento)} />

            <div className="meta">
                {formatarData(dataEvento(evento))}
                {" · "}
                {quando(dataEvento(evento))}
            </div>
        </div>
    );
}

function ItemLista({ evento }) {
    return (
        <div
            className="item evento-lista"
            tabIndex={0}
            aria-label={`${nomeEvento(evento)}. ${descricaoEvento(evento)}`}
        >
            <b>{nomeEvento(evento)}</b>

            <Tipo tipo={tipoEvento(evento)} />

            <div className="meta">
                {formatarData(dataEvento(evento))}
                {" · "}
                {quando(dataEvento(evento))}
            </div>

            <p className="desc">
                {descricaoEvento(evento)}
            </p>
        </div>
    );
}

function CartaoReuniao({ evento }) {
    return (
        <div className="card">
            <div className="req">
                <div>
                    <b>{nomeEvento(evento)}</b>

                    <div className="meta">
                        {formatarData(dataEvento(evento))}
                    </div>
                </div>

                <span className="tag">
                    {quando(dataEvento(evento))}
                </span>
            </div>

            <p className="meta">
                {descricaoEvento(evento)}
            </p>
        </div>
    );
}

// =====================================
// HORÁRIO DA TURMA
// Mantido até existir uma rota de horários
// no backend.
// =====================================

const HORARIOS = [
    ["7h30", "Português", "Matemática", "Ciências", "História", "Geografia"],
    ["8h20", "Matemática", "Português", "Inglês", "Ciências", "Artes"],
    ["9h10", "Ciências", "Geografia", "Matemática", "Inglês", "Português"],
    ["10h20", "Ed. Física", "Artes", "Português", "Matemática", "História"],
    ["11h10", "Inglês", "Ed. Física", "História", "Geografia", "Ciências"],
];

function Horario() {
    const hojeSemana = new Date().getDay() - 1;

    return (
        <div className="card scroll">
            <table className="grade">
                <thead>
                    <tr>
                        <th></th>

                        {["Seg", "Ter", "Qua", "Qui", "Sex"].map(
                            (dia, index) => (
                                <th
                                    key={dia}
                                    className={
                                        hojeSemana === index ? "hoje-col" : ""
                                    }
                                >
                                    {dia}
                                    {hojeSemana === index ? " (hoje)" : ""}
                                </th>
                            )
                        )}
                    </tr>
                </thead>

                <tbody>
                    {HORARIOS.map((linha, index) => (
                        <tr key={index}>
                            <th>
                                {index + 1}ª aula
                                <div className="meta">{linha[0]}</div>
                            </th>

                            {linha.slice(1).map((disciplina, coluna) => (
                                <td
                                    key={coluna}
                                    className={
                                        hojeSemana === coluna ? "hoje-col" : ""
                                    }
                                >
                                    {disciplina}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// =====================================
// AULAS DE HOJE
// =====================================

function AulasDeHoje({ dia }) {
    const aulas = HORARIOS;

    if (dia < 1 || dia > 5) {
        return <p className="meta">Sem aulas hoje. Bom descanso!</p>;
    }

    return (
        <ul className="lista">
            {aulas.map((linha, index) => (
                <li key={index}>
                    <time>{linha[0]}</time>
                    <span>{linha[dia]}</span>
                </li>
            ))}
        </ul>
    );
}

// =====================================
// INÍCIO
// =====================================

function Inicio({ eventos, naoLidas, go }) {
    const dia = hoje.getDay();

    const proximos = eventos
        .filter((evento) => restam(dataEvento(evento)) >= 0)
        .sort((a, b) =>
            dataEvento(a).localeCompare(dataEvento(b))
        )
        .slice(0, 3);

    return (
        <div className="grid">
            <div className="card">
                <h2>Aulas de hoje</h2>

                <AulasDeHoje dia={dia} />

                <button
                    className="btn sec"
                    onClick={() => go("hor")}
                >
                    Ver horário da semana
                </button>
            </div>

            <div className="card">
                <h2>Próximos compromissos</h2>

                {proximos.length > 0 ? (
                    proximos.map((evento) => (
                        <ItemInicio
                            key={evento.id}
                            evento={evento}
                        />
                    ))
                ) : (
                    <p className="meta">
                        Nenhum compromisso futuro cadastrado.
                    </p>
                )}

                <button
                    className="btn sec"
                    onClick={() => go("cal")}
                >
                    Ver calendário
                </button>
            </div>

            <div className="card">
                <div className="meta">Notificações novas</div>

                <div className="stat">{naoLidas}</div>

                <p className="meta">
                    {naoLidas
                        ? "Você possui avisos não lidos."
                        : "Você está em dia."}
                </p>

                <button
                    className="btn"
                    onClick={() => go("not")}
                >
                    Abrir notificações
                </button>
            </div>
        </div>
    );
}

// =====================================
// CALENDÁRIO
// =====================================

function Calendario({ eventos }) {
    const [mes, setMes] = useState(
        new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    );

    const [selecionado, setSelecionado] = useState(iso(hoje));

    const ano = mes.getFullYear();
    const numeroMes = mes.getMonth();

    const totalDias = new Date(
        ano,
        numeroMes + 1,
        0
    ).getDate();

    const celulas = [
        ...Array(mes.getDay()).fill(null),
        ...Array.from({ length: totalDias }, (_, i) => i + 1),
    ];

    const nomeMes = mes.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });

    const eventosDoMes = eventos.filter((evento) => {
        const data = dataEvento(evento);
        const partes = data.split("-");

        return (
            Number(partes[0]) === ano &&
            Number(partes[1]) === numeroMes + 1
        );
    });

    const eventosSelecionados = eventos.filter(
        (evento) => dataEvento(evento) === selecionado
    );

    return (
        <div className="cal-layout">
            <div className="card">
                <div className="cal-topo">
                    <button
                        className="btn sec"
                        onClick={() =>
                            setMes(new Date(ano, numeroMes - 1, 1))
                        }
                    >
                        ‹
                    </button>

                    <h2 className="cal-mes">{nomeMes}</h2>

                    <button
                        className="btn sec"
                        onClick={() =>
                            setMes(new Date(ano, numeroMes + 1, 1))
                        }
                    >
                        ›
                    </button>
                </div>

                <div className="cal">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                        (dia) => (
                            <div className="cal-cab" key={dia}>
                                {dia}
                            </div>
                        )
                    )}

                    {celulas.map((dia, index) => {
                        if (!dia) {
                            return <div key={index} />;
                        }

                        const data = iso(
                            new Date(ano, numeroMes, dia)
                        );

                        const possuiEvento = eventos.some(
                            (evento) => dataEvento(evento) === data
                        );

                        return (
                            <button
                                key={index}
                                className={`cal-dia ${
                                    data === iso(hoje) ? "hoje" : ""
                                } ${
                                    data === selecionado ? "sel" : ""
                                }`}
                                onClick={() => setSelecionado(data)}
                                aria-label={`${dia}${
                                    possuiEvento
                                        ? ", com compromisso"
                                        : ", sem compromisso"
                                }`}
                            >
                                <span>{dia}</span>

                                {possuiEvento && (
                                    <span className="chips">
                                        <span className="chip prova">
                                            •
                                        </span>
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="card cal-lista">
                <h2>Eventos de {nomeMes}</h2>

                {eventosDoMes.length ? (
                    eventosDoMes.map((evento) => (
                        <ItemLista
                            key={evento.id}
                            evento={evento}
                        />
                    ))
                ) : (
                    <p className="meta">
                        Não há eventos cadastrados neste mês.
                    </p>
                )}

                <div className="divider"></div>

                <h2>Dia selecionado: {formatarData(selecionado)}</h2>

                {eventosSelecionados.length ? (
                    eventosSelecionados.map((evento) => (
                        <ItemLista
                            key={evento.id}
                            evento={evento}
                        />
                    ))
                ) : (
                    <p className="meta">
                        Nenhum evento nesta data.
                    </p>
                )}
            </div>
        </div>
    );
}

// =====================================
// REUNIÕES
// =====================================

function Reunioes({ eventos }) {
    const reunioes = eventos
        .filter((evento) => {
            const tipo = normalizar(tipoEvento(evento));

            return (
                tipo.includes("reuniao") ||
                tipo.includes("conselho")
            );
        })
        .sort((a, b) =>
            dataEvento(a).localeCompare(dataEvento(b))
        );

    return (
        <>
            {reunioes.length ? (
                reunioes.map((evento) => (
                    <CartaoReuniao
                        key={evento.id}
                        evento={evento}
                    />
                ))
            ) : (
                <div className="card">
                    <p className="meta">
                        Nenhuma reunião cadastrada.
                    </p>
                </div>
            )}
        </>
    );
}

// =====================================
// NOTIFICAÇÕES
// Mantidas localmente até existir
// uma rota específica no backend.
// =====================================

function Notificacoes() {
    return (
        <div className="card">
            <p className="meta">
                O sistema ainda não possui uma rota de notificações.
                Os avisos reais serão exibidos aqui após a criação
                dessa funcionalidade no backend.
            </p>
        </div>
    );
}

// =====================================
// APLICAÇÃO DO ALUNO
// =====================================

export default function AlunoApp({ usuario, onSair }) {
    const restrito = usuario?.perfil === "Aluno restrito";

    const [view, setView] = useState(
        restrito ? "reu" : "home"
    );

    const [eventos, setEventos] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    // =================================
    // BUSCAR EVENTOS NA API
    // =================================

    async function carregarEventos() {
        try {
            setCarregando(true);
            setErro("");

            const dados = await listarEventos();

            if (!Array.isArray(dados)) {
                throw new Error(
                    "A API retornou um formato de eventos inválido."
                );
            }

            setEventos(dados);

        } catch (error) {
            setErro(error.message);

        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarEventos();
    }, []);

    // =================================
    // CONTAGEM DE EVENTOS
    // =================================

    const eventosOrdenados = useMemo(() => {
        return [...eventos].sort((a, b) =>
            dataEvento(a).localeCompare(dataEvento(b))
        );
    }, [eventos]);

    return (
        <div className="app">
            <aside>
                <div className="brand">
                    Calendário Escolar
                </div>

                <div className="sub">
                    Painel do aluno
                </div>

                <nav>
                    {!restrito && (
                        <>
                            <button
                                className={view === "home" ? "on" : ""}
                                onClick={() => setView("home")}
                            >
                                <span>Início</span>
                            </button>

                            <button
                                className={view === "cal" ? "on" : ""}
                                onClick={() => setView("cal")}
                            >
                                <span>Calendário</span>
                            </button>

                            <button
                                className={view === "hor" ? "on" : ""}
                                onClick={() => setView("hor")}
                            >
                                <span>Meu horário</span>
                            </button>
                        </>
                    )}

                    <button
                        className={view === "reu" ? "on" : ""}
                        onClick={() => setView("reu")}
                    >
                        <span>Reuniões</span>
                    </button>

                    {!restrito && (
                        <button
                            className={view === "not" ? "on" : ""}
                            onClick={() => setView("not")}
                        >
                            <span>Notificações</span>
                        </button>
                    )}
                </nav>

                <div className="usuario">
                    <span>{usuario?.nome || "Aluno"}</span>

                    <button onClick={onSair}>
                        Sair
                    </button>
                </div>
            </aside>

            <main>
                {view === "home" && (
                    <>
                        <Cabecalho
                            titulo={`Olá, ${
                                usuario?.nome?.split(" ")[0] || "Aluno"
                            }`}
                            ajuda="O que vem por aí hoje e nos próximos dias."
                            restrito={restrito}
                        />

                        {carregando ? (
                            <Carregando />
                        ) : erro ? (
                            <ErroAPI
                                mensagem={erro}
                                tentarNovamente={carregarEventos}
                            />
                        ) : (
                            <Inicio
                                eventos={eventosOrdenados}
                                naoLidas={0}
                                go={setView}
                            />
                        )}
                    </>
                )}

                {view === "cal" && (
                    <>
                        <Cabecalho
                            titulo="Calendário"
                            ajuda="Provas, trabalhos, prazos e reuniões do mês."
                            restrito={restrito}
                        />

                        {carregando ? (
                            <Carregando />
                        ) : erro ? (
                            <ErroAPI
                                mensagem={erro}
                                tentarNovamente={carregarEventos}
                            />
                        ) : (
                            <Calendario eventos={eventosOrdenados} />
                        )}
                    </>
                )}

                {view === "hor" && (
                    <>
                        <Cabecalho
                            titulo="Meu horário"
                            ajuda="Aulas da semana da turma 6º A."
                            restrito={restrito}
                        />

                        <Horario />
                    </>
                )}

                {view === "reu" && (
                    <>
                        <Cabecalho
                            titulo="Reuniões"
                            ajuda="Reuniões marcadas pela coordenação."
                            restrito={restrito}
                        />

                        {carregando ? (
                            <Carregando />
                        ) : erro ? (
                            <ErroAPI
                                mensagem={erro}
                                tentarNovamente={carregarEventos}
                            />
                        ) : (
                            <Reunioes eventos={eventosOrdenados} />
                        )}
                    </>
                )}

                {view === "not" && (
                    <>
                        <Cabecalho
                            titulo="Notificações"
                            ajuda="Avisos enviados pela escola."
                            restrito={restrito}
                        />

                        <Notificacoes />
                    </>
                )}
            </main>
        </div>
    );
}