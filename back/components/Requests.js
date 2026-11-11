
const { DataTypes } = require("sequelize");
const { sequelize } = require("../conection");

const Requests = sequelize.define("Requests", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    subtipo: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    data: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    horario: {
        type: DataTypes.TIME,
        allowNull: true
    },
    obs: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM(
            "PENDENTE",
            "APROVADA",
            "RECUSADA"
        ),
        allowNull: false,
        defaultValue: "PENDENTE"
    }
}, {
    tableName: "requests",
    timestamps: false
});

module.exports = { Requests };
