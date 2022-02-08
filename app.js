/* This file will contain the main code of the server. It will connect endpoints to pipeline systems
*/

const app = require('express')();
const pipes = require('./pipeline');
const Database = require('./database-funcs');
const credentials = require('./connection.json');

const db = new Database(credentials['dev']);

// e.g.
const CreateMessage = new CreateEntityPipeline('message', false, 'affected', db, console);
app.post('/conversation/message', CreateMessage.Execute);

module.exports(app);