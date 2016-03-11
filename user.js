'use strict';

const Sequelize = require('sequelize');

const sequelize = require('./sequelize');

const User = sequelize.define('User', {
  username: Sequelize.STRING,
  birthday: Sequelize.DATE
});

module.exports = User;
