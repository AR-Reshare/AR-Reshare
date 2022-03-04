const express = require('express');
const bodyParser = require('body-parser');
const pipes = require('./pipeline');

class App {
    constructor(db, logger) {
        let app = express();
        app.use(bodyParser.json());
        // NOTE: NA here refers to notImplementedPipelines, which differentiates from NA (noAuth) in SecurityValidate
        const NA = new pipes.NotImplementedPipeline(db, logger); // for unimplemented endpoints
        const NF = new pipes.UnknownEndpointPipeline(db, logger);

        // one pipeline instance per endpoint
        const Index = NA;
        const RegenerateToken = NA;
        const CreateAccount = NA; // CreateEntity (in question - see issue #25)
        const CloseAccount = NA; // CloseEntity
        const Login = new pipes.LoginPipeline(db, logger);
        const ModifyAccount = NA; // ModifyEntity
        const ViewAccountListing = NA; // ViewEntity
        const SearchAccountListing = NA; // SearchEntity
        const SearchSavedListing = NA; //SearchEntity
        const RequestReset = NA;
        const ExecuteReset = NA;
        const ViewListing = NA; // ViewEntity
        const SearchListing = NA; // SearchEntity
        const CreateListing = new pipes.CreateEntityPipeline('listing', {}, db, logger); // CreateEntity
        const ModifyListing = NA; // ModifyEntity
        const CloseListing = NA; // CloseEntity
        const CreateConversation = NA; // CreateEntity
        const CloseConversation = NA; // CloseEntity
        const CreateMessage = NA; // CreateEntity
        const ListConversation = NA; // SearchEntity
        const ViewConversation = NA; // ViewEntity
        
        // connect endpoints to their relevant pipeline instances
        app.get('/', Index.Execute);
        app.post('/token/regeneration', RegenerateToken.Execute);
        
        app.post('/account/create', CreateAccount.Execute);
        app.post('/account/close', CloseAccount.Execute);
        app.post('/account/login', Login.Execute);
        app.put('/account/modify', ModifyAccount.Execute);
        app.get('/account/listing/view', ViewAccountListing.Execute);
        app.get('/account/listings/search', SearchAccountListing.Execute);
        app.get('/account/saved-listings/search', SearchSavedListing.Execute);

        // The below paths are in question. See issue #24
        // app.put('/account/reset-request', RequestReset.Execute);
        // app.put('/account/reset-execute', ExecuteReset.Execute);
        
        app.get('/listing/view', ViewListing.Execute);
        app.get('/listings/search', SearchListing.Execute);
        app.post('/listing/create', CreateListing.Execute);
        app.put('/listing/modify', ModifyListing.Execute);
        app.post('/listing/close', CloseListing.Execute);
        
        app.post('/conversation/create', CreateConversation.Execute);
        app.post('/conversation/close', CloseConversation.Execute);
        app.post('/conversation/message', CreateMessage.Execute);
        app.get('/conversations', ListConversation.Execute);
        app.get('/conversation/view', ViewConversation.Execute);

        app.use(NF.Execute); // handle wrong URLs

        this.app = app;
        this.listen = this.listen.bind(this);
    }

    listen(port, cb) {
        this.app.listen(port, cb);
    }
}

module.exports = App;
