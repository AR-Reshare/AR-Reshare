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
        const RequestReset = NA;
        const ExecuteReset = NA;
        const ListCategories = new pipes.SearchEntityPipeline('category', {}, db, logger);
        const CreateAccount = NA; // CreateEntity (in question - see issue #25)
        const CloseAccount = NA; // CloseEntity
        const Login = new pipes.LoginPipeline(db, logger);
        const ModifyAccount = NA; // ModifyEntity
        const ViewAccountListing = new pipes.ViewEntityPipeline('accountListing', {}, db, logger);
        const SearchAccountListing = NA; // SearchEntity
        const SearchSavedListing = NA; //SearchEntity
        const ListAddresses = new pipes.SearchEntityPipeline('address', {}, db, logger);
        const ViewListing = new pipes.ViewEntityPipeline('listing', {}, db, logger); // TODO: test media
        const SearchListing = new pipes.SearchEntityPipeline('listing', {}, db, logger); // TODO: test
        const CreateListing = new pipes.CreateEntityPipeline('listing', {}, db, logger); // TODO: media upload
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
        app.post('/passwordResetRequest', RequestReset.Execute);
        app.post('/passwordResetExecute', ExecuteReset.Execute);

        app.get('/categories/list', ListCategories.Execute);

        app.post('/account/create', CreateAccount.Execute);
        app.post('/account/close', CloseAccount.Execute);
        app.post('/account/login', Login.Execute);
        app.put('/account/modify', ModifyAccount.Execute);
        app.get('/account/listing/view', ViewAccountListing.Execute);
        app.get('/account/listings/search', SearchAccountListing.Execute);
        app.get('/account/saved-listings/search', SearchSavedListing.Execute);
        app.get('/account/addresses/list', ListAddresses.Execute);
        
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
