const express = require("express");
const cors = require("cors");
const { conectarBanco, sequelize } = require("./conection");

const Users = require("./components/Users");
const { Requests } = require("./components/Requests");
const { Eventos } = require("./components/Eventos");
const { Horarios } = require("./components/Horarios");
const { Trocas } = require("./components/Trocas");

const app = express();

// =====================================
// MIDDLEWARES GLOBAIS
// =====================================

app.use(cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin"]
}));

app.use(express.json());

// =====================================
// MIDDLEWARE ADMINISTRATIVO
// =====================================
// Sem autenticação implementada. Liberado em dev.
// Para produção, descomente a validação por header x-admin.

function requireAdmin(req, res, next) {
    // OPÇÃO DEV — libera tudo:
    return next();

    // OPÇÃO SEGURA:
    // const isAdmin = req.headers["x-admin"] === "true";
    // if (!isAdmin) {
    //     return res.status(403).json({
    //         erro: "Acesso permitido somente ao administrador."
    //     });
    // }
    // return next();
}

// =====================================
// ROTAS DE USUÁRIOS
// =====================================

// CADASTRAR USUÁRIO
app.post("/cadastrar", async (req, res) => {
    try {
        const usuario = await Users.criarUsuario(req.body);
        res.status(201).json(usuario);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// LISTAR USUÁRIOS
app.get("/listar", async (req, res) => {
    try {
        const usuarios = await Users.listarUsuarios();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// BUSCAR USUÁRIO
app.get("/usuario/buscar/:id", async (req, res) => {
    try {
        const usuario = await Users.buscarUsuario(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                erro: "Usuário não encontrado"
            });
        }

        res.json(usuario);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// EDITAR USUÁRIO
app.put("/users/editar/:id", async (req, res) => {
    try {
        const usuario = await Users.editarUsuario(
            req.params.id,
            req.body
        );
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// EXCLUIR USUÁRIO
app.delete("/usuario/delete/:id", async (req, res) => {
    try {
        await Users.excluirUsuario(req.params.id);
        res.json({ mensagem: "Usuário excluído com sucesso!" });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// =====================================
// ROTAS DE SOLICITAÇÕES
// =====================================

// CADASTRAR SOLICITAÇÃO
app.post("/requests", async (req, res) => {
    try {
        const { nome, tipo, subtipo, data, horario, obs } = req.body;

        if (!nome || !tipo || !subtipo || !data) {
            return res.status(400).json({
                erro: "Preencha os campos obrigatórios."
            });
        }

        const solicitacao = await Requests.create({
            nome,
            tipo,
            subtipo,
            data,
            horario: horario || null,
            obs: obs || null,
            status: "PENDENTE"
        });

        res.status(201).json({
            mensagem: "Solicitação enviada para aprovação!",
            solicitacao
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao cadastrar solicitação."
        });
    }
});

// LISTAR SOLICITAÇÕES PENDENTES
app.get("/admin/requests", requireAdmin, async (req, res) => {
    try {
        const solicitacoes = await Requests.findAll({
            where: { status: "PENDENTE" },
            order: [["id", "DESC"]]
        });
        res.json(solicitacoes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao listar solicitações."
        });
    }
});

// =====================================
// APROVAR SOLICITAÇÃO
// =====================================

app.put("/admin/requests/:id/aprovar", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "ID inválido." });
    }

    try {
        const evento = await sequelize.transaction(async (transaction) => {
            const solicitacao = await Requests.findByPk(id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!solicitacao) {
                const erro = new Error("Solicitação não encontrada.");
                erro.status = 404;
                throw erro;
            }

            if (solicitacao.status !== "PENDENTE") {
                const erro = new Error("Solicitação já analisada.");
                erro.status = 409;
                throw erro;
            }

            const novoEvento = await Eventos.create({
                nome: solicitacao.nome,
                tipo: solicitacao.tipo,
                subtipo: solicitacao.subtipo,
                data: solicitacao.data,
                horario: solicitacao.horario,
                obs: solicitacao.obs
            }, { transaction });

            await solicitacao.update(
                { status: "APROVADA" },
                { transaction }
            );

            return novoEvento;
        });

        res.json({
            mensagem: "Solicitação aprovada e evento criado!",
            evento
        });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({
            erro: error.message || "Erro ao aprovar solicitação."
        });
    }
});

// =====================================
// RECUSAR SOLICITAÇÃO
// =====================================

app.put("/admin/requests/:id/recusar", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "ID inválido." });
    }

    try {
        await sequelize.transaction(async (transaction) => {
            const solicitacao = await Requests.findByPk(id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!solicitacao) {
                const erro = new Error("Solicitação não encontrada.");
                erro.status = 404;
                throw erro;
            }

            if (solicitacao.status !== "PENDENTE") {
                const erro = new Error("Solicitação já analisada.");
                erro.status = 409;
                throw erro;
            }

            await solicitacao.update(
                { status: "RECUSADA" },
                { transaction }
            );
        });

        res.json({
            mensagem: "Solicitação recusada com sucesso!"
        });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({
            erro: error.message || "Erro ao recusar solicitação."
        });
    }
});

// =====================================
// LISTAR EVENTOS (normalizado para o front)
// =====================================

app.get("/eventos", async (req, res) => {
    try {
        const eventos = await Eventos.findAll({
            order: [["data", "ASC"]]
        });

        const normalizados = eventos.map((e) => {
            const plain = e.get({ plain: true });
            return {
                id: plain.id,
                nome: plain.nome || plain.titulo || "Evento escolar",
                tipo: plain.tipo || "Evento",
                subtipo: plain.subtipo || null,
                data: plain.data,
                horario: plain.horario || null,
                obs: plain.obs || plain.descricao || "Sem descrição cadastrada."
            };
        });

        res.json(normalizados);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao listar eventos."
        });
    }
});

// =====================================
// ROTAS DE HORÁRIOS (grade de aulas)
// =====================================

// GET /horarios?turma=6º A&turno=Manhã
// Retorna a grade completa da semana, ordenada por dia e ordem.
app.get("/horarios", async (req, res) => {
    try {
        const where = {};

        if (req.query.turma) where.turma = req.query.turma;
        if (req.query.turno) where.turno = req.query.turno;

        const grade = await Horarios.findAll({
            where,
            order: [["diaSemana", "ASC"], ["ordem", "ASC"]]
        });

        res.json(grade);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao listar horários."
        });
    }
});

