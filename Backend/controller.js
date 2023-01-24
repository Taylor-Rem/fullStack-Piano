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
          user_id INT NOT NULL REFERENCES users(user_id),
          song_name VARCHAR,
          song VARCHAR
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
      SELECT * FROM users WHERE users.user_name = '${username}'
      `
      )
      .then((dbRes) => {
        if (dbRes[0].length === 0) {
          res.status(200).send(`username ${username} does not exist`);
          return;
        }
        if (bcrypt.compareSync(password, dbRes[0][0].hash)) {
          sequelize
            .query(
              `
            SELECT * FROM song
            WHERE song.user_id = ${dbRes[0][0].user_id}
            `
            )
            .then((dbRes2) => {
              let obj = { ...dbRes[0][0], songs: dbRes2[0] };
              delete obj.hash;
              res.send(obj);
            });
        } else {
          res.status(200).send('Wrong password. Please try again');
        }
      });
  },
  songSave: (req, res) => {
    let { songName, song, userId } = req.body;
    song = JSON.stringify(song);
    sequelize.query(
      `
      INSERT INTO song(song_name, song, user_id)
      VALUES('${songName}', '${song}', ${userId})
      `
    );
    res.status(200).send(req.body);
  },
  deleteSong: (req, res) => {
    let { songName } = req.params;
    sequelize
      .query(
        `
      DELETE FROM song WHERE song_name = '${songName}'
      `
      )
      .then((dbRes) => {
        res.send(`deleted ${songName} from profile`);
      });
  },
};
