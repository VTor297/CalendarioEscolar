
const express = require("express");
const { conectarBanco } = require("./conection");
const Users = require("./components/Users");

const app = express();

app.use(express.json());

// =====================================
// ROTAS DE USUÁRIOS
// =====================================

// CADASTRAR USUÁRIO
app.post('/cadastrar', async (req, res) => {
    try {
        const usuario = await Users.criarUsuario(req.body);
        res.status(201).json(usuario);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// LISTAR USUÁRIOS
app.get('/listar', async (req, res) => {
    try {
        const usuarios = await Users.listarUsuarios();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// BUSCAR USUÁRIO POR ID
app.get('/usuario/buscar/:id', async (req, res) => {
    try {
        const usuario = await Users.buscarUsuario(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                erro: 'Usuário não encontrado'
            });
        }

        res.json(usuario);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// EDITAR USUÁRIO
app.put('/users/editar/:id', async (req, res) => {
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
app.delete('/usuario/delete/:id', async (req, res) => {
    try {
        await Users.excluirUsuario(req.params.id);

        res.json({
            mensagem: 'Usuário excluído com sucesso!'
        });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});













// =====================================
// INICIALIZAÇÃO DO SERVIDOR
// =====================================

async function iniciarServidor() {
    try {
        await conectarBanco();

        app.listen(3000, () => {
            console.log("API rodando em http://localhost:3000");
        }).on('error', (erro) => {
            if (erro.code === 'EADDRINUSE') {
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
