const { QueryExecutionError, ForeignKeyError, UniqueConstraintError, FailedUploadError } = require('./errors');

class Pipeline {
    /**
     * Constructs a Pipeline object
     * @param {Database} db Represents the database service
     * @param {Object} logger Represents the logging service. Default is console
     * @param {Object} emailTransporter Represents the email service. Default is null, if unneeded
     * @param {Object} mediaHandler Represents the media handling service. Default is null, if unneeded
     */
    constructor(db, logger=console, emailTransporter=null, mediaHandler=null) {
        this.db = db; // expected to implement simpleQuery and complexQuery
        this.emailTransporter = emailTransporter;
        this.mediaHandler = mediaHandler;
        this.logger = logger; // expected to implement .log, .error, and .warn

        this.SecurityValidate = this.SecurityValidate.bind(this);
        this.DataValidate = this.DataValidate.bind(this);
        this.Store = this.Store.bind(this);
        this.APIRespond = this.APIRespond.bind(this);
        this.PushRespond = this.PushRespond.bind(this);
        this.MediaHandle = this.MediaHandle.bind(this);
    }

    /**
     * Validates an input object against a security schema
     * @param {SecurityValidate} SecuritySchema An instance of a validation object for a given resource
     * @param {string} token A string that should be a valid JWT token instance
     * @param {object} query An object, most likely request.body or request.query, to validate
     * @returns {Promise<object>} Once resolved, this should return the userID
     */
    SecurityValidate(securitySchema, token, query) {
        return new Promise((resolve, reject) => {
            let userID;
            try {
                if (token) userID = securitySchema.process(this.db, token, query);
                else userID = securitySchema.noToken();
                // console.log(userID);
                resolve(userID);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Validates an input object against a request schema
     * @param {RequestTemplate} requestSchema An instance of RequestTemplate to validate against
     * @param {object} inputObject An object, most likely request.body or request.query, to validate
     * @returns {Promise<object>} Key/value pairs selected from inputObject by requestSchema and sanitised
     */
    DataValidate(requestSchema, inputObject) {
        return new Promise((resolve, reject) => {
            let outputObject;

            try {
                outputObject = requestSchema.process(inputObject);
                resolve(outputObject);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Creates and executes a transaction on the database
     * @param {SQLTemplate} sqlTemplate Template of the SQL transaction, from the SQLTemplate class
     * @param {object} formatObject Object whose values to insert into the transaction
     * @returns 
     */
    Store(sqlTemplate, formatObject) {
        return new Promise((resolve, reject) => {
            
            let names, transaction;
            // build transaction
            try {
                let built = sqlTemplate.build(formatObject);
                names = built[0];
                transaction = built[1];
            } catch (err) {
                reject(err); // 400
            }
            
            let prepAndResolve = (result) => {
                let out;
                try {
                    out = sqlTemplate.prepareResults(names, result);
                    resolve(out);
                } catch (err) {
                    reject(err);
                }
            };

            let prepAndReject = (err) => {
                if (!(err instanceof QueryExecutionError)) {
                    reject(err);
                } else {
                    if (err.code === '23503' || err.message.includes('owner_agrees')) {
                        reject(new ForeignKeyError(err.message));
                    } else if (err.code === '23505') {
                        reject(new UniqueConstraintError(err.message));
                    } else {
                        reject(err);
                    }
                }
            };

            // execute transaction
            if (transaction.length === 0) {
                resolve([]); // no queries, so don't do anything
            } else if (transaction.length === 1) {
                if ('values' in transaction[0]) {
                    this.db.simpleQuery(transaction[0].text, transaction[0].values).then(prepAndResolve, prepAndReject);
                } else {
                    this.db.simpleQuery(transaction[0].text).then(prepAndResolve, prepAndReject);
                }
            } else {
                this.db.complexQuery(transaction).then(prepAndResolve, prepAndReject);
            }
        });
    }

    /**
     * Creates and executes a transaction on the database
     * @param {emailTemplate} emailTemplate Template of the email transaction, from the emailTemplate class
     * @param {object} inputObject Object whose values to insert into the email transaction
     * @returns 
     */
    EmailRespond(emailTemplate, email, argsReplaceObject) {
        return new Promise((resolve, reject) => {
            let out;
            try {
                out = emailTemplate.process(this.emailTransporter, email, argsReplaceObject);
                resolve(out);
            } catch (err){
                reject(err);
            }
        });
    }

    /**
     * Builds and transmits a response
     * @param {ResponseTemplate} responseSchema ResponseTemplate describing this request type
     * @param {Response} res Response object for this request, provided by express
     * @param {Object[][]} inputArray Array of queries, which are arrays of rows, which are objects. Can be the return value of Store, or null 
     * @param {Error} err Error object generated by the pipeline, or null
     * @returns Promise which resolves with the status code and output object, just in case it's needed
     */
    APIRespond(responseSchema, res, inputArray, err=null) {
        return new Promise((resolve, reject) => {
            let statusCode = responseSchema.getStatus(err);
            res.status(statusCode);
            
            let outputObject = null;
            if (statusCode >= 200 && statusCode < 300) {
                outputObject = inputArray === null ? {success: true} : responseSchema.getResponse(inputArray);
                outputObject = Object.keys(outputObject).length === 0 ? {success: true} : outputObject;
            } else {
                outputObject = {
                    error: err.message
                };
            }

            res.send(outputObject);
            
            // mainly returned so that wrappers can check the status code
            resolve({status: statusCode, result: outputObject});
        });
    }


    PushRespond(pushSchema, inputObject, targetAccounts) {
        // pushSchema: an object detailing which values to include in the notification, as per schemas/push-schemas.js
        // inputObject: the object containing values to put into the notification. Can be the dbResponse from Store
        // targetAccounts: an array containing account IDs to send notifications to. Can be empty, can be of length 1

        return new Promise((resolve, reject) => {
            // a notification should be sent to each of the target accounts and
            resolve();
        });
    }

    /**
     * Uploads media to an external service
     * @param {Array<String>} mediaObjects List of data URI strings to upload
     * @returns List of objects representing the media, with {mimetype: String, url: String, index: Number}
     */
    MediaHandle(mediaObjects) {
        return new Promise((resolve, reject) => {
            if (mediaObjects.length === 0) resolve([]);
            const mimetypepattern = /^data:(\w+)\/(\w+);base64,[A-Za-z0-9/+]+=*$/g;
            let out = Array.apply(null, Array(mediaObjects.length));
            let err = null;
            mediaObjects.forEach((item, index) => {
                if (err) throw err; // if one upload broke, stop trying to upload more

                let matches = Array.from(item.matchAll(mimetypepattern))[0];
                // matches = [entire string, mime supertype, mime subtype]
                let resourceType = matches[1];

                this.mediaHandler.upload(item, {resource_type: resourceType}, (error, result) => {
                    if (error) {
                        err = new FailedUploadError('Unable to upload media');
                        reject(err);
                    }
                    out[index] = {
                        url: result.secure_url,
                        mimetype: `${matches[1]}/${matches[2]}`,
                        index: index,
                    };
                    if (out.every(item => item !== undefined)) resolve(out);
                });
            });
        });
    }
}

module.exports = Pipeline;
