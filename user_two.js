'use strict';

const sequelize = require('./sequelize');

const User = sequelize.define('User', {});

module.exports = User;
