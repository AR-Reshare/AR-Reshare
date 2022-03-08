const { PipelineInitialisationError, MissingTemplateError } = require('./classes/errors');
const Pipeline = require('./classes/pipeline');
const SecuritySchemaDict = require('./schemas/security-schemas');
const RequestTemplateDict = require('./schemas/request-schemas');
const SQLTemplateDict = require('./schemas/sql-templates');
const ResponseTemplateDict = require('./schemas/response-schemas');
const PushTemplateDict = require('./schemas/push-schemas');
const { AuthenticationHandler } = require('./classes/securityvalidation');

class GeneralPipe extends Pipeline {
    constructor(operation, defaultMethod, entityType, options, ...args) {
        super(...args);
        if (typeof entityType !== 'string' && !(entityType instanceof String) || entityType.length === 0) {
            throw new PipelineInitialisationError('entityType must be a non-empty string');
        }
        this.actionType = `${operation}-${entityType}`;
        this.notify = false;
        if ('notify' in options) {
            if (options['notify'] === 'affected' || options['notify'] === 'self' || options['notify'] === false) {
                this.notify = options['notify'];
            } else {
                throw new PipelineInitialisationError('Invalid option for notify');
            }
        }

        this.method = defaultMethod;
        if ('method' in options) {
            if (options['method'] === 'query' || options['method'] === 'body') {
                this.method = options['method'];
            } else {
                throw new PipelineInitialisationError('Invalid option for method');
            }
        }

        this.securitySchema = SecuritySchemaDict[this.actionType];
        if (this.securitySchema === undefined) {
            throw new MissingTemplateError(`Unable to find security schema for ${this.actionType}`);
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

        this.Execute = this.Execute.bind(this);
    }

    Execute(req, res) {
        let user_accountID = null;
        let result_final = null;
        let error_final = null;
        let inputObject;

        // build the object to validate
        if (this.method === 'query') {
            inputObject = {...req.query, ...req.params};
        } else {
            inputObject = {...req.body};
        }
        
        // check user's authorisation
        return this.SecurityValidate(this.securitySchema, req.headers.authorization, inputObject).then(accountID => {
            user_accountID = accountID;

            // build the object to validate
            if (accountID) inputObject['accountID'] = accountID;
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
                    targetAccounts = results[results.length - 1].map(row => row['userid']);
                    // Queries should always have the last row be of affected users' IDs
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

class CreateEntityPipeline extends GeneralPipe {
    /**
     * Initialises the CreateEntityPipeline
     * @param {string} entityType String describing the type of entity e.g. 'listing'
     * @param {Object} options Dictionary of options to pass, including notify (false, 'affected', or 'self'), method ('query' or 'body')
     * @param  {...any} args Arguments to pass to the default pipeline constructor, including Database
     */
    constructor(entityType, options, ...args) {
        super('create', 'body', entityType, options, ...args);
    }
}

class ModifyEntityPipeline extends GeneralPipe {
    constructor(entityType, options, ...args) {
        super('modify', 'body', entityType, options, ...args);
    }
}

class CloseEntityPipeline extends GeneralPipe {
    constructor(entityType, options, ...args) {
        super('close', 'body', entityType, options, ...args);
    }
}

class ViewEntityPipeline extends GeneralPipe {
    constructor(entityType, options, ...args) {
        super('view', 'query', entityType, options, ...args);
    }
}

class SearchEntityPipeline extends GeneralPipe {
    constructor(entityType, options, ...args) {
        super('search', 'query', entityType, options, ...args);
    }
}

class LoginPipeline extends Pipeline {
    constructor(...args) {
        super(...args);

        // no Security Schema, as only AuthenticationHandler is used

        this.requestTemplate = RequestTemplateDict['login'];
        if (this.requestTemplate === undefined) {
            throw new MissingTemplateError(`Unable to find request template for login`);
        }

        this.sqlTemplate = SQLTemplateDict['login'];
        if (this.sqlTemplate === undefined) {
            throw new MissingTemplateError(`Unable to find SQL template for login`);
        }

        this.responseTemplate = ResponseTemplateDict['login'];
        if (this.responseTemplate === undefined) {
            throw new MissingTemplateError(`Unable to find response template for login`);
        }
        
        // no Push Notifications for now, might want to consider implementing them

        this.Execute = this.Execute.bind(this);
    }

    Execute(req, res) {
        let validated_final = null;
        let result_final = null;
        let error_final = null;

        // validate request
        return this.DataValidate(this.requestTemplate, req.body).then(validated => {
            validated_final = validated;
            // check credentials and create jwt
            return AuthenticationHandler.accountLogin(this.db, validated);
        }).then(jwt => {
            result_final = jwt;
            // store device token
            return this.Store(this.sqlTemplate, validated_final);
        }).catch(err => {
            error_final = err;
            return;
        }).finally(() => {
            // build response
            let status = this.responseTemplate.getStatus(error_final);
            res.status(status);
            if (status === 200) {
                res.set('Authorization', result_final);
            }
            res.end();
            return;
        });
    }
}

class NotImplementedPipeline extends Pipeline {
    constructor (...args) {
        super(...args);

        this.Execute = this.Execute.bind(this);
    }

    Execute(req, res) {
        this.logger.log(`${req.method} ${req.originalUrl} 501`);
        res.status(501).end();
    }
}

class UnknownEndpointPipeline extends Pipeline {
    constructor(...args) {
        super(...args);

        this.Execute = this.Execute.bind(this);
    }

    Execute(req, res) {
        this.logger.log(`${req.method} ${req.originalUrl} 404`);
        res.status(404).end();
    }
}

module.exports = {
    CreateEntityPipeline,
    ModifyEntityPipeline,
    CloseEntityPipeline,
    ViewEntityPipeline,
    SearchEntityPipeline,
    LoginPipeline,
    // ...
    // add other pipeline types here as they are defined
    NotImplementedPipeline,
    UnknownEndpointPipeline,
};
