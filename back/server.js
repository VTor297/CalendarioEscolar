const express = require("express");
const { conectarBanco } = require("./conection");

const app = express();

app.use(express.json());

async function iniciarServidor() {
    try {
        await conectarBanco();

        app.listen(3000, () => {
            console.log("Servidor rodando na porta 3000");
        });

    } catch (erro) {
        console.error("Falha ao iniciar aplicação:", erro.message);
        process.exit(1);
    }
}

iniciarServidor();