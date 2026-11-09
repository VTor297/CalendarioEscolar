
const { DataTypes } = require('sequelize');
const { sequelize } = require('../conection');

// =====================================
// MODEL DA TABELA USERS
// =====================================

const Users = sequelize.define('Users', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    nome: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },

    senha: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    tipo: {
        type: DataTypes.ENUM(
            'coordenacao',
            'professor',
            'aluno'
        ),
        allowNull: false,
        defaultValue: 'aluno'
    },

    ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }

}, {
    tableName: 'users',
    timestamps: true
});

// =====================================
// CONEXÃO E SINCRONIZAÇÃO
// =====================================

async function conectarUsers() {
    await sequelize.authenticate();
    await Users.sync();

    console.log('Tabela users conectada com sucesso!');
}

// =====================================
// OPERAÇÕES NA TABELA
// =====================================

// Cadastrar usuário
async function criarUsuario(dados) {
    return await Users.create(dados);
}

// Buscar todos os usuários
async function listarUsuarios() {
    return await Users.findAll();
}

// Buscar usuário pelo ID
async function buscarUsuario(id) {
    return await Users.findByPk(id);
}

// Editar usuário
async function editarUsuario(id, dados) {
    const usuario = await Users.findByPk(id);

    if (!usuario) {
        throw new Error('Usuário não encontrado!');
    }

    return await usuario.update(dados);
}

// Excluir usuário
async function excluirUsuario(id) {
    const usuario = await Users.findByPk(id);

    if (!usuario) {
        throw new Error('Usuário não encontrado!');
    }

    return await usuario.destroy();
}

// =====================================
// EXPORTAÇÕES
// =====================================

module.exports = {
    Users,
    conectarUsers,
    criarUsuario,
    listarUsuarios,
    buscarUsuario,
    editarUsuario,
    excluirUsuario
};
