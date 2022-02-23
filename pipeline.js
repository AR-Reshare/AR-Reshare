const { PipelineInitialisationError, MissingTemplateError } = require('./classes/errors');
const Pipeline = require('./classes/pipeline');
const RequestTemplateDict = require('./schemas/request-schemas');
const SQLTemplateDict = require('./schemas/sql-templates');
const ResponseTemplateDict = require('./schemas/response-schemas');
const PushTemplateDict = require('./schemas/push-schemas');

class CreateEntityPipeline extends Pipeline {
    // this is an example of a general-purpose pipeline, this one for Entity Creation
    // can be used in app.js as:
    
    // const CreateMessage = new CreateEntityPipeline('message', false, 'affected');
    // app.post('/conversation/message', CreateMessage.Execute);
    
    // for 'misc' pipelines, the same syntax is used generally but there's no need for a constructor,
    // and there'll probably only be one instance of it i.e.

    // const Login = new LoginPipeline();
    // app.post('/account/login', Login.Execute);

    /**
     * Initialises the CreateEntityPipeline
     * @param {string} entityType String describing the type of entity e.g. 'listing'
     * @param {Object} options Dictionary of options to pass, including notify (false, 'affected', or 'self'), auth_mode ('logged_in', 'optional' or 'logged_out'), method ('query' or 'body')
     * @param  {...any} args Arguments to pass to the default pipeline constructor, including Database
     */
    constructor(entityType, options, ...args) {
        super(...args);
        if (typeof entityType !== 'string' && !(entityType instanceof String) || entityType.length === 0) {
            throw new PipelineInitialisationError('entityType must be a non-empty string');
        }
        this.actionType = `create-${entityType}`;
        this.notify = false;
        if ('notify' in options) {
            if (options['notify'] === 'affected' || options['notify'] === 'self' || options['notify'] === false) {
                this.notify = options['notify'];
            } else {
                throw new PipelineInitialisationError('Invalid option for notify');
            }
        }

        this.authMode = 'logged_in';
        if ('auth_mode' in options) {
            if (['logged_in', 'logged_out', 'optional'].includes(options['auth_mode'])) {
                this.authMode = options['auth_mode'];
            } else {
                throw new PipelineInitialisationError('Invalid option for auth_mode');
            }
        }

        this.method = 'body';
        if ('method' in options) {
            if (options['method'] === 'query' || options['method'] === 'body') {
                this.method = options['method'];
            } else {
                throw new PipelineInitialisationError('Invalid option for method');
            }
        }

        this.requestTemplate = RequestTemplateDict[this.actionType];
        if (this.requestTemplate === undefined) {
            throw new MissingTemplateError(`Unable to find request template for ${this.actionType}`);
        }

        this.sqlTemplate = SQLTemplateDict[this.actionType];
        if (this.sqlTemplate === undefined) {
            throw new MissingTemplateError(`Unable to find SQL template for ${this.actionType}`);
        }

        this.responseTemplate = ResponseTemplateDict[this.actionType];
        if (this.responseTemplate === undefined) {
            throw new MissingTemplateError(`Unable to find response template for ${this.actionType}`);
        }
        
        this.pushTemplate = null;
        if (this.notify) {
            this.pushTemplate = PushTemplateDict[this.actionType];
            if (this.pushTemplate === undefined) {
                throw new MissingTemplateError(`Unable to find push notification template for ${this.actionType}`);
            }
        }
    }

    /**
     * Executes the pipeline on a particular request and response
     * @param {Object} req The request object provided by Express
     * @param {Object} res The response object provided by Express
     */
    Execute(req, res) {
        let user_accountID = null;
        let result_final = null;
        let error_final = null;

        // check user's authorisation
        this.SecurityValidate(this.authMode, req.headers.authorization).then(accountID => {
            // build the object to validate
            let inputObject;
            user_accountID = accountID;
            if (this.method === 'query') {
                inputObject = {...req.query, ...req.params};
            } else {
                inputObject = {...req.body};
            }
            inputObject['accountID'] = accountID;
            return this.DataValidate(this.requestTemplate, inputObject);
        }).then(validated => {
            // database operations
            return this.Store(this.sqlTemplate, validated);
        }).then(results => {
            // send notifications as needed
            if (this.notify) {
                let targetAccounts;
                if (this.notify === 'self') {
                    targetAccounts = [user_accountID];
                } else { // this.notify === 'affected'
                    targetAccounts = results[results.length - 1];
                    // Create queries should always have the last row be of affected users' IDs
                }
                this.PushRespond(this.pushTemplate, results, targetAccounts);
            }
            result_final = results;
            return;
        }).catch(err => {
            error_final = err;
            return;
        }).finally(() => {
            // build response
            this.APIRespond(this.responseTemplate, res, result_final, error_final);
        });
    }
}

module.exports = {
    CreateEntityPipeline,
    // ...
    // add other pipeline types here as they are defined
};
