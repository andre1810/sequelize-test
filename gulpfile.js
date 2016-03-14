'use strict';

const gulp = require('gulp');
const glob = require('glob');
const Promise = require('bluebird');
const path = require('path');
const fs = require('fs-extra');
const flatten = require('lodash.flatten');
const childProcess = require('child_process');
const runSequence = require('run-sequence');
const gulpConfig = require('./db/gulp_config.json');
const mapSeries = require('promise-map-series');

gulp.task('prepare_migrations', (callback) => {
  return runSequence(
    ['initialize_migrations', 'initialize_models'], ['build_migrations', 'build_models'],
    callback
  );
});
//
// function getMigrator() {
//   return new Promise((resolve, reject) => {
//     const migrator = new Umzug({
//       storage: 'json',
//       logging: console.log,
//       migrations: {
//         params: [sequelize.getQueryInterface(), Sequelize],
//         path: helpers.path.getPath('migration'),
//         pattern: helpers.config.supportsCoffee() ? /\.js$|\.coffee$/ : /\.js$/,
//         wrap: function(fun) {
//           if (fun.length === 3) {
//             return Bluebird.promisify(fun);
//           } else {
//             return fun;
//           }
//         }
//       }
//     });
//
//     sequelize
//       .authenticate()
//       .then(function() {
//         resolve(migrator);
//       })
//       .catch(function(err) {
//         console.error('Unable to connect to database: ' + err);
//         process.exit(1);
//       });
//   });
// }

gulp.task('migrate',
  // ['prepare_migrations'],
  (callback) => {
    // const targetMigrationPath = path.resolve(gulpConfig.migrationsTargetFolder);
    // getGlob(`${targetMigrationPath}/*.js`)
    //   .then((migrations) => {
    //     return orderMigrations(migrations);
    //   })
    //   .then((orderedMigrations) => {
    //     return mapSeries(orderedMigrations, (migration) => {
    //       return executeMigration(migration);
    //     });
    //   })
    //   .then(() => {
    //     callback();
    //   })
    //   .catch((error) => {
    //     callback(error);
    //   });


    migrate()
      .then(() => {
        callback();
      })
      .catch((error) => {
        callback(error);
      });
  });

function executeMigration(migration) {
  console.log(migration);
  return Promise.resolve();
  // return execute(`sequelize db:migrate ${migration}`);
}

gulp.task('initialize_migrations', (callback) => {
  initMigrations()
    .then(() => {
      callback();
    })
    .catch((error) => {
      callback(error);
    });
});

gulp.task('initialize_models', (callback) => {
  initModels()
    .then(() => {
      callback();
    })
    .catch((error) => {
      callback(error);
    });
});

gulp.task('build_migrations', (callback) => {
  getMigrations(gulpConfig.modulesSourceFolder)
    .then((migrations) => {
      const migrationsFolderPath = path.resolve(gulpConfig.migrationsTargetFolder);
      return createFolderIfNotExists(migrationsFolderPath)
        .then(() => {
          return Promise.all(
            migrations.map((migration) => {
              const sourceMigrationPath = path.resolve(process.cwd(), migration);
              const targetMigrationPath = path.resolve(migrationsFolderPath, path.basename(migration));
              return copyFile(sourceMigrationPath, targetMigrationPath);
            })
          );
        });
    }).then(() => {
      callback();
    });
});

gulp.task('build_models', (callback) => {
  getModels(gulpConfig.modulesSourceFolder)
    .then((models) => {
      const modelsFolderPath = path.resolve(gulpConfig.modelsTargetFolder);
      createFolderIfNotExists(modelsFolderPath)
        .then(() => {
          return Promise.all(
            models.map((model) => {
              const sourceModelPath = path.resolve(process.cwd(), model);
              const targetModelPath = path.resolve(modelsFolderPath, path.basename(model));
              return copyFile(sourceModelPath, targetModelPath);
            })
          );
        });
    }).then(() => {
      callback();
    });
});

function initMigrations() {
  return execute('sequelize init:migrations --force');
}

function initModels() {
  return execute('sequelize init:models --force');
}

function migrate() {
  return execute('sequelize db:migrate');
}

function execute(command) {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      console.log(stdout);
      console.error(stderr);
      resolve();
    })
  });
}

function createFolderIfNotExists(path) {
  return new Promise((resolve, reject) => {
    fs.mkdirs(path, (error) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function copyFile(fromPath, toPath) {
  return new Promise((resolve, reject) => {
    fs.copy(fromPath, toPath, (error) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve();
      }
    })
  });
}

function orderMigrations(migrations) {
  const flattened = flatten(migrations);
  return flattened.sort((a, b) => {
    return getComparable(a) - getComparable(b);
  });
}

function getComparable(element) {
  return path.basename(element, '.js').split('-')[0];
}

function getMigrations(path) {
  return new Promise((resolve, reject) => {
    glob(`${path}*`, {}, (error, files) => {
      if (error) {
        reject(error);
      }
      Promise.all(files.map((file) => {
        const keyword = file.substring(path.length);
        return loadMigrations(keyword);
      })).then((files) => {
        const flattened = flatten(files);
        resolve(flattened);
      }).catch((error) => {
        reject(error);
      });
    });
  });
}

function getModels(path) {
  return new Promise((resolve, reject) => {
    glob(`${path}*`, {}, (error, files) => {
      if (error) {
        reject(error);
      }
      Promise.all(files.map((file) => {
        const keyword = file.substring(path.length);
        return loadModel(keyword);
      })).then((files) => {
        const flattened = flatten(files);
        resolve(flattened);
      }).catch((error) => {
        reject(error);
      });
    });
  });
}

function loadMigrations(keyword) {
  return getGlob(`**/${keyword}_service/lib/migrations/*.*`, {
    ignore: `**/index.js`
  });
}

function loadModel(keyword) {
  return getGlob(`**/${keyword}_service/lib/${keyword}.js`, {});
}

function getGlob(path, options) {
  return new Promise((resolve, reject) => {
    glob(path, {}, (error, files) => {
      if (error) {
        reject(error);
      }
      resolve(files);
    })
  });
}
