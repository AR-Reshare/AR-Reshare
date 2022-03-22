const express = require('express');
const pipes = require('./pipeline');

class App {
    /**
     * Constructs the app and connects endpoints to pipelines
     * @param {Database} db Represents the database service
     * @param {Object} logger Represents the logging service
     * @param {Object} emailTransporter Represents the email service
     * @param {Object} mediaHandler Represents the media handling service
     */
    constructor(db, logger, emailTransporter, mediaHandler) {
        let app = express();
        app.use(express.json({limit: '50mb'}));
        // NOTE: NA here refers to notImplementedPipelines, which differentiates from NA (noAuth) in SecurityValidate
        const NA = new pipes.NotImplementedPipeline(db, logger); // for unimplemented endpoints
        const NF = new pipes.UnknownEndpointPipeline(db, logger);

        // one pipeline instance per endpoint
        const RegenerateToken = NA;
        const RequestReset = NA;
        const ExecuteReset = NA;
        const ListCategories = new pipes.SearchEntityPipeline('category', {}, db, logger);
        const CreateAccount = new pipes.CreateEntityPipeline('account', {}, db, logger, emailTransporter, mediaHandler); // (in question - see issue #25)
        const CloseAccount = new pipes.CloseEntityPipeline('account', {}, db, logger);
        const Login = new pipes.LoginPipeline(db, logger);
        const ModifyAccount = new pipes.ModifyEntityPipeline('account', {}, db, logger, emailTransporter, mediaHandler);
        const ViewAccountListing = new pipes.ViewEntityPipeline('accountListing', {}, db, logger);
        const SearchAccountListing = new pipes.SearchEntityPipeline('accountListing', {}, db, logger);
        const SearchSavedListing = NA; //SearchEntity
        const SaveListing = NA; // CreateEntity
        const ForgetListing = NA; // CloseEntity
        const ListAddresses = new pipes.SearchEntityPipeline('address', {}, db, logger);
        const ViewListing = new pipes.ViewEntityPipeline('listing', {}, db, logger);
        const SearchListing = new pipes.SearchEntityPipeline('listing', {}, db, logger);
        const CreateListing = new pipes.CreateEntityPipeline('listing', {}, db, logger, null, mediaHandler);
        const ModifyListing = new pipes.ModifyEntityPipeline('listing', {}, db, logger, null, mediaHandler);
        const CloseListing = new pipes.CloseEntityPipeline('listing', {}, db, logger);
        const CreateConversation = new pipes.CreateEntityPipeline('conversation', {}, db, logger);
        const CloseConversation = new pipes.CloseEntityPipeline('conversation', {}, db, logger);
        const CreateMessage = new pipes.CreateEntityPipeline('message', {}, db, logger, null, mediaHandler);
        const ListConversation = new pipes.SearchEntityPipeline('conversation', {}, db, logger);
        const ViewConversation = new pipes.ViewEntityPipeline('conversation', {}, db, logger);

        // serve the docs directory statically, so the index page becomes the API docs
        app.use(express.static('docs'));
        
        // connect endpoints to their relevant pipeline instances
        app.post('/token/regeneration', RegenerateToken.Execute);
        app.post('/passwordResetRequest', RequestReset.Execute);
        app.post('/passwordResetExecute', ExecuteReset.Execute);

        app.get('/categories/list', ListCategories.Execute);

        app.put('/account/create', CreateAccount.Execute);
        app.patch('/account/close', CloseAccount.Execute);
        app.post('/account/login', Login.Execute);
        app.patch('/account/modify', ModifyAccount.Execute);
        app.get('/account/listing/view', ViewAccountListing.Execute);
        app.get('/account/listings/search', SearchAccountListing.Execute);
        app.get('/account/saved-listings/search', SearchSavedListing.Execute);
        app.post('/account/saved-listings/create', SaveListing.Execute);
        app.post('/account/saved-listings/delete', ForgetListing.Execute);
        app.get('/account/addresses/list', ListAddresses.Execute);
        
        app.get('/listing/view', ViewListing.Execute);
        app.get('/listings/search', SearchListing.Execute);
        app.put('/listing/create', CreateListing.Execute);
        app.patch('/listing/modify', ModifyListing.Execute);
        app.patch('/listing/close', CloseListing.Execute);
        
        app.put('/conversation/create', CreateConversation.Execute);
        app.patch('/conversation/close', CloseConversation.Execute);
        app.put('/conversation/message', CreateMessage.Execute);
        app.get('/conversations', ListConversation.Execute);
        app.get('/conversation/view', ViewConversation.Execute);

        app.use(NF.Execute); // handle wrong URLs

        this.app = app;
        this.listen = this.listen.bind(this);
    }

    /**
     * Binds the app to a port
     * @param {Number} port Port number to bind the app to
     * @param {CallableFunction} cb Callback to execute when the app is bound
     */
    listen(port, cb) {
        this.app.listen(port, cb);
    }
}

module.exports = App;
