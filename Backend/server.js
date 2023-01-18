require('dotenv').config();
const { SERVER_PORT } = process.env;
const express = require('express');
const app = express();

const { seed, getSong } = require('./controller.js');

app.use(express.static(`${__dirname}/../Frontend`));

app.post('/seed', seed);

app.listen(SERVER_PORT, () => console.log(`up on ${SERVER_PORT}`));
