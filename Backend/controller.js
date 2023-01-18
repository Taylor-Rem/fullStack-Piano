require('dotenv').config();
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
          username VARCHAR,
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
  getSong: (req, res) => {
    console.log(res.data);
  },
};
