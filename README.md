# sequelize-test

## Create initial migration for a model
- Initialize sequelize migration for your model
  - This will create the basic folder structure for models expected by the sequelize-cli.
  - Navigate to where your model resides
    - e.g.: `./modules/user/modules/user_service/lib/user.js`
  - Execute in your shell:
    - `sequelize init:migrations`
    - `sequelize init:models`


- Create the initial migration
  - This will create an empty migration with the current timestamp as a starting point.
  - Execute in your shell:
  - `sequelize migration:create --name initial`


- Create a script to replicate the current table schema
  - This will create a sql script that creates the table along with its columns in the database.
  - `pg_dump -O -s -x DATABASE_NAME -t TABLE_NAME | egrep -v "(^SET|^/\*\!)" > migrations/MODEL_NAME.sql`
  - Please replace:
    - DATABASE_NAME
      - with the name of the database that holds the model table
    - TABLE_NAME
      - with the name of the table that stores your model
    - MODEL_NAME
      - with the name of the model you want to create a dump for


- Modify the initial migration to use the sql script
  - This will setup the table with its basic columns in the database when migrating up or drop the corresponding table when migrating down.
  - Copy the whole content of the initial.js base files
    - located at: `./db/base/migrations/initial.js`
  - Replace
    - user.sql in line 11
      - with the name of your previously generated sql script
    - dropTable('users') in line 32
      - with the name of the table that holds your model in the database


- Setup .sequelizerc file to use main config.json  
  - This will enable you to use the database credentials from the main config.json.
  - Copy the file .sequelizerc to where your model resides
    - e.g. `./modules/user/modules/user_service/lib/user.js`
    - located at: `./db/base/.sequelizerc`
  - Make sure the relative path for "config" is set to match the main config.json
    - The main config.json is located at: `./db/config.json`


## Execute migrations

- First prepare executing migrations by running the preparation gulp task
  - This will copy all migrations and models into a single folder structure so that normal sequelize-cli commands can work on them
  - gulp prepare_migrations
- Now you can run any common sequelize-cli commands in the root directory or use the gulp command executing the migrations:
  - gulp migrate
