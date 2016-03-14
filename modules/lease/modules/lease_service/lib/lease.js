'use strict';

const debug = require('debug')('huf:lease');
const UUID = require('node-uuid');
const Sequelize = require('sequelize');

const PostgreSqlConnectionFactory = require('postgresql_connection_factory');

/**
 * The model that represents the lease in the database.
 *
 * @class Lease
 */
class Lease {

  /**
   * Creates an instance of the lease model.
   *
   * @method constructor
   * @param  {Object}  config  The config for model.
   */
  constructor(config) {
    this._config = config;
  }

  /**
   * Gets the config used by the model.
   *
   * @property config
   * @type {Object}
   */
  get config() {
    return this._config;
  }

  /**
   * Gets the connection used by the model.
   *
   * @property connection
   * @type {Object}
   */
  get connection() {
    return this._connection;
  }

  /**
   * Gets the connection factory used by model.
   *
   * @property connectionFactory
   * @type {Object}
   */
  get connectionFactory() {
    return this._connectionFactory;
  }

  /**
   * Gets the sequelize model used by the model.
   *
   * @property lease
   * @type {Object}
   */
  get lease() {
    return this._lease;
  }

  /**
   * Sets the sequelize model used by the model.
   *
   * @property lease
   * @param {Object}  value   The new value for the property.
   */
  set lease(value) {
    this._lease = value;
  }

  /**
   * Initializes the model in the database.
   *
   * @method initialize
   */
  initialize() {
    this._connectionFactory = new PostgreSqlConnectionFactory(this.config.database);
    this._connection = this.connectionFactory.getConnection();

    const leaseModel = this.connection.define('leases', {
      leaseId: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: function() {
          return UUID.v4();
        },
        field: 'lease_id'
      },
      mobileNumber: {
        type: Sequelize.TEXT,
        field: 'mobile_number'
      },
      email: {
        type: Sequelize.TEXT,
        field: 'email'
      },
      externalId: {
        type: Sequelize.TEXT,
        field: 'external_id'
      },
      leaseStatus: {
        type: Sequelize.TEXT,
        field: 'lease_status'
      },
      createdAt: {
        type: Sequelize.DATE,
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at'
      },
      deletedAt: {
        type: Sequelize.DATE,
        field: 'deleted_at'
      },
    }, {
      paranoid: true
    });

    this._lease = leaseModel;

    leaseModel.sync();

    debug('initialized');
  }

  /**
   * Fetches all leases from the database.
   *
   * @method  getUsers
   * @return  {Array}  Array of leases.
   */
  getUsers() {
    return this.lease.findAll({
      where: {
        deleted_at: null
      },
      attributes: ['leaseId', 'email', 'mobileNumber', 'externalId', 'leaseStatus']
    });
  }

  /**
   * Fetches a lease from the database.
   *
   * @method  getUserById
   * @param   {Object}   lease   The id of the requested lease.
   * @return  {Object}  The requested lease.
   */
  getUserById(leaseId) {
    return this.lease.findById(leaseId, {
      where: {
        deleted_at: null
      },
      attributes: ['leaseId', 'email', 'mobileNumber', 'externalId', 'leaseStatus']
    });
  }

  /**
   * Creates a lease in the database.
   *
   * @method  createUser
   * @param   {Object}   lease   The new lease.
   * @return  {Object}  The created lease.
   */
  createUser(lease) {
    return this.lease.create(lease, {
        attributes: ['leaseId', 'email', 'mobileNumber', 'externalId', 'leaseStatus']
      })
      .then((lease) => {
        return lease.reload();
      });
  }

  /**
   * Updates a lease in the database.
   *
   * @method  updateUser
   * @param   {Object}  lease  The updated lease data.
   * @return  {Boolean} True if successful.
   */
  updateUser(lease) {
    return this.lease.update(lease, {
        where: {
          lease_id: lease.leaseId,
          deleted_at: null
        }
      })
      .then((updatedUsers) => {
        if (updatedUsers > 0) {
          return true;
        }
        return false;
      });
  }

  /**
   * Deletes a lease from the database.
   *
   * @method  deleteUser
   * @param   {Object}  leaseId  The id of the lease that should be deleted.
   * @return  {Boolean} True if successful.
   */
  deleteUser(leaseId) {
    return this.lease
      .destroy({
        where: {
          lease_id: leaseId,
          deleted_at: null
        }
      })
      .then((deletedUsers) => {
        if (deletedUsers > 0) {
          return true;
        }
        return false;
      });
  }
}

User.configurationSchema = {
  type: 'object',
  properties: {
    database: {
      id: 'database',
      type: 'object'
    },
  },
  required: ['database']
};

module.exports = User;
