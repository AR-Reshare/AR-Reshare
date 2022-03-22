const { PipelineInitialisationError, MissingTemplateError } = require('./classes/errors');
const Pipeline = require('./classes/pipeline');
const SecuritySchemaDict = require('./schemas/security-schemas');
const RequestTemplateDict = require('./schemas/request-schemas');
const SQLTemplateDict = require('./schemas/sql-templates');
const ResponseTemplateDict = require('./schemas/response-schemas');
const PushTemplateDict = require('./schemas/push-schemas');
const EmailTemplateDict = require('./schemas/email-schemas');
const { AuthenticationHandler } = require('./classes/securityvalidation');

class GeneralPipe extends Pipeline {
    /**
     * Constructs a pipeline with a generic Execute function
     * @param {String} operation Operation to perform e.g. "create"
     * @param {String} defaultMethod Default location to search for request parameters, "query" or "body"
     * @param {String} entityType Entity type to perform operation on e.g. "listing"
     * @param {Object} options Dictionary of options to pass, including notify (false, 'affected', or 'self'), email (false, 'affected', or 'self') method ('query' or 'body')
     * @param  {...any} args Arguments to provide to the base Pipeline constructor
     */
    constructor(operation, defaultMethod, entityType, options, ...args) {
        super(...args);
        if (typeof entityType !== 'string' && !(entityType instanceof String) || entityType.length === 0) {
            throw new PipelineInitialisationError('entityType must be a non-empty string');
        }
        this.actionType = `${operation}-${entityType}`;
        this.email = false;
        this.notify = false;
        
        // TODO: The 'notify' and 'email' need to be modified when integrating the components into the pipeline

        if ('notify' in options) {
            if (options['notify'] === 'affected' || options['notify'] === 'self' || options['notify'] === false) {
                this.notify = options['notify'];
            } else {
                throw new PipelineInitialisationError('Invalid option for notify');
            }
        }

        if ('email' in options) {
            if (options['email'] === 'affected' || options['email'] === 'self' || options['email'] === false) {
                this.email = options['email'];
            } else {
                throw new PipelineInitialisationError('Invalid option for email');
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

        this.emailTemplate = null;
        if (this.email) {
            this.emailTemplate = EmailTemplateDict[this.actionType];
            if (this.emailTemplate === undefined) {
                throw new MissingTemplateError(`Unable to find email request template for ${this.actionType}`);
            }
        }

        this.Execute = this.Execute.bind(this);
    }

    /**
     * Executes a pipeline on a request
     * @param {Request} req Request object generated by Express
     * @param {Respones} res Response object generated by Express
     * @returns Promise representing the pipeline's progress
     */
    Execute(req, res) {
        let user_accountID = null;
        let validated_out = null;
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
            validated_out = validated;

            // media handling
            if ('media' in validated_out) return this.MediaHandle(validated_out['media']);
            else return [];
        }).then(urls => {
            // add urls to the validated object
            if (urls.length !== 0) {
                validated_out['url'] = urls.map(item => item.url);
                validated_out['mimetype'] = urls.map(item => item.mimetype);
                validated_out['media_index'] = urls.map(item => item.index);
            }

            // database operations
            return this.Store(this.sqlTemplate, validated_out);
        }).then(results => {
            // TODO: These will need to be modified as we integrate PushRespond and EmailRespond components
            
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

            // send emails as needed
            if (this.email) {
                let targetAccounts;
                if (this.email === 'self') {
                    targetAccounts = [user_accountID];
                } else { // this.email === 'affected'
                    targetAccounts = results[results.length - 1].map(row => row['userid']);
                    // Queries should always have the last row be of affected users' IDs
                }
                this.EmailRespond(this.EmailTemplate, results, targetAccounts);
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
     * @param  {...any} args Arguments to pass to the default pipeline constructor
     */
    constructor(entityType, options, ...args) {
        super('create', 'body', entityType, options, ...args);
    }
}

class ModifyEntityPipeline extends GeneralPipe {
    /**
     * Initialises the ModifyEntityPipeline
     * @param {string} entityType String describing the type of entity e.g. 'listing'
     * @param {Object} options Dictionary of options to pass, including notify (false, 'affected', or 'self'), method ('query' or 'body')
     * @param  {...any} args Arguments to pass to the default pipeline constructor
     */
    constructor(entityType, options, ...args) {
        super('modify', 'body', entityType, options, ...args);
    }
}

class CloseEntityPipeline extends GeneralPipe {
    /**
     * Initialises the CloseEntityPipeline
     * @param {string} entityType String describing the type of entity e.g. 'listing'
     * @param {Object} options Dictionary of options to pass, including notify (false, 'affected', or 'self'), method ('query' or 'body')
     * @param  {...any} args Arguments to pass to the default pipeline constructor
     */
    constructor(entityType, options, ...args) {
        super('close', 'body', entityType, options, ...args);
    }
}

class ViewEntityPipeline extends GeneralPipe {
    /**
     * Initialises the ViewEntityPipeline
     * @param {string} entityType String describing the type of entity e.g. 'listing'
     * @param {Object} options Dictionary of options to pass, including notify (false, 'affected', or 'self'), method ('query' or 'body')
     * @param  {...any} args Arguments to pass to the default pipeline constructor
     */
    constructor(entityType, options, ...args) {
        super('view', 'query', entityType, options, ...args);
    }
}

class SearchEntityPipeline extends GeneralPipe {
    /**
     * Initialises the SearchEntityPipeline
     * @param {string} entityType String describing the type of entity e.g. 'listing'
     * @param {Object} options Dictionary of options to pass, including notify (false, 'affected', or 'self'), method ('query' or 'body')
     * @param  {...any} args Arguments to pass to the default pipeline constructor
     */
    constructor(entityType, options, ...args) {
        super('search', 'query', entityType, options, ...args);
    }
}

class LoginPipeline extends Pipeline {
    /**
     * Initialises the Login pipeline
     * @param  {...any} args Arguments to pass to the default pipeline constructor
     */
    constructor(...args) {
        super(...args);

        // no Security Schema, as only AuthenticationHandler is used

        this.requestTemplate = RequestTemplateDict['login'];
        if (this.requestTemplate === undefined) {
            throw new MissingTemplateError('Unable to find request template for login');
        }

        this.sqlTemplate = SQLTemplateDict['login'];
        if (this.sqlTemplate === undefined) {
            throw new MissingTemplateError('Unable to find SQL template for login');
        }

        this.responseTemplate = ResponseTemplateDict['login'];
        if (this.responseTemplate === undefined) {
            throw new MissingTemplateError('Unable to find response template for login');
        }
        
        // no Push Notifications for now, might want to consider implementing them

        this.Execute = this.Execute.bind(this);
    }

    /**
     * Executes the login pipeline on a request
     * @param {Request} req Request object generated by Express
     * @param {Respones} res Response object generated by Express
     * @returns Promise representing the pipeline's progress
     */
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
                res.send({success: true});
            } else {
                res.send({error: error_final.message || error_final.name});
            }
            return;
        });
    }
}

