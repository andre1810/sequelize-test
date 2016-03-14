'use strict';

const connections = Object(Symbol('connections'));

const crypto = require('crypto');
const debug = require('debug')('huf:postgres');
const Sequelize = require('sequelize');

/**
 * The factory for creating PostgreSQL connections via Sequelize.
 *
 * @class PostgreSqlConnectionFactory
 */
class PostgreSqlConnectionFactory {

  /**
   * Creates an instance of the PostgreSQL connection factory.
   *
   * @method constructor
   * @param  {Object}  config        The configuration for the connection factory.
   */
  constructor(config) {
    this._config = config;
  }

  /**
   * Gets the config for the connection factory.
   *
   * @property config
   * @type {Object}
   */
  get config() {
    return this._config;
  }

  /**
   * Generates a hash from config settings marking a unique connection.
   *
   * @method getHash
   * @return {String} The generated hash.
   */
  getHash() {
    const hash = crypto.createHash('sha256');
    const properties = [this.config.database, this.config.username, this.config.password];
    return hash
      .update(properties.join(''))
      .digest('hex');
  }

  /**
   * Returns a sequelize connection for the current configuration.
   *
   * @method getConnection
   * @return {Object}       The connection for the current configuration.
   */
  getConnection() {
    const hash = this.getHash();
    if (typeof connections[hash] !== 'undefined') {
      return connections[hash];
    }
    const connection = new Sequelize(
      this.config.database,
      this.config.username,
      this.config.password, {
        host: this.config.host,
        port: this.config.port,
        dialect: 'postgres',
        logging: false
      });
    debug(`postgre connection to database '${this.config.database}' established.`);
    connections[hash] = connection;
    return connection;
  }
}

PostgreSqlConnectionFactory.configurationSchema = {
  type: 'object',
  properties: {
    host: {
      id: 'host',
      type: 'string'
    },
    port: {
      id: 'port',
      type: 'string'
    },
    database: {
      id: 'database',
      type: 'string'
    },
    username: {
      id: 'username',
      type: 'string'
    },
    password: {
      id: 'password',
      type: 'string'
    },
  },
  required: ['host', 'port', 'database', 'username', 'password']
};

module.exports = PostgreSqlConnectionFactory;
