require('dotenv').config();
const bcrypt = require('bcryptjs');
const { CONNECTION_STRING } = process.env;
const Sequelize = require('sequelize');
const sequelize = new Sequelize(CONNECTION_STRING, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

module.exports = {
  seed: (req, res) => {
    sequelize
      .query(
        `
        DROP TABLE IF EXISTS song;
        DROP TABLE IF EXISTS users;
        CREATE TABLE users (
          user_id SERIAL PRIMARY KEY,
          user_name VARCHAR,
          hash VARCHAR
        );
        CREATE TABLE song (
          song_id SERIAL PRIMARY KEY,
          users INT NOT NULL REFERENCES users(user_id),
          song_name VARCHAR
        );
      `
      )
      .then(() => res.sendStatus(200));
  },
  createAccount: (req, res) => {
    let { username, password } = req.body;
    username = username.toLowerCase();
    const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(5));
    sequelize
      .query(
        `
      SELECT * FROM users WHERE user_name = '${username}'
      `
      )
      .then((dbRes) => {
        if (dbRes[0].length === 0) {
          sequelize.query(
            `
            INSERT INTO users(user_name, hash) VALUES('${username}', '${hash}')
            `
          );
          res.status(200).send(`user created under username: ${username}`);
        } else {
          res.status(200).send('username taken');
        }
      });
  },
  login: (req, res) => {
    let { username, password } = req.body;
    sequelize
      .query(
        `
      SELECT * FROM users WHERE user_name = '${username}'
      `
      )
      .then((dbRes) => {
        if (dbRes[0].length === 0) {
          res.status(200).send(`username ${username} does not exist`);
          return;
        }
        if (bcrypt.compareSync(password, dbRes[0][0].hash)) {
          res.status(200).send(`logged in under username: ${username}`);
        } else {
          res.status(200).send('Wrong password. Please try again');
        }
      });
  },
};
