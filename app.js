const express = require('express');
const pipes = require('./pipeline');

class App {
    constructor(db, console) {
        let app = express();

        const NA = new pipes.NotImplementedPipeline(db, console);
        
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

        this.app = app;
        this.listen = this.listen.bind(this);
    }

    listen(port, cb) {
        this.app.listen(port, cb);
    }
}

// e.g.
// const CreateMessage = new pipes.CreateEntityPipeline('message', false, 'affected', db, console);
// app.post('/conversation/message', CreateMessage.Execute);


module.exports = App;