class RegenerateTokenPipeline extends Pipeline {
    /**
     * Initialises the regenerateToken pipeline
     * @param  {...any} args Arguments to pass to the default pipeline constructor
     */
    constructor(...args) {
        super(...args);

        // no Security Schema, as only AuthenticationHandler is used

        this.requestTemplate = RequestTemplateDict['regenerate-token'];
        if (this.requestTemplate === undefined) {
            throw new MissingTemplateError('Unable to find request template for regenerate-token');
        }

        this.responseTemplate = ResponseTemplateDict['regenerate-token'];
        if (this.responseTemplate === undefined) {
            throw new MissingTemplateError('Unable to find response template for regenerate-token');
        }
        
        // no Push Notifications for now, might want to consider implementing them

        this.Execute = this.Execute.bind(this);
    }

    /**
     * Executes the login pipeline on a request
     * @param {Request} req Request object generated by Express
     * @param {Respones} res Response object generated by Express
     * @returns Promise representing the pipeline's progress
     */
    Execute(req, res) {
        let result_final = null;
        let error_final = null;

        // NOTE: The headers in http are case insensitive. request object seems to lowercase them
        let authObject = {authorization: req.headers['authorization']};
        // validate request
        return this.DataValidate(this.requestTemplate, authObject).then(validated => {
            // check validated jwt
            return AuthenticationHandler.regenerateToken(validated['authorization']);
        }).then(jwt => {
            result_final = jwt;
            return;
        }).catch(err => {
            error_final = err;
            return;
        }).finally(() => {
            // build response
            let status = this.responseTemplate.getStatus(error_final);
            res.status(status);
            if (status === 200) {
                res.set('Authorization', result_final);
                res.send({success: true});
            } else {
                res.send({error: error_final.message || error_final.name});
            }
            return;
        });

    }
}



class NotImplementedPipeline extends Pipeline {
    /**
     * Initialises the NotImplemented pipeline
     * @param  {...any} args Arguments to pass to the default pipeline constructor
     */
    constructor (...args) {
        super(...args);

        this.Execute = this.Execute.bind(this);
    }

    /**
     * Sends a 501 (Not Implemented) status code
     * @param {Request} req Request object generated by Express
     * @param {Respones} res Response object generated by Express
     * @returns Promise representing the pipeline's progress
     */
    Execute(req, res) {
        this.logger.log(`${req.method} ${req.originalUrl} 501`);
        res.status(501).end();
    }
}

class UnknownEndpointPipeline extends Pipeline {
    /**
     * Initialises the UnknownEndpoint pipeline
     * @param  {...any} args Arguments to pass to the default pipeline constructor
     */
    constructor(...args) {
        super(...args);

        this.Execute = this.Execute.bind(this);
    }

    /**
     * Sends a 404 (Not Found) status code
     * @param {Request} req Request object generated by Express
     * @param {Respones} res Response object generated by Express
     * @returns Promise representing the pipeline's progress
     */
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
    RegenerateTokenPipeline, // Needs to be tested
    // ...
    // add other pipeline types here as they are defined
    NotImplementedPipeline,
    UnknownEndpointPipeline,
};