// GET /horarios/hoje
// Atalho: retorna apenas as aulas do dia atual (Seg-Sex).
app.get("/horarios/hoje", async (req, res) => {
    try {
        const diaSemana = new Date().getDay(); // 0=Dom, 1=Seg...

        if (diaSemana < 1 || diaSemana > 5) {
            return res.json([]);
        }

        const where = { diaSemana };
        if (req.query.turma) where.turma = req.query.turma;
        if (req.query.turno) where.turno = req.query.turno;

        const aulas = await Horarios.findAll({
            where,
            order: [["ordem", "ASC"]]
        });

        res.json(aulas);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao listar aulas de hoje."
        });
    }
});

// GET /horarios/:id
app.get("/horarios/:id", async (req, res) => {
    try {
        const aula = await Horarios.findByPk(req.params.id);

        if (!aula) {
            return res.status(404).json({
                erro: "Aula não encontrada."
            });
        }

        res.json(aula);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao buscar aula."
        });
    }
});

// POST /admin/horarios  (admin cadastra uma aula)
app.post("/admin/horarios", requireAdmin, async (req, res) => {
    try {
        const {
            turma,
            turno,
            diaSemana,
            ordem,
            horario,
            disciplina,
            professor,
            sala
        } = req.body;

        if (!diaSemana || !ordem || !horario || !disciplina) {
            return res.status(400).json({
                erro: "Informe diaSemana, ordem, horario e disciplina."
            });
        }

        if (diaSemana < 1 || diaSemana > 5) {
            return res.status(400).json({
                erro: "diaSemana deve ser entre 1 (Seg) e 5 (Sex)."
            });
        }

        const novaAula = await Horarios.create({
            turma: turma || "6º A",
            turno: turno || "Manhã",
            diaSemana,
            ordem,
            horario,
            disciplina,
            professor: professor || null,
            sala: sala || null
        });

        res.status(201).json(novaAula);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao cadastrar aula."
        });
    }
});

// PUT /admin/horarios/:id  (admin edita uma aula)
app.put("/admin/horarios/:id", requireAdmin, async (req, res) => {
    try {
        const aula = await Horarios.findByPk(req.params.id);

        if (!aula) {
            return res.status(404).json({
                erro: "Aula não encontrada."
            });
        }

        await aula.update(req.body);
        res.json(aula);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao editar aula."
        });
    }
});

// DELETE /admin/horarios/:id  (admin remove uma aula)
app.delete("/admin/horarios/:id", requireAdmin, async (req, res) => {
    try {
        const aula = await Horarios.findByPk(req.params.id);

        if (!aula) {
            return res.status(404).json({
                erro: "Aula não encontrada."
            });
        }

        await aula.destroy();
        res.json({ mensagem: "Aula removida com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao remover aula."
        });
    }
});


// =====================================
// ROTAS DE TROCAS DE AULA
// =====================================

