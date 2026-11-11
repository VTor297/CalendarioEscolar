const { DataTypes } = require("sequelize");
const { sequelize } = require("../conection");

const Trocas = sequelize.define("Trocas", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    // Quem solicitou (professor logado)
    professorSolicitante: {
        type: DataTypes.STRING(120),
        allowNull: false
    },

    // Com quem deseja trocar
    professorDestino: {
        type: DataTypes.STRING(120),
        allowNull: false
    },

    turma: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    disciplina: {
        type: DataTypes.STRING(80),
        allowNull: false
    },

    // Origem (aula atual do solicitante)
    diaOrigem: {
        type: DataTypes.INTEGER, // 0=Seg ... 4=Sex
        allowNull: false,
        validate: { min: 0, max: 4 }
    },
    aulaOrigem: {
        type: DataTypes.INTEGER, // 0=1ª aula ... 4=5ª aula
        allowNull: false,
        validate: { min: 0, max: 4 }
    },

    // Destino (horário desejado)
    diaDestino: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0, max: 4 }
    },
    aulaDestino: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0, max: 4 }
    },

    motivo: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    status: {
        type: DataTypes.ENUM("PENDENTE", "APROVADA", "RECUSADA", "CANCELADA"),
        allowNull: false,
        defaultValue: "PENDENTE"
    },

    // Motivo da recusa (preenchido pela coordenação)
    motivoRecusa: {
        type: DataTypes.TEXT,
        allowNull: true
    }

}, {
    tableName: "trocas",
    timestamps: true
});

module.exports = { Trocas };