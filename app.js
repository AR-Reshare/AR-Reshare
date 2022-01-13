/* This file will contain the main code of the server. It will connect endpoints to pipeline systems
*/

const app = require('express')();
const pipes = require('./pipeline');

// e.g.
const CreateMessage = new CreateEntityPipeline('message', false, 'affected');
app.post('/conversation/message', CreateMessage.Execute);

module.exports(app);