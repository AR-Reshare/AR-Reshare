/* This file will contain the main code of the server. It will connect endpoints to pipeline systems
*/

const app = require('express')();
const pipes = require('./pipeline');
const Logger = require('./classes/logger');
const Database = require('./classes/database');
const credentials = require('./connection.json');

const db = new Database(credentials['db']);
const log = new Logger();

// e.g.
// const CreateMessage = new pipes.CreateEntityPipeline('message', false, 'affected', db, console);
// app.post('/conversation/message', CreateMessage.Execute);

const NA = new pipes.NotImplementedPipeline(db, log);

app.get('/', NA.Execute);
app.post('/token/regeneration', NA.Execute);

app.post('/account/create', NA.Execute);
app.post('/account/close', NA.Execute);
app.post('/account/login', NA.Execute);
app.put('/account/modify', NA.Execute);
app.get('/account/listing/view', NA.Execute);
app.get('/account/listings/search', NA.Execute);
app.put('/account/reset-request', NA.Execute);
app.put('/account/reset-execute', NA.Execute);

app.get('/listing/view', NA.Execute);
app.get('/listings/search', NA.Execute);
app.post('/listing/create', NA.Execute);
app.post('/listing/modify', NA.Execute);
app.post('/listing/close', NA.Execute);

app.post('/conversation/create', NA.Execute);
app.post('/conversation/close', NA.Execute);
app.post('/conversation/message', NA.Execute);
app.get('/conversations', NA.Execute);
app.get('/conversation/view', NA.Execute);

module.exports = app;
