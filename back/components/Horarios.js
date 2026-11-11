const { DataTypes } = require("sequelize");
const { sequelize } = require("../conection");

// =====================================
// MODELO DE HORÁRIOS (grade de aulas)
// =====================================
// Cada linha representa uma aula da semana.
// diaSemana: 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex
// ordem: 1ª aula, 2ª aula, ... (para ordenar a grade)

const Horarios = sequelize.define("Horarios", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    turma: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "6º A"
    },

    turno: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "Manhã"
    },

    diaSemana: {
        type: DataTypes.INTEGER, // 1=Seg ... 5=Sex
        allowNull: false,
        validate: { min: 1, max: 5 }
    },

    ordem: {
        type: DataTypes.INTEGER, // 1 = 1ª aula, 2 = 2ª aula...
        allowNull: false
    },

    horario: {
        type: DataTypes.TIME, // ex: "07:30:00"
        allowNull: false
    },

    disciplina: {
        type: DataTypes.STRING(80),
        allowNull: false
    },

    professor: {
        type: DataTypes.STRING(120),
        allowNull: true
    },

    sala: {
        type: DataTypes.STRING(30),
        allowNull: true
    }

}, {
    tableName: "horarios",
    timestamps: false,
    indexes: [
        { fields: ["turma", "diaSemana", "ordem"] }
    ]
});

module.exports = { Horarios };