const { Sequelize } = require("sequelize");
const { spawn } = require("child_process");
const path = require("path");
const net = require("net");
const dotenv = require("dotenv");

// Caminho da raiz do projeto
const raiz = path.resolve(__dirname, "..");

// Carregar .env da raiz
const resultado = dotenv.config({
    path: path.join(raiz, ".env")
});

if (resultado.error) {
    throw new Error("Não foi possível carregar o arquivo .env");
}

// Verificar variáveis obrigatórias
const obrigatorias = [
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD"
];

for (const variavel of obrigatorias) {
    if (process.env[variavel] === undefined) {
        throw new Error(`Variável ${variavel} não encontrada no .env`);
    }
}

// Caminhos do MariaDB
const mariaDB = path.resolve(
    raiz,
    process.env.MARIADB_PATH
);

const dados = path.resolve(
    raiz,
    process.env.DB_PATH
);

const executavel = path.join(
    mariaDB,
    "bin",
    "mariadbd.exe"
);



// ==================================
// SEQUELIZE
// ==================================

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: "mysql",
        logging: false
    }
);

// ==================================
// AGUARDAR MARIA DB
// ==================================

function aguardarBanco() {
    return new Promise((resolve, reject) => {
        const inicio = Date.now();

        function verificar() {
            const socket = net.createConnection({
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT)
            });

            socket.once("connect", () => {
                socket.destroy();
                resolve();
            });

            socket.once("error", () => {
                socket.destroy();

                if (processoBanco?.exitCode !== null &&
                    processoBanco?.exitCode !== undefined) {
                    return reject(new Error("MariaDB encerrou inesperadamente."));
                }

                if (Date.now() - inicio > 30000) {
                    return reject(new Error("Tempo limite ao iniciar MariaDB."));
                }

                setTimeout(verificar, 1000);
            });
        }

        verificar();
    });
}

// ==================================
// INICIAR E CONECTAR
// ==================================

async function conectarBanco() {
    try {
        console.log("Iniciando MariaDB...");

        processoBanco = spawn(executavel, [
            `--basedir=${mariaDB}`,
            `--datadir=${dados}`,
            `--port=${process.env.DB_PORT}`
        ], {
            windowsHide: true,
            stdio: "ignore"
        });

        processoBanco.on("error", erro => {
            console.error("Erro ao iniciar MariaDB:", erro);
        });

        await aguardarBanco();

        console.log("MariaDB iniciado!");

        await sequelize.authenticate();

        console.log("Sequelize conectado com sucesso!");

        return sequelize;

    } catch (erro) {
        console.error("Erro na conexão:", erro);

        if (processoBanco && !processoBanco.killed) {
            processoBanco.kill();
        }

        throw erro;
    }
}





module.exports = {
    sequelize,
    conectarBanco
};