'use strict';

const async = require('async');
const fs = require('fs');

module.exports = {
  up: function(migration, DataTypes, done) {
    var db = migration.sequelize;
    async.waterfall([
      function(cb) {
        fs.readFile(__dirname + '/lease.sql', function(err, data) {
          if (err) throw err;
          cb(null, data.toString());
        });
      },

      function(initialSchema, cb) {
        // need to split on ';' to get the individual CREATE TABLE sql
        // as db.query can execute on query at a time
        var tables = initialSchema.split(';');

        function createTable(tableSql, doneCreate) {
          db.query(tableSql).then(() => {cb();}).catch((error) => {cb(error);});
        }

        async.each(tables, createTable, cb);
      }
    ], done);
  },

  down: function(migration, DataTypes, done) {
    migration.dropTable('users').then(() => {done();}).catch((error) => {done(error);});
  }
}
