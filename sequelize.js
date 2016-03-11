'use strict';

const Sequelize = require('sequelize');
const debug = require('debug')('sequelize');

const sequelize = new Sequelize('test', 'test', 'test', {
      dialect: "postgres", // or 'sqlite', 'postgres', 'mariadb'
      port:    5432, // or 5432 (for postgres)
      logging: debug
    });

module.exports = sequelize;
