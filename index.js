'use strict';

const logger = require('winston');

require('./sequelize');

const User = require('./user');
const UserTwo = require('./user_two');
const Lease = require('./lease');


User.create({
  username: 'test',
  birthday: new Date(1986, 6, 28),
}).then(function (testUser) {

  UserTwo.findById(testUser.id).then(function(myUser) {

    Lease.create({ payload: 'xyz', UserId: myUser.id }).then(function (lease) {
      logger.info('done: ' + lease.id);
    });
  });
});
