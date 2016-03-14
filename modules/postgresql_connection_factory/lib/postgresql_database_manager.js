'use strict';

const pg = require('pg');
const Promise = require('bluebird');

/**
 * The manager for performing direct operations on the database.
 *
 * @class PostgreSqlDatabaseManager
 */
class PostgreSqlDatabaseManager {

  /**
   * Creates an instance of the PostgreSQL database manager.
   *
   * @method constructor
   * @param  {Object}  config        The configuration for the database manager.
   */
  constructor(config) {
    this._config = config;
  }

  /**
   * Gets the config for the database manager.
   *
   * @property config
   * @type {Object}
   */
  get config() {
    return this._config;
  }

  /**
   * Gets the pg client the database manager uses to communicate with the database server.
   *
   * @property client
   * @type {Object}
   */
  get client() {
    return this._client;
  }

  /**
   * Connects the client to the database server.
   *
   * @method connectToServer
   * @param  {String}  client   The client used to connect to the database server.
   */
  connectToServer(client) {
    return new Promise((resolve, reject) => {
      client.connect((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Connects to the database server and creates the configured database if it
   * doesn't exist.
   *
   * @method recreateDatabase
   */
  recreateDatabase() {
    const pgConfig = {
      user: this.config.username,
      password: this.config.password,
      host: this.config.host,
      port: this.config.port,
      database: 'postgres'
    };
    this._client = new pg.Client(pgConfig);

    return this.connectToServer(this.client)
      .then(() => {
        return this.hasDatabase()
          .then((databaseExists) => {
            if (databaseExists) {
              console.log(`database '${this.config.database}' already exists`);
              this.client.end();
              return;
            } else {
              return this.createDatabase()
                .then(() => {
                  this.client.end();
                });
            }
          });
      });
  }

  /**
   * Connects to the database server and checks if the configured database already exists.
   *
   * @method hasDatabase
   * @return {Boolean}       True if the database already exists.
   */
  hasDatabase() {
    const query = `SELECT 1 FROM pg_database WHERE datname='${this.config.database}'`;
    return this.sendQuery(query)
      .then((result) => {
        if (result.rowCount) {
          return true;
        } else {
          return false;
        }
      });
  }

  /**
   * Creates the configured database.
   *
   * @method createDatabase
   */
  createDatabase() {
    const query = `CREATE DATABASE ${this.config.database}`;
    return this.sendQuery(query);
  }

  /**
   * Sends a query to the database server.
   *
   * @method sendQuery
   */
  sendQuery(query) {
    return new Promise((resolve, reject) => {
      this.client.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

PostgreSqlDatabaseManager.configurationSchema = {
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

module.exports = PostgreSqlDatabaseManager;
