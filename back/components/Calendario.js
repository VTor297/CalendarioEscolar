
// models/Evento.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../conection');
const { FORCE } = require('sequelize/lib/index-hints');

const Evento = sequelize.define('Evento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },

  subtipo: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },

  data: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  horario: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  obs: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'eventos',
  timestamps: false,
});

async function conectarEventos() {
    await Evento.sync({force: true});
    console.log('Tabela calendario conectada com sucesso!');
}


 conectarEventos();

module.exports = Evento;