require('dotenv').config();
const { SERVER_PORT } = process.env;
const express = require('express');
const app = express();

app.use(express.json());

const { seed, createAccount, login } = require('./controller.js');

app.use(express.static(`${__dirname}/../Frontend`));

app.post('/seed', seed);
app.post('/signup', createAccount);
app.post('/login', login);

app.listen(SERVER_PORT, () => console.log(`up on ${SERVER_PORT}`));