// POST /trocas  — professor solicita troca
app.post("/trocas", async (req, res) => {
    try {
        const {
            professorSolicitante,
            professorDestino,
            turma,
            disciplina,
            diaOrigem,
            aulaOrigem,
            diaDestino,
            aulaDestino,
            motivo
        } = req.body;

        if (
            !professorSolicitante ||
            !professorDestino ||
            !turma ||
            !disciplina ||
            diaOrigem === undefined ||
            aulaOrigem === undefined ||
            diaDestino === undefined ||
            aulaDestino === undefined
        ) {
            return res.status(400).json({
                erro: "Preencha todos os campos obrigatórios da troca."
            });
        }

        if (diaOrigem === diaDestino && aulaOrigem === aulaDestino) {
            return res.status(400).json({
                erro: "Origem e destino não podem ser iguais."
            });
        }

        const troca = await Trocas.create({
            professorSolicitante,
            professorDestino,
            turma,
            disciplina,
            diaOrigem,
            aulaOrigem,
            diaDestino,
            aulaDestino,
            motivo: motivo || null,
            status: "PENDENTE"
        });

        res.status(201).json({
            mensagem: "Solicitação de troca enviada!",
            troca
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao criar solicitação de troca." });
    }
});

// GET /trocas?professor=Carlos%20Mendes  — lista trocas de um professor
app.get("/trocas", async (req, res) => {
    try {
        const where = {};

        if (req.query.professor) {
            where.professorSolicitante = req.query.professor;
        }

        const trocas = await Trocas.findAll({
            where,
            order: [["createdAt", "DESC"]]
        });

        res.json(trocas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao listar trocas." });
    }
});

// GET /admin/trocas  — coordenação lista pendentes
app.get("/admin/trocas", requireAdmin, async (req, res) => {
    try {
        const where = { status: "PENDENTE" };

        const trocas = await Trocas.findAll({
            where,
            order: [["createdAt", "DESC"]]
        });

        res.json(trocas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao listar trocas pendentes." });
    }
});

// PUT /admin/trocas/:id/aprovar
app.put("/admin/trocas/:id/aprovar", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "ID inválido." });
    }

    try {
        const troca = await Trocas.findByPk(id);

        if (!troca) {
            return res.status(404).json({ erro: "Troca não encontrada." });
        }

        if (troca.status !== "PENDENTE") {
            return res.status(409).json({ erro: "Troca já analisada." });
        }

        await troca.update({ status: "APROVADA" });

        res.json({
            mensagem: "Troca aprovada!",
            troca
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao aprovar troca." });
    }
});

// PUT /admin/trocas/:id/recusar
app.put("/admin/trocas/:id/recusar", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "ID inválido." });
    }

    try {
        const troca = await Trocas.findByPk(id);

        if (!troca) {
            return res.status(404).json({ erro: "Troca não encontrada." });
        }

        if (troca.status !== "PENDENTE") {
            return res.status(409).json({ erro: "Troca já analisada." });
        }

        const motivoRecusa = (req.body?.motivoRecusa || "").trim() || null;

        await troca.update({
            status: "RECUSADA",
            motivoRecusa
        });

        res.json({
            mensagem: "Troca recusada.",
            troca
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao recusar troca." });
    }
});

// DELETE /trocas/:id  — professor cancela a própria solicitação pendente
app.delete("/trocas/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "ID inválido." });
    }

    try {
        const troca = await Trocas.findByPk(id);

        if (!troca) {
            return res.status(404).json({ erro: "Troca não encontrada." });
        }

        if (troca.status !== "PENDENTE") {
            return res.status(409).json({
                erro: "Só é possível cancelar trocas pendentes."
            });
        }

        await troca.update({ status: "CANCELADA" });

        res.json({ mensagem: "Solicitação cancelada." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao cancelar troca." });
    }
});







// =====================================
// INICIALIZAÇÃO DO SERVIDOR
// =====================================

async function iniciarServidor() {
    try {
        await conectarBanco();
        console.log("Banco de dados conectado!");

        // Cria a tabela de horários se não existir
        await Horarios.sync();
        console.log("Tabela 'horarios' pronta.");

        const servidor = app.listen(3000, () => {
            console.log("================================");
            console.log("API rodando em http://localhost:3000");
            console.log("================================");
        });

        servidor.on("error", (erro) => {
            if (erro.code === "EADDRINUSE") {
                console.log("Já existe uma API rodando na porta 3000.");
                return;
            }
            console.error("Erro no servidor:", erro);
        });
    } catch (erro) {
        console.error("Falha ao iniciar aplicação:", erro.message);
        process.exit(1);
    }
}

iniciarServidor();