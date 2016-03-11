'use strict';

const Sequelize = require('sequelize');
const sequelize = require('./sequelize');
const UserTwo = require('./user_two');

const Lease = sequelize.define('Lease', {
  payload: Sequelize.STRING,
});

Lease.belongsTo(UserTwo);

module.exports = Lease;
